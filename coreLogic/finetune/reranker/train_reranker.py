from __future__ import annotations

import os
import sys
import json
import random
import argparse
from typing import Any, Dict, List, Tuple

import numpy as np
from torch.utils.data import DataLoader
from sentence_transformers import CrossEncoder, InputExample


THIS_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(THIS_DIR, "..", ".."))

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

DEFAULT_DATASET_PATH = os.path.join(THIS_DIR, "dataset.json")
DEFAULT_MODEL_OUT = os.path.join(THIS_DIR, "model")


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _read_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_json(path: str, obj: Any) -> None:
    _ensure_dir(os.path.dirname(path))
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def _list_tree(root: str) -> List[str]:
    out: List[str] = []
    if not os.path.exists(root):
        return out
    for r, ds, fs in os.walk(root):
        for d in ds:
            out.append(os.path.join(r, d))
        for fn in fs:
            out.append(os.path.join(r, fn))
    return out


def _has_model_files(model_dir: str) -> bool:
    """
    Check minimal model artifacts.
    CrossEncoder.save() thường tạo subfolder 0_CrossEncoder
    và bên trong có config.json + pytorch_model.bin / model.safetensors.
    """
    if not os.path.isdir(model_dir):
        return False

    targets = {"config.json", "pytorch_model.bin", "model.safetensors", "tokenizer.json"}
    for _, _, files in os.walk(model_dir):
        for fn in files:
            if fn in targets:
                return True
    return False


def _print_env_debug():
    import platform
    print("\n[debug] python =", sys.executable)
    print("[debug] cwd    =", os.getcwd())
    print("[debug] platform =", platform.platform())
    try:
        import torch  
        print("[debug] torch =", torch.__version__)
        print("[debug] cuda available =", torch.cuda.is_available())
    except Exception as e:
        print("[debug] torch import error:", repr(e))
    try:
        import sentence_transformers  
        print("[debug] sentence-transformers =", sentence_transformers.__version__)
    except Exception as e:
        print("[debug] sentence-transformers import error:", repr(e))
    try:
        import transformers  
        print("[debug] transformers =", transformers.__version__)
    except Exception as e:
        print("[debug] transformers import error:", repr(e))
    print("")


