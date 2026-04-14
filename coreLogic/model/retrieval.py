# model/retrieval.py
from __future__ import annotations

import os
import re
import json
import pickle
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

try:
    import faiss  # type: ignore
except Exception as e:
    raise RuntimeError("faiss is required. Please install faiss-cpu/faiss-gpu.") from e

FAISS_THREADS = int(os.getenv("FAISS_THREADS", "36"))  
if FAISS_THREADS > 0:
    try:
        faiss.omp_set_num_threads(FAISS_THREADS)
    except Exception:
        pass


try:
    import torch  # type: ignore
    from transformers import AutoTokenizer, AutoModelForSequenceClassification  # type: ignore
except Exception:
    torch = None
    AutoTokenizer = None
    AutoModelForSequenceClassification = None


try:
    # local package style: model/
    from .text_utils_LLM import (
        keyword_weighted_embedding as kw_embed_llm,
        extract_facts as extract_facts_llm,
        normalize_text as norm_text_llm,
        normalize_number_tokens as norm_num_llm,
    )
    from .text_utils_BGE import (
        keyword_weighted_embedding as kw_embed_bge,
        normalize_text as norm_text_bge,
        normalize_number_tokens as norm_num_bge,
    )
except Exception:
    # project root import style
    from model.text_utils_LLM import (
        keyword_weighted_embedding as kw_embed_llm,
        extract_facts as extract_facts_llm,
        normalize_text as norm_text_llm,
        normalize_number_tokens as norm_num_llm,
    )
    from model.text_utils_BGE import (
        keyword_weighted_embedding as kw_embed_bge,
        normalize_text as norm_text_bge,
        normalize_number_tokens as norm_num_bge,
    )

# Two FAISS roots
FAISS_FOLDER_LLM = os.getenv("FAISS_FOLDER_LLM", os.path.join("model", "faiss_cache_LLM"))
FAISS_FOLDER_BGE = os.getenv("FAISS_FOLDER_BGE", os.path.join("model", "faiss_cache_BGE"))

# Two embedding models
EMBED_MODEL_LLM = os.getenv(
    "EMBED_MODEL_LLM", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)
EMBED_MODEL_BGE = os.getenv("EMBED_MODEL_BGE", "BAAI/bge-m3")

# Retrieval params (shared defaults, can override per backend if you want)
PER_COLLECTION_CANDIDATES = int(os.getenv("PER_COLLECTION_CANDIDATES", "80"))
GLOBAL_CANDIDATES = int(os.getenv("GLOBAL_CANDIDATES", "250"))

# LLM hybrid rerank
RERANK_TOPK_LLM = int(os.getenv("RERANK_TOPK_LLM", "60"))
SEM_WEIGHT = float(os.getenv("SEM_WEIGHT", "0.85"))
LEX_WEIGHT = float(os.getenv("LEX_WEIGHT", "0.15"))
FACT_WEIGHT = float(os.getenv("FACT_WEIGHT", "0.25"))
FACT_MAX_RAW = float(os.getenv("FACT_MAX_RAW", "4.0"))

# BGE cross-encoder rerank
RERANK_TOPK_BGE = int(os.getenv("RERANK_TOPK_BGE", "60"))
RERANKER_ENABLED = os.getenv("RERANKER_ENABLED", "1").strip().lower() in ("1", "true", "yes")
RERANK_MODEL_NAME = os.getenv("RERANK_MODEL_NAME", "BAAI/bge-reranker-v2-m3")
RERANK_BATCH_SIZE = int(os.getenv("RERANK_BATCH_SIZE", "16"))
RERANK_USE_FP16 = os.getenv("RERANK_USE_FP16", "1").strip().lower() in ("1", "true", "yes")

DEBUG_RETRIEVAL = os.getenv("DEBUG_RETRIEVAL", "0").strip().lower() in ("1", "true", "yes")

REQUIRED_CACHE_FILES = {"index.faiss", "texts.pkl", "metadata_index.json"}

TITLE_RE = re.compile(r"\[TITLE\]\s*(.*?)(?:\n|$)", re.IGNORECASE | re.DOTALL)
CONTENT_RE = re.compile(r"\[CONTENT\]\s*(.*)$", re.IGNORECASE | re.DOTALL)
TOK_RE = re.compile(r"[0-9A-Za-zÀ-ỹ_]+", re.UNICODE)


def _dprint(*args: Any) -> None:
    if DEBUG_RETRIEVAL:
        print("[retrieval]", *args)


def extract_title_content(formatted: str) -> Tuple[str, str]:
    if not formatted:
        return "", ""
    t, c = "", ""
    m1 = TITLE_RE.search(formatted)
    if m1:
        t = (m1.group(1) or "").strip()
    m2 = CONTENT_RE.search(formatted)
    if m2:
        c = (m2.group(1) or "").strip()
    if not t and not c:
        return "", formatted.strip()
    return t, c


def strip_index_prefix(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"^\s*(index\s*[:=]\s*\d+\s*\|\s*)", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^\s*\d+\s*[-:|]\s*", "", text)
    return text.strip()


def _tok(text: str) -> List[str]:
    return [t.lower() for t in TOK_RE.findall(text or "")]


def _jaccard(a: List[str], b: List[str]) -> float:
    if not a or not b:
        return 0.0
    sa, sb = set(a), set(b)
    inter = len(sa & sb)
    union = len(sa | sb)
    return float(inter / union) if union else 0.0


def _cosine_normed(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))


def _normalize_vec(v: np.ndarray) -> np.ndarray:
    v = v.astype(np.float32)
    n = float(np.linalg.norm(v))
    if n <= 0:
        return v
    return (v / n).astype(np.float32)


def _safe_read_json(path: str) -> Dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _safe_read_pickle(path: str) -> Any:
    with open(path, "rb") as f:
        return pickle.load(f)


def _is_valid_cache_dir(folder: str) -> bool:
    if not os.path.isdir(folder):
        return False
    files = set(os.listdir(folder))
    return REQUIRED_CACHE_FILES.issubset(files)


def _scan_cache_dirs(root: str) -> List[str]:
    if not os.path.isdir(root):
        return []
    out: List[str] = []
    for name in os.listdir(root):
        p = os.path.join(root, name)
        if _is_valid_cache_dir(p):
            out.append(p)
    out.sort()
    return out


def _faiss_score_from_distance(index: Any, distances: np.ndarray) -> np.ndarray:
    metric = getattr(index, "metric_type", None)
    if metric is not None and metric == faiss.METRIC_INNER_PRODUCT:
        s = distances.astype(np.float32)
        return np.clip(s, 0.0, 1.0)
    d = distances.astype(np.float32)
    return 1.0 / (1.0 + np.maximum(d, 0.0))


@lru_cache(maxsize=1)
def _get_embed_model_llm():
    from sentence_transformers import SentenceTransformer  # local import
    _dprint("Loading LLM embed model:", EMBED_MODEL_LLM)
    return SentenceTransformer(EMBED_MODEL_LLM)


@lru_cache(maxsize=1)
def _get_embed_model_bge():
    from sentence_transformers import SentenceTransformer  # local import
    _dprint("Loading BGE embed model:", EMBED_MODEL_BGE)
    try:
        return SentenceTransformer(EMBED_MODEL_BGE, trust_remote_code=True)
    except TypeError:
        return SentenceTransformer(EMBED_MODEL_BGE)


@lru_cache(maxsize=1)
def _get_reranker_bge():
    if not RERANKER_ENABLED:
        return None, None, None

    if AutoTokenizer is None or AutoModelForSequenceClassification is None or torch is None:
        raise RuntimeError(
            "Cross-encoder reranker requires `torch` + `transformers`.\n"
            "Install: pip install torch transformers"
        )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _dprint("Loading reranker:", RERANK_MODEL_NAME, "device:", device)

    tok = AutoTokenizer.from_pretrained(RERANK_MODEL_NAME, use_fast=True)
    model = AutoModelForSequenceClassification.from_pretrained(RERANK_MODEL_NAME)
    model.to(device)
    model.eval()
    return tok, model, device


def _cross_encoder_scores_bge(query: str, docs: List[str]) -> List[float]:
    if not docs:
        return []

    tok, model, device = _get_reranker_bge()
    if tok is None or model is None or device is None:
        return [0.0 for _ in docs]

    bs = max(1, int(RERANK_BATCH_SIZE))
    use_fp16 = bool(RERANK_USE_FP16) and (device.type == "cuda")

    q = norm_num_bge(norm_text_bge(query))
    scores: List[float] = []

    with torch.no_grad():
        for i in range(0, len(docs), bs):
            batch_docs = docs[i : i + bs]
            enc = tok(
                [q] * len(batch_docs),
                batch_docs,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt",
            )
            enc = {k: v.to(device) for k, v in enc.items()}

            if use_fp16:
                with torch.autocast(device_type="cuda", dtype=torch.float16):
                    out = model(**enc)
            else:
                out = model(**enc)

            logits = out.logits
            if logits.dim() == 2 and logits.size(-1) == 1:
                s = logits.squeeze(-1)
            elif logits.dim() == 2 and logits.size(-1) >= 2:
                s = logits[:, -1]
            else:
                s = logits.view(-1)

            s = torch.sigmoid(s)
            scores.extend([float(x) for x in s.detach().cpu().tolist()])

    return scores


@dataclass
class Collection:
    folder: str
    index: Any
    texts: List[str]
    meta_index: Dict[str, Any]
    chunks_meta: Optional[List[Dict[str, Any]]] = None


_COLLS_LLM: Optional[List[Collection]] = None
_COLLS_BGE: Optional[List[Collection]] = None


def _load_all_faiss(root: str) -> List[Collection]:
    folders = _scan_cache_dirs(root)
    _dprint("FAISS root:", root, "collections:", len(folders))

    cols: List[Collection] = []
    for folder in folders:
        try:
            index_path = os.path.join(folder, "index.faiss")
            texts_path = os.path.join(folder, "texts.pkl")
            meta_path = os.path.join(folder, "metadata_index.json")
            chunks_meta_path = os.path.join(folder, "chunks_meta.json")

            index = faiss.read_index(index_path)
            texts = _safe_read_pickle(texts_path)
            meta_index = _safe_read_json(meta_path)

            if not isinstance(texts, list):
                continue
            texts = [str(x) for x in texts]

            chunks_meta: Optional[List[Dict[str, Any]]] = None
            if os.path.exists(chunks_meta_path):
                cm = _safe_read_json(chunks_meta_path)
                if isinstance(cm, list):
                    chunks_meta = cm
                elif isinstance(cm, dict):
                    maybe = cm.get("chunks") or cm.get("chunk_records") or cm.get("data")
                    if isinstance(maybe, list):
                        chunks_meta = maybe

            cols.append(Collection(folder=folder, index=index, texts=texts, meta_index=meta_index, chunks_meta=chunks_meta))
        except Exception as e:
            _dprint("Failed loading collection:", folder, "err:", repr(e))
            continue

    return cols


def load_all_faiss_LLM(force_reload: bool = False) -> List[Dict[str, Any]]:
    global _COLLS_LLM
    if _COLLS_LLM is None or force_reload:
        _COLLS_LLM = _load_all_faiss(FAISS_FOLDER_LLM)
    return [c.__dict__ for c in (_COLLS_LLM or [])]


def load_all_faiss_BGE(force_reload: bool = False) -> List[Dict[str, Any]]:
    global _COLLS_BGE
    if _COLLS_BGE is None or force_reload:
        _COLLS_BGE = _load_all_faiss(FAISS_FOLDER_BGE)
    return [c.__dict__ for c in (_COLLS_BGE or [])]


def _get_colls_llm() -> List[Collection]:
    global _COLLS_LLM
    if _COLLS_LLM is None:
        _COLLS_LLM = _load_all_faiss(FAISS_FOLDER_LLM)
    return _COLLS_LLM or []


def _get_colls_bge() -> List[Collection]:
    global _COLLS_BGE
    if _COLLS_BGE is None:
        _COLLS_BGE = _load_all_faiss(FAISS_FOLDER_BGE)
    return _COLLS_BGE or []


def _get_chunk_meta(col: Collection, idx: int) -> Dict[str, Any]:
    if col.chunks_meta and 0 <= idx < len(col.chunks_meta):
        md = col.chunks_meta[idx]
        return md if isinstance(md, dict) else {}
    return {}


def _get_doc_title(col: Collection, md: Dict[str, Any]) -> str:
    for k in ("title", "doc_title", "source_title", "file_title"):
        v = md.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()
    for k in ("title", "doc_title", "source_title"):
        v = col.meta_index.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()
    return ""


def _get_source_file(col: Collection, md: Dict[str, Any]) -> str:
    for k in ("source_file", "file", "filename", "pdf_file", "source_path"):
        v = md.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()
    v = col.meta_index.get("source_file") or col.meta_index.get("file") or col.meta_index.get("filename")
    if isinstance(v, str) and v.strip():
        return v.strip()
    return os.path.basename(col.folder)


def _get_language(col: Collection, md: Dict[str, Any]) -> str:
    v = md.get("language") or md.get("lang")
    if isinstance(v, str) and v.strip():
        return v.strip().lower()
    v2 = col.meta_index.get("language") or col.meta_index.get("lang")
    if isinstance(v2, str) and v2.strip():
        return v2.strip().lower()
    return ""


def _embed_texts_llm(texts: List[str]) -> np.ndarray:
    model = _get_embed_model_llm()
    vecs = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    if not isinstance(vecs, np.ndarray):
        vecs = np.array(vecs, dtype=np.float32)
    return vecs.astype(np.float32)


def _normalize_for_fact_llm(text: str) -> str:
    return norm_num_llm(norm_text_llm(text or ""))


def _contains_token_loose_llm(text: str, token: str) -> bool:
    if not text or not token:
        return False
    t = _normalize_for_fact_llm(text).lower()
    tok = _normalize_for_fact_llm(token).lower().replace("_", " ")
    return tok in t


def _fact_match_score_llm(query: str, content: str, md: Dict[str, Any]) -> float:
    q_norm = _normalize_for_fact_llm(query)
    c_norm = _normalize_for_fact_llm(content)

    facts = extract_facts_llm(q_norm)
    score = 0.0

    for y in facts.years:
        if _contains_token_loose_llm(c_norm, y):
            score += 1.2
    for d in facts.dates:
        if _contains_token_loose_llm(c_norm, d):
            score += 1.5
    for p in facts.percents:
        if _contains_token_loose_llm(c_norm, p):
            score += 1.0
    for i in facts.ids:
        if _contains_token_loose_llm(c_norm, i):
            score += 1.3
    for n in facts.numbers:
        if len(n) >= 2 and _contains_token_loose_llm(c_norm, n):
            score += 0.6
    for cap in facts.caps:
        if len(cap) >= 3 and _contains_token_loose_llm(c_norm, cap):
            score += 0.4

    title = md.get("title") or md.get("doc_title") or md.get("source_title")
    if isinstance(title, str) and title.strip():
        for y in facts.years:
            if _contains_token_loose_llm(title, y):
                score += 0.3

    return max(0.0, score)


def smart_semantic_search_LLM(
    query: str,
    top_k: int = 3,
    lang_filter: Optional[str] = None,
    collection_filter: Optional[List[str]] = None,
) -> Tuple[str, List[Tuple[str, str, str, str, float]]]:
    """
    LLM pipeline:
      - Query embedding: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (default)
      - FAISS retrieve
      - Hybrid rerank: semantic (cosine) + lexical (jaccard) + fact-match
    """
    query = norm_text_llm((query or "").strip())
    if not query:
        return "", []

    model = _get_embed_model_llm()
    q_vec = kw_embed_llm(model, query)
    q_vec = _normalize_vec(q_vec)

    cols = _get_colls_llm()
    if collection_filter:
        wanted = set([x.strip() for x in collection_filter if x and x.strip()])
        cols = [c for c in cols if os.path.basename(c.folder) in wanted]

    if not cols:
        return query, []

    lang_filter_norm = (lang_filter or "").strip().lower() or None
    q_toks = _tok(query)

    candidates: List[Dict[str, Any]] = []

    for col in cols:
        try:
            D, I = col.index.search(q_vec.reshape(1, -1), int(PER_COLLECTION_CANDIDATES))
            distances = D[0]
            idxs = I[0]
            base_scores = _faiss_score_from_distance(col.index, distances)

            for faiss_idx, base_score in zip(idxs.tolist(), base_scores.tolist()):
                if faiss_idx < 0 or faiss_idx >= len(col.texts):
                    continue

                raw_text = strip_index_prefix(str(col.texts[faiss_idx] or ""))
                t, c = extract_title_content(raw_text)
                content_only = c if c else raw_text

                md = _get_chunk_meta(col, faiss_idx)
                lang = _get_language(col, md)
                if lang_filter_norm and (not lang or lang != lang_filter_norm):
                    continue

                # lexical: jaccard(query_tokens, content_tokens)
                lex = _jaccard(q_toks, _tok(content_only))
                lex = float(max(0.0, min(1.0, lex)))

                title = t or _get_doc_title(col, md) or os.path.basename(_get_source_file(col, md))
                source_file = _get_source_file(col, md)

                candidates.append(
                    {
                        "raw_text": raw_text,
                        "content_only": content_only,
                        "title": title,
                        "source_file": source_file,
                        "md": md,
                        "base": float(base_score),
                        "lex": lex,
                    }
                )
        except Exception as e:
            _dprint("FAISS search error in", col.folder, "err:", repr(e))
            continue

    if not candidates:
        return query, []

    candidates.sort(key=lambda x: x["base"], reverse=True)
    candidates = candidates[: max(1, int(GLOBAL_CANDIDATES))]

    rerank_pool = candidates[: min(len(candidates), int(RERANK_TOPK_LLM))]
    pool_contents = [c["content_only"] for c in rerank_pool]
    doc_vecs = _embed_texts_llm(pool_contents)

    rescored: List[Tuple[str, str, str, str, float]] = []

    for c, dv in zip(rerank_pool, doc_vecs):
        dv = _normalize_vec(dv)
        semantic = _cosine_normed(q_vec, dv)
        semantic = float(max(0.0, min(1.0, semantic)))

        lex = float(c.get("lex", 0.0))

        fact_raw = _fact_match_score_llm(query, c["content_only"], c.get("md", {}))
        denom = FACT_MAX_RAW if FACT_MAX_RAW > 0 else 1.0
        fact_norm = float(max(0.0, min(1.0, fact_raw / denom)))

        final = SEM_WEIGHT * semantic + LEX_WEIGHT * lex + FACT_WEIGHT * fact_norm
        final = float(max(0.0, min(1.0, final)))

        content_to_show = c["content_only"] if c["content_only"] else c["raw_text"]
        formatted = f"[TITLE] {c['title']}\n[CONTENT] {content_to_show}"
        rescored.append((c["raw_text"], c["source_file"], c["title"], formatted, final))

    rescored.sort(key=lambda x: x[4], reverse=True)
    return query, rescored[: max(1, int(top_k))]


def smart_semantic_search_BGE(
    query: str,
    top_k: int = 3,
    lang_filter: Optional[str] = None,
    collection_filter: Optional[List[str]] = None,
) -> Tuple[str, List[Tuple[str, str, str, str, float]]]:
    """
    BGE pipeline:
      - Query embedding: BAAI/bge-m3 (default)
      - FAISS retrieve
      - Cross-encoder rerank: BAAI/bge-reranker-v2-m3 (default)
    """
    query = norm_text_bge((query or "").strip())
    if not query:
        return "", []

    model = _get_embed_model_bge()
    q_vec = kw_embed_bge(model, query)
    q_vec = _normalize_vec(q_vec)

    cols = _get_colls_bge()
    if collection_filter:
        wanted = set([x.strip() for x in collection_filter if x and x.strip()])
        cols = [c for c in cols if os.path.basename(c.folder) in wanted]

    if not cols:
        return query, []

    lang_filter_norm = (lang_filter or "").strip().lower() or None
    candidates: List[Dict[str, Any]] = []

    for col in cols:
        try:
            D, I = col.index.search(q_vec.reshape(1, -1), int(PER_COLLECTION_CANDIDATES))
            distances = D[0]
            idxs = I[0]
            base_scores = _faiss_score_from_distance(col.index, distances)

            for faiss_idx, base_score in zip(idxs.tolist(), base_scores.tolist()):
                if faiss_idx < 0 or faiss_idx >= len(col.texts):
                    continue

                raw_text = strip_index_prefix(str(col.texts[faiss_idx] or ""))
                t, c = extract_title_content(raw_text)
                content_only = c if c else raw_text

                md = _get_chunk_meta(col, faiss_idx)
                lang = _get_language(col, md)
                if lang_filter_norm and (not lang or lang != lang_filter_norm):
                    continue

                title = t or _get_doc_title(col, md) or os.path.basename(_get_source_file(col, md))
                source_file = _get_source_file(col, md)

                candidates.append(
                    {
                        "raw_text": raw_text,
                        "content_only": content_only,
                        "title": title,
                        "source_file": source_file,
                        "base": float(base_score),
                    }
                )
        except Exception as e:
            _dprint("FAISS search error in", col.folder, "err:", repr(e))
            continue

    if not candidates:
        return query, []

    candidates.sort(key=lambda x: x["base"], reverse=True)
    candidates = candidates[: max(1, int(GLOBAL_CANDIDATES))]

    rerank_pool = candidates[: min(len(candidates), int(RERANK_TOPK_BGE))]
    pool_contents = [c["content_only"] for c in rerank_pool]
    ce_scores = _cross_encoder_scores_bge(query, pool_contents)

    rescored: List[Tuple[str, str, str, str, float]] = []
    for c, s in zip(rerank_pool, ce_scores):
        content_to_show = c["content_only"] if c["content_only"] else c["raw_text"]
        formatted = f"[TITLE] {c['title']}\n[CONTENT] {content_to_show}"
        rescored.append((c["raw_text"], c["source_file"], c["title"], formatted, float(s)))

    rescored.sort(key=lambda x: x[4], reverse=True)
    return query, rescored[: max(1, int(top_k))]


DEFAULT_BACKEND = os.getenv("SEARCH_BACKEND", "BGE").strip().upper()  # "LLM" or "BGE"


def smart_semantic_search(
    query: str,
    top_k: int = 3,
    *,
    backend: Optional[str] = None,
    lang_filter: Optional[str] = None,
    collection_filter: Optional[List[str]] = None,
) -> Tuple[str, List[Tuple[str, str, str, str, float]]]:
    """
    Unified wrapper so app.py can call one function.
    backend: "LLM" or "BGE" (default = env SEARCH_BACKEND)
    """
    b = (backend or DEFAULT_BACKEND).strip().upper()
    if b == "LLM":
        return smart_semantic_search_LLM(
            query=query, top_k=top_k, lang_filter=lang_filter, collection_filter=collection_filter
        )
    return smart_semantic_search_BGE(
        query=query, top_k=top_k, lang_filter=lang_filter, collection_filter=collection_filter
    )