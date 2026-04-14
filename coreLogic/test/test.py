# test.py
# -*- coding: utf-8 -*-

from __future__ import annotations

import os
import sys
import re
import csv
import json
import time
import argparse
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple, Optional

import numpy as np
from sentence_transformers import SentenceTransformer

K_VALUES = [1, 3, 5, 10]
MAX_TOP_K = max(K_VALUES)
TRUE_THRESHOLD = float(os.getenv("TRUE_THRESHOLD", "0.7"))  

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from model.retrieval import smart_semantic_search


EMBED_MODEL_NAME = os.getenv(
    "EMBED_MODEL_NAME", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)


TITLE_RE = re.compile(r"^\s*\[TITLE\]\s*(.*)$", re.IGNORECASE | re.MULTILINE)
CONTENT_RE = re.compile(r"\[CONTENT\]\s*(.*)$", re.IGNORECASE | re.DOTALL)

_WORD_RE = re.compile(r"(?u)\b[\wÀ-ỹ]{2,}\b")

STOPWORDS = set(
    """
    là và của cho với từ một những các cái này đó ở tại trong ngoài trên dưới khi như vì do
    tôi bạn em anh chị chúng ta họ nó mà để đã đang sẽ
    the a an and or for from of to in on at by about into over after before under above between
    is are was were be been being this that these those here there where who what which why how
    """.split()
)

def norm_text(s: str) -> str:
    s = (s or "").lower().strip()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[\"'“”‘’]", "", s)
    s = re.sub(r"[^\w\s\-]", "", s)
    return s


def extract_title_content(text: str) -> Tuple[str, str]:
    title, content = "", ""
    if not text:
        return title, content

    m1 = TITLE_RE.search(text)
    if m1:
        title = m1.group(1).strip()

    m2 = CONTENT_RE.search(text)
    if m2:
        content = m2.group(1).strip()

    if not title and not content:
        content = text.strip()

    return title, content


def get_keywords(text: str) -> List[str]:
    s = norm_text(text)
    toks = _WORD_RE.findall(s)
    out: List[str] = []
    seen = set()
    for t in toks:
        if t in STOPWORDS:
            continue
        if t in seen:
            continue
        seen.add(t)
        out.append(t)
    return out


def load_json_or_jsonl(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read().strip()

    if not raw:
        return []

    # JSON lines
    if raw.startswith("{") and "\n" in raw:
        return [json.loads(line) for line in raw.splitlines() if line.strip()]

    obj = json.loads(raw)
    if isinstance(obj, list):
        return obj
    if isinstance(obj, dict) and "data" in obj:
        return obj["data"]

    raise ValueError("Unsupported dataset format")


def extract_fields(item: Dict[str, Any]) -> Tuple[str, str, str]:
    query = (item.get("question") or item.get("query") or item.get("q") or "").strip()
    expected_title = (
        item.get("title") or item.get("expected_title") or item.get("doc_title") or ""
    ).strip()
    expected_context = (
        item.get("context")
        or item.get("expected_context")
        or item.get("paragraph")
        or item.get("passage")
        or item.get("content")
        or item.get("answer")
        or ""
    ).strip()
    return query, expected_title, expected_context


_CTX_MODEL: Optional[SentenceTransformer] = None


def get_ctx_model() -> SentenceTransformer:
    global _CTX_MODEL
    if _CTX_MODEL is None:
        print(f"[test] Loading context model: {EMBED_MODEL_NAME}")
        _CTX_MODEL = SentenceTransformer(EMBED_MODEL_NAME)
    return _CTX_MODEL


def embed_text(text: str) -> np.ndarray:
    model = get_ctx_model()
    vecs = model.encode(
        [text],
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return np.asarray(vecs[0], dtype=np.float32)


def cosine_clamped(v1: np.ndarray, v2: np.ndarray) -> float:
    if v1 is None or v2 is None:
        return 0.0
    sim = float(np.dot(v1, v2))
    sim = max(-1.0, min(1.0, sim))
    return 0.0 if sim < 0 else sim  


def title_score(expected: str, got: str) -> float:
    """
    - 1.0 nếu match full (sau normalize)
    - 0.6 nếu keyword quan trọng trùng >= 50%
    - 0.0 nếu còn lại
    """
    if not expected or not got:
        return 0.0

    exp_norm = norm_text(expected)
    got_norm = norm_text(got)

    if not exp_norm or not got_norm:
        return 0.0

    if exp_norm == got_norm:
        return 1.0

    exp_kw = get_keywords(exp_norm)
    got_kw = get_keywords(got_norm)

    if not exp_kw or not got_kw:
        return 0.0

    set_exp = set(exp_kw)
    set_got = set(got_kw)
    inter = len(set_exp & set_got)
    if inter == 0:
        return 0.0

    ratio = inter / float(len(set_exp))
    if ratio >= 0.5:
        return 0.6

    return 0.0


def context_score(
    expected_context: str,
    got_context: str,
    expected_vec: Optional[np.ndarray] = None,
) -> float:
    """
    - 1.0 nếu overlap keyword >= 70%
    - cosine similarity nếu có overlap nhưng < 70%
    - 0.0 nếu không overlap keyword
    """
    if not expected_context or not got_context:
        return 0.0

    exp_norm = norm_text(expected_context)
    got_norm = norm_text(got_context)

    if not exp_norm or not got_norm:
        return 0.0

    exp_kw = get_keywords(exp_norm)
    got_kw = get_keywords(got_norm)

    if not exp_kw or not got_kw:
        return 0.0

    set_exp = set(exp_kw)
    set_got = set(got_kw)
    inter = len(set_exp & set_got)

    if inter == 0:
        return 0.0

    ratio = inter / float(len(set_exp))

    if ratio >= 0.7:
        return 1.0

    if expected_vec is None:
        expected_vec = embed_text(exp_norm)
    got_vec = embed_text(got_norm)
    return cosine_clamped(expected_vec, got_vec)


@dataclass
class EvalStats:
    n: int = 0
    title_scores: Dict[int, List[float]] = None
    context_scores: Dict[int, List[float]] = None
    total_scores: Dict[int, List[float]] = None
    times: List[float] = None

    def __post_init__(self):
        if self.title_scores is None:
            self.title_scores = {k: [] for k in K_VALUES}
        if self.context_scores is None:
            self.context_scores = {k: [] for k in K_VALUES}
        if self.total_scores is None:
            self.total_scores = {k: [] for k in K_VALUES}
        if self.times is None:
            self.times = []

def run_test(
    items: List[Dict[str, Any]],
    out_csv: str,
    true_path: str,
    fail_path: str,
) -> Tuple[EvalStats, float]:
    stats = EvalStats()

    os.makedirs(os.path.dirname(out_csv), exist_ok=True)
    os.makedirs(os.path.dirname(true_path), exist_ok=True)
    os.makedirs(os.path.dirname(fail_path), exist_ok=True)

    true_samples: List[Dict[str, Any]] = []
    fail_samples: List[Dict[str, Any]] = []

    fieldnames = [
        "id",
        "query",
        "expected_title",
        "expected_context",
        "top1_title_score",
        "top1_context_score",
        "top1_total_score",
        "top3_title_score",
        "top3_context_score",
        "top3_total_score",
        "top5_title_score",
        "top5_context_score",
        "top5_total_score",
        "top10_title_score",
        "top10_context_score",
        "top10_total_score",
        "latency_ms",
    ]

    total = len(items)
    print(f"\n🚀 Running test on {total} samples\n")

    t_start_all = time.perf_counter()

    with open(out_csv, "w", encoding="utf-8", newline="") as f_csv:
        writer = csv.DictWriter(f_csv, fieldnames=fieldnames)
        writer.writeheader()

        for idx, item in enumerate(items, 1):
            query, expected_title, expected_context = extract_fields(item)
            if not query or not expected_title or not expected_context:
                continue

            # search
            t0 = time.perf_counter()
            _, results = smart_semantic_search(query, top_k=MAX_TOP_K)
            latency_ms = (time.perf_counter() - t0) * 1000.0
            stats.times.append(latency_ms)
            stats.n += 1

            # lấy candidates
            cand_titles: List[str] = []
            cand_contexts: List[str] = []

            for r in results:
                raw_text, _sf, title, formatted, _score = r
                t, c = extract_title_content(formatted or raw_text)
                title = title or t
                context = c or raw_text
                cand_titles.append(title)
                cand_contexts.append(context)

            # nếu không có kết quả nào
            if not cand_titles:
                for k in K_VALUES:
                    stats.title_scores[k].append(0.0)
                    stats.context_scores[k].append(0.0)
                    stats.total_scores[k].append(0.0)
                fail_samples.append(
                    {
                        "id": idx,
                        "question": query,
                        "expected_title": expected_title,
                        "expected_context": expected_context,
                        "pred_title": "",
                        "pred_context": "",
                        "title_score": 0.0,
                        "context_score": 0.0,
                        "total_score": 0.0,
                    }
                )
                writer.writerow(
                    {
                        "id": idx,
                        "query": query,
                        "expected_title": expected_title,
                        "expected_context": expected_context,
                        "top1_title_score": "0.0000",
                        "top1_context_score": "0.0000",
                        "top1_total_score": "0.0000",
                        "top3_title_score": "0.0000",
                        "top3_context_score": "0.0000",
                        "top3_total_score": "0.0000",
                        "top5_title_score": "0.0000",
                        "top5_context_score": "0.0000",
                        "top5_total_score": "0.0000",
                        "top10_title_score": "0.0000",
                        "top10_context_score": "0.0000",
                        "top10_total_score": "0.0000",
                        "latency_ms": f"{latency_ms:.2f}",
                    }
                )
                continue

            # tính score cho từng candidate
            exp_vec = embed_text(norm_text(expected_context))
            cand_title_scores: List[float] = []
            cand_context_scores: List[float] = []
            cand_total_scores: List[float] = []

            for t_pred, c_pred in zip(cand_titles, cand_contexts):
                ts = title_score(expected_title, t_pred)
                cs = context_score(expected_context, c_pred, expected_vec=exp_vec)
                total_s = 0.5 * ts + 0.5 * cs
                cand_title_scores.append(ts)
                cand_context_scores.append(cs)
                cand_total_scores.append(total_s)

            # thống kê cho từng K
            row: Dict[str, Any] = {
                "id": idx,
                "query": query,
                "expected_title": expected_title,
                "expected_context": expected_context,
                "latency_ms": f"{latency_ms:.2f}",
            }

            for k in K_VALUES:
                limit = min(k, len(cand_titles))
                if limit <= 0:
                    best_t = best_c = best_total = 0.0
                else:
                    best_t = best_c = best_total = -1.0
                    for i in range(limit):
                        ts = cand_title_scores[i]
                        cs = cand_context_scores[i]
                        tt = 0.5 * ts + 0.5 * cs
                        if tt > best_total:
                            best_total = tt
                            best_t = ts
                            best_c = cs
                    best_t = max(0.0, min(1.0, best_t if best_t >= 0 else 0.0))
                    best_c = max(0.0, min(1.0, best_c if best_c >= 0 else 0.0))
                    best_total = max(0.0, min(1.0, best_total if best_total >= 0 else 0.0))

                stats.title_scores[k].append(best_t)
                stats.context_scores[k].append(best_c)
                stats.total_scores[k].append(best_total)

                row[f"top{k}_title_score"] = f"{best_t:.4f}"
                row[f"top{k}_context_score"] = f"{best_c:.4f}"
                row[f"top{k}_total_score"] = f"{best_total:.4f}"

            writer.writerow(row)

            # phân loại true / fail dựa trên top-10
            best_idx_top10 = int(np.argmax(cand_total_scores[:10]))
            best_total_top10 = cand_total_scores[best_idx_top10]
            best_title = cand_titles[best_idx_top10]
            best_context = cand_contexts[best_idx_top10]

            sample_obj = {
                "id": idx,
                "question": query,
                "expected_title": expected_title,
                "expected_context": expected_context,
                "pred_title": best_title,
                "pred_context": best_context,
                "title_score": float(cand_title_scores[best_idx_top10]),
                "context_score": float(cand_context_scores[best_idx_top10]),
                "total_score": float(best_total_top10),
            }

            if best_total_top10 >= TRUE_THRESHOLD:
                true_samples.append(sample_obj)
            else:
                fail_samples.append(sample_obj)

            # progress
            if idx % 10 == 0 or idx == total:
                pct = 100.0 * idx / total
                avg_latency = float(np.mean(stats.times)) if stats.times else 0.0
                print(
                    f"\r[{idx}/{total} | {pct:.1f}%] avg_latency={avg_latency:.1f}ms",
                    end="",
                    flush=True,
                )

    total_time = time.perf_counter() - t_start_all
    print(f"\n\n✅ Test completed in {total_time:.2f} seconds")

    # ghi file true / fail
    with open(true_path, "w", encoding="utf-8") as f_t:
        json.dump(true_samples, f_t, ensure_ascii=False, indent=2)

    with open(fail_path, "w", encoding="utf-8") as f_f:
        json.dump(fail_samples, f_f, ensure_ascii=False, indent=2)

    print(f"  → Saved TRUE samples to: {true_path} (n={len(true_samples)})")
    print(f"  → Saved FAIL samples to: {fail_path} (n={len(fail_samples)})")

    return stats, total_time

def report(stats: EvalStats, dataset_total: int, total_time_s: float):
    times = np.array(stats.times) if stats.times else np.array([0.0])

    def mean_safe(xs: List[float]) -> float:
        return float(np.mean(xs)) if xs else 0.0

    print("\n===== RETRIEVAL EVALUATION (Title + Context) =====")
    print(f"Total items in dataset : {dataset_total}")
    print(f"Evaluated queries      : {stats.n}")
    print(f"Skipped (missing fields): {dataset_total - stats.n}")
    print("")

    for k in K_VALUES:
        title_acc = mean_safe(stats.title_scores[k])
        ctx_acc = mean_safe(stats.context_scores[k])
        total_acc = 0.5 * title_acc + 0.5 * ctx_acc
        print(f"Top-{k}:")
        print(f"  accuracy_title   : {title_acc:.4f}")
        print(f"  accuracy_context : {ctx_acc:.4f}")
        print(f"  accuracy_total   : {total_acc:.4f}")
        print("")

    if stats.n > 0:
        print("Latency (ms):")
        print(f"  Avg  : {times.mean():.2f}")
        print(f"  P50  : {np.percentile(times, 50):.2f}")
        print(f"  P90  : {np.percentile(times, 90):.2f}")
        print(f"  P95  : {np.percentile(times, 95):.2f}")
        print("")
        print(f"Total wall time: {total_time_s:.2f} s")
        print(f"Avg per-query  : {1000.0 * total_time_s / max(1, stats.n):.2f} ms/query")
        print(f"Throughput     : {stats.n / max(1.0, total_time_s):.2f} queries/s")
    else:
        print("No valid queries were evaluated.")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--data",
        default="test/test_gem0.8.json",
        help="Path to test dataset JSON/JSONL",
    )
    args = ap.parse_args()

    # ===== tạo folder kết quả theo lần chạy =====
    ts = time.strftime("%Y-%m-%d_%H-%M-%S")
    run_dir = os.path.join("test", "results", f"run_{ts}")
    os.makedirs(run_dir, exist_ok=True)

    out_csv = os.path.join(run_dir, "per_query_scores.csv")
    true_out = os.path.join(run_dir, "testtrue.json")
    fail_out = os.path.join(run_dir, "testfail.json")
    summary_out = os.path.join(run_dir, "summary_topk.json")

    items = load_json_or_jsonl(args.data)
    if not items:
        print("❌ Empty dataset")
        return

    dataset_total = len(items)

    stats, total_time = run_test(
        items=items,
        out_csv=out_csv,
        true_path=true_out,
        fail_path=fail_out,
    )

    report(stats, dataset_total=dataset_total, total_time_s=total_time)

    # ===== ghi thêm summary accuracy + time =====
    def mean_safe(xs):
        return float(np.mean(xs)) if xs else 0.0

    summary = {
        "total_samples": dataset_total,
        "evaluated_samples": stats.n,
        "total_time_sec": round(total_time, 4),
        "avg_time_per_query_ms": round(
            1000.0 * total_time / max(1, stats.n), 2
        ),
        "accuracy": {
            f"top_{k}": round(mean_safe(stats.total_scores[k]), 4)
            for k in K_VALUES
        },
    }

    with open(summary_out, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\n📄 Results saved in: {run_dir}")

if __name__ == "__main__":
    main()