def load_dataset(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found: {path}")
    data = _read_json(path)
    if isinstance(data, dict) and "data" in data:
        data = data["data"]
    if not isinstance(data, list):
        raise ValueError("dataset.json must be a list of objects.")
    return data


def normalize_record(s: Dict[str, Any]) -> Tuple[str, str, str, float]:
    """
    Returns:
      question, expected_context, pred_context, total_score
    """
    q = (s.get("question") or s.get("query") or s.get("q") or "").strip()
    expected = (
        s.get("expected_context")
        or s.get("context")
        or s.get("answer")
        or s.get("passage")
        or s.get("paragraph")
        or ""
    ).strip()
    pred = (s.get("pred_context") or s.get("retrieved_context") or "").strip()

    try:
        total = float(s.get("total_score", 0.0))
    except Exception:
        total = 0.0

    return q, expected, pred, total


def filter_records(
    raw_samples: List[Dict[str, Any]],
    min_total_score: float,
) -> List[Dict[str, str]]:
    """
    Only keep samples with total_score >= threshold.
    Output record:
      { "question": q, "positive": expected_context, "pred": pred_context }
    """
    out: List[Dict[str, str]] = []
    for s in raw_samples:
        q, expected, pred, total = normalize_record(s)
        if total < min_total_score:
            continue
        if not q or not expected:
            continue
        out.append({"question": q, "positive": expected, "pred": pred})
    return out


def split_train_dev(records: List[Dict[str, str]], dev_ratio: float, seed: int) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
    rng = random.Random(seed)
    data = list(records)
    rng.shuffle(data)
    n_dev = max(1, int(len(data) * dev_ratio))
    return data[n_dev:], data[:n_dev]


def build_context_pool(records: List[Dict[str, str]]) -> List[str]:
    pool: List[str] = []
    for r in records:
        pool.append(r["positive"])
        p = r.get("pred") or ""
        if p.strip():
            pool.append(p.strip())
    pool = [x for x in pool if isinstance(x, str) and x.strip()]
    return pool


def build_input_examples(
    split_records: List[Dict[str, str]],
    context_pool: List[str],
    num_random_neg: int,
    seed: int,
    add_pred_as_positive: bool = True,
) -> List[InputExample]:
    """
    For each record:
      + (q, expected_context) label=1
      + optionally (q, pred_context) label=1 if pred exists and pred != expected
      + num_random_neg negatives label=0 sampled from context_pool excluding expected/pred
    """
    rng = random.Random(seed)
    examples: List[InputExample] = []

    for r in split_records:
        q = r["question"]
        pos = r["positive"]
        pred = (r.get("pred") or "").strip()

        examples.append(InputExample(texts=[q, pos], label=1.0))

        if add_pred_as_positive and pred and pred != pos:
            examples.append(InputExample(texts=[q, pred], label=1.0))

        added = 0
        tries = 0
        while added < num_random_neg and tries < 50:
            cand = rng.choice(context_pool)
            tries += 1
            if cand == pos or (pred and cand == pred):
                continue
            examples.append(InputExample(texts=[q, cand], label=0.0))
            added += 1

    return examples


def train_reranker(
    dataset_path: str,
    model_out: str,
    base_model: str,
    min_total_score: float,
    num_random_neg: int,
    dev_ratio: float,
    seed: int,
    batch_size: int,
    epochs: int,
    lr: float,
    force_cpu: bool = False,
):
    _print_env_debug()

    raw = load_dataset(dataset_path)
    print(f"[train_reranker] loaded raw_samples: {len(raw)} from {dataset_path}")

    records = filter_records(raw, min_total_score=min_total_score)
    print(f"[train_reranker] usable records (total_score >= {min_total_score}): {len(records)}")

    if len(records) < 10:
        raise ValueError("Too few records after filtering. Reduce threshold or add more data.")

    train_records, dev_records = split_train_dev(records, dev_ratio=dev_ratio, seed=seed)
    print(f"[train_reranker] train_records={len(train_records)}, dev_records={len(dev_records)}")

    context_pool = build_context_pool(records)
    if len(context_pool) < 10:
        raise ValueError("Context pool too small to sample negatives.")

    train_examples = build_input_examples(
        train_records, context_pool=context_pool,
        num_random_neg=num_random_neg, seed=seed,
        add_pred_as_positive=True,
    )
    dev_examples = build_input_examples(
        dev_records, context_pool=context_pool,
        num_random_neg=num_random_neg, seed=seed + 1,
        add_pred_as_positive=True,
    )

    print(f"[train_reranker] train_examples={len(train_examples)}, dev_examples={len(dev_examples)}")

    train_loader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)

    print(f"[train_reranker] loading base model: {base_model}")
    model = CrossEncoder(base_model, num_labels=1)

    if force_cpu:
        try:
            model.model.to("cpu")
            print("[train_reranker] forced model to CPU")
        except Exception as e:
            print("[train_reranker] failed to force CPU:", repr(e))

    warmup_steps = int(0.1 * len(train_loader) * epochs)
    print(f"[train_reranker] warmup_steps={warmup_steps}")

    _ensure_dir(model_out)

    # Train
    model.fit(
        train_dataloader=train_loader,
        evaluator=None,
        epochs=epochs,
        warmup_steps=warmup_steps,
        output_path=None,  
        optimizer_params={"lr": lr},
        show_progress_bar=True,
    )

    print(f"[train_reranker] forcing save to: {model_out}")
    model.save(model_out)

    tree = _list_tree(model_out)
    print("[train_reranker] saved files/dirs:")
    for p in tree[:200]:
        print(" -", os.path.relpath(p, PROJECT_ROOT))
    if len(tree) > 200:
        print(f" ... and {len(tree) - 200} more entries")

    if not _has_model_files(model_out):
        raise RuntimeError(
            f"Model save verification failed: no model files found under {model_out}. "
            "This usually indicates incompatibility between Python 3.13 and torch/transformers "
            "or antivirus/permission issues."
        )

    print(f"\n✅ Fine-tuned reranker saved and verified at: {model_out}")
    print("Tip: you likely need to load from subfolder '0_CrossEncoder' if it exists.")



def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=DEFAULT_DATASET_PATH)
    ap.add_argument("--model_out", default=DEFAULT_MODEL_OUT)
    ap.add_argument("--base_model", default="cross-encoder/ms-marco-MiniLM-L-6-v2")
    ap.add_argument("--min_total_score", type=float, default=0.7)
    ap.add_argument("--num_random_neg", type=int, default=2)
    ap.add_argument("--dev_ratio", type=float, default=0.1)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--batch_size", type=int, default=16)
    ap.add_argument("--epochs", type=int, default=1)
    ap.add_argument("--lr", type=float, default=2e-5)
    ap.add_argument("--force_cpu", action="store_true", help="Force training on CPU")

    args = ap.parse_args()

    train_reranker(
        dataset_path=args.data,
        model_out=args.model_out,
        base_model=args.base_model,
        min_total_score=args.min_total_score,
        num_random_neg=args.num_random_neg,
        dev_ratio=args.dev_ratio,
        seed=args.seed,
        batch_size=args.batch_size,
        epochs=args.epochs,
        lr=args.lr,
        force_cpu=args.force_cpu,
    )


if __name__ == "__main__":
    main()