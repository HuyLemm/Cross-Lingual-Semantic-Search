import os
import re
import json
import pickle
import hashlib
import traceback
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer

# sentence-transformers
try:
    from sentence_transformers import SentenceTransformer
except Exception as e:
    raise RuntimeError("sentence-transformers is required. Please install sentence-transformers.") from e

from langchain_community.vectorstores import FAISS
from langchain_core.embeddings import Embeddings

try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

try:
    import docx  # python-docx
except Exception:
    docx = None


SUPPORTED_EXT = (".txt", ".pdf", ".docx")

DATA_DIR = os.getenv("DATA_DIR", "data")
FAISS_FOLDER = os.getenv("FAISS_FOLDER", "model/faiss_cache")

# ✅ CHANGED DEFAULT: bge-m3
EMBED_MODEL_NAME = os.getenv("EMBED_MODEL_NAME", "BAAI/bge-m3")

# chunk options
CHUNK_SENT_MIN = int(os.getenv("CHUNK_SENT_MIN", "3"))
CHUNK_SENT_MAX = int(os.getenv("CHUNK_SENT_MAX", "4"))
CHUNK_SENT_OVERLAP = int(os.getenv("CHUNK_SENT_OVERLAP", "1"))
CHUNK_CHAR_BUDGET = int(os.getenv("CHUNK_CHAR_BUDGET", "550"))

MIN_DOC_CHARS = int(os.getenv("MIN_DOC_CHARS", "80"))
MIN_SENT_CHARS = int(os.getenv("MIN_SENT_CHARS", "8"))
MIN_CHUNK_CHARS = int(os.getenv("MIN_CHUNK_CHARS", "80"))

SPLIT_LONG_SENTENCE = os.getenv("SPLIT_LONG_SENTENCE", "1").strip().lower() in ("1", "true", "yes")
LONG_SENT_CHAR = int(os.getenv("LONG_SENT_CHAR", "420"))

DOC_KEYWORDS_TOP_N = int(os.getenv("DOC_KEYWORDS_TOP_N", "40"))
CHUNK_KEYWORDS_TOP_N = int(os.getenv("CHUNK_KEYWORDS_TOP_N", "10"))

INCLUDE_TITLE_IN_KEYWORDS = os.getenv("INCLUDE_TITLE_IN_KEYWORDS", "1").strip().lower() in ("1", "true", "yes")

NORMALIZE_EMBEDDINGS = os.getenv("NORMALIZE_EMBEDDINGS", "1").strip().lower() in ("1", "true", "yes")

REQUIRED_CACHE_FILES = [
    "index.faiss",
    "index.pkl",
    "texts.pkl",
    "metadata_index.json",
    "sentences.pkl",
    "chunks_meta.json",
]

FOLDER_NAME_MAX_LEN = 70

SENT_SPLIT_RE = re.compile(r"(?<=[\.\!\?\。\！？])\s+|\n\s*\n")

_WORD_RE = re.compile(r"(?u)\b[^\W\d_]{2,}\b")

_VI_CHARS = set(
    "ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệ"
    "íìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ"
)

VI_STOP = {
    "là", "và", "hoặc", "nhưng", "nếu", "thì", "khi", "trong", "trên", "dưới", "cho", "với", "từ", "đến",
    "của", "ở", "về", "như", "bằng", "tại", "được", "không", "có", "những", "các", "một", "này", "đó",
    "gì", "vì", "sao", "thế", "nào", "ai", "đâu", "đang", "đã", "sẽ", "rất", "hơn", "nhất",
    "vẫn", "cũng", "để", "lại", "nên", "ra", "vào", "tới", "qua",
}

EXTRA_EN_STOP = {
    "you", "your", "yours", "yourself", "yourselves",
    "i", "me", "my", "mine", "myself",
    "we", "us", "our", "ours", "ourselves",
    "he", "him", "his", "himself",
    "she", "her", "hers", "herself",
    "they", "them", "their", "theirs", "themselves",
    "it", "its", "itself",
    "this", "that", "these", "those",
    "here", "there", "where", "when", "why", "how",
    "also", "just", "really", "very", "much", "more", "most",
}


def now_iso() -> str:
    return datetime.now().isoformat(timespec="seconds")


def sha1_text(s: str) -> str:
    return hashlib.sha1((s or "").encode("utf-8", errors="ignore")).hexdigest()


def short_hash(s: str, n: int = 10) -> str:
    return hashlib.sha256((s or "").encode("utf-8", errors="ignore")).hexdigest()[:n]


def remove_vietnamese_diacritics(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return unicodedata.normalize("NFC", text)


def sanitize_for_folder(name: str, max_len: int = FOLDER_NAME_MAX_LEN) -> str:
    name = remove_vietnamese_diacritics(name)
    name = re.sub(r"[^A-Za-z0-9]+", "_", name).strip("_")
    if not name:
        name = "doc"
    if len(name) > max_len:
        name = name[:max_len].rstrip("_")
    return name


def build_out_dir(cache_dir: str, filepath: str) -> str:
    base = os.path.splitext(os.path.basename(filepath))[0]
    safe_base = sanitize_for_folder(base, FOLDER_NAME_MAX_LEN)
    hid = short_hash(os.path.abspath(filepath), 10)
    return os.path.join(cache_dir, f"{safe_base}__{hid}")


def rel_source_id(filepath: str, data_dir: str) -> str:
    try:
        rel = os.path.relpath(filepath, start=data_dir)
        return rel.replace("\\", "/")
    except Exception:
        return os.path.basename(filepath)


def is_valid_faiss_cache(out_dir: str) -> bool:
    return all(os.path.isfile(os.path.join(out_dir, f)) for f in REQUIRED_CACHE_FILES)


def detect_language_light(text: str) -> str:
    t = (text or "").lower()
    for ch in t:
        if ch in _VI_CHARS:
            return "vi"
    return "en"


def clean_extracted_text(text: str) -> str:
    """
    - join broken words: "stabi-\n lizing" -> "stabilizing"
    - collapse noisy newlines
    - normalize spaces
    """
    if not text:
        return ""
    t = text.replace("\r", "\n")
    t = re.sub(r"-\s*\n\s*", "", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    t = re.sub(r"(?<!\n)\n(?!\n)", " ", t)
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


def split_into_sentences(text: str) -> List[str]:
    t = (text or "").strip()
    if not t:
        return []
    parts = [s.strip() for s in SENT_SPLIT_RE.split(t) if s and s.strip()]
    return [s for s in parts if len(s) >= MIN_SENT_CHARS]


def split_long_sentence(sentence: str) -> List[str]:
    s = (sentence or "").strip()
    if not s:
        return []
    if len(s) <= LONG_SENT_CHAR:
        return [s]

    seps = ["; ", "；", ". ", ": ", " - ", " – ", " — ", ", ", "，"]
    chunks = [s]
    for sep in seps:
        new_chunks = []
        for c in chunks:
            if len(c) <= LONG_SENT_CHAR:
                new_chunks.append(c)
                continue
            parts = [p.strip() for p in c.split(sep) if p and p.strip()]
            if len(parts) <= 1:
                new_chunks.append(c)
            else:
                new_chunks.extend(parts)
        chunks = new_chunks

    chunks = [c.strip() for c in chunks if c and len(c.strip()) >= MIN_SENT_CHARS]
    return chunks if chunks else [s]


def read_txt(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def read_docx(path: str) -> str:
    if docx is None:
        raise RuntimeError("python-docx is not installed but .docx was found.")
    d = docx.Document(path)
    paras = [p.text.strip() for p in d.paragraphs if p.text and p.text.strip()]
    return "\n\n".join(paras)


def read_pdf(path: str) -> str:
    if fitz is None:
        raise RuntimeError("PyMuPDF (fitz) is not installed but .pdf was found.")
    doc = fitz.open(path)
    pages = [page.get_text() for page in doc]
    return "\n\n".join(pages)


def extract_text_from_file(path: str) -> Tuple[str, str]:
    lp = path.lower()
    if lp.endswith(".txt"):
        return read_txt(path), "txt"
    if lp.endswith(".docx"):
        return read_docx(path), "docx"
    if lp.endswith(".pdf"):
        return read_pdf(path), "pdf_pymupdf"
    raise ValueError(f"Unsupported format: {path}")


def build_chunks_from_sentences(
    sentences: List[str],
    sent_min: int,
    sent_max: int,
    char_budget: int,
    overlap: int,
) -> Tuple[List[str], List[Dict[str, Any]], Dict[str, Any]]:
    chunks: List[str] = []
    metas: List[Dict[str, Any]] = []
    n = len(sentences)
    if n == 0:
        return chunks, metas, {"num_sentences": 0, "num_chunks": 0}

    i = 0
    chunk_id = 0

    while i < n:
        end = min(i + sent_max, n)
        buf: List[str] = []
        j = i

        while j < end:
            cand = (" ".join(buf + [sentences[j]])).strip()
            next_count = len(buf) + 1

            if len(cand) <= char_budget:
                buf.append(sentences[j])
                j += 1
                continue

            if next_count > sent_min:
                break

            buf.append(sentences[j])
            j += 1
            break

        if (n - i) < sent_min and i > 0:
            buf = sentences[i:n]
            j = n

        chunk_text = " ".join(buf).strip()
        if chunk_text and len(chunk_text) >= MIN_CHUNK_CHARS:
            sent_start = i
            sent_end = i + len(buf) - 1
            chunks.append(chunk_text)
            metas.append(
                {
                    "chunk_id": chunk_id,
                    "sent_start": int(sent_start),
                    "sent_end": int(sent_end),
                    "sent_count": int(len(buf)),
                    "char_len": int(len(chunk_text)),
                }
            )
            chunk_id += 1

        if j >= n:
            break

        step = max(1, (j - i) - overlap)
        i = i + step

    stats = {
        "num_sentences": int(n),
        "num_chunks": int(len(chunks)),
        "sent_min": int(sent_min),
        "sent_max": int(sent_max),
        "overlap": int(overlap),
        "char_budget": int(char_budget),
        "strategy": "short_sentence_aligned_chunks",
    }
    return chunks, metas, stats


def _tfidf_token_pattern() -> str:
    return r"(?u)\b[0-9A-Za-zÀ-ỹ_]+(?:[\/\.\-][0-9A-Za-zÀ-ỹ_]+)*\b"


def build_doc_and_chunk_keywords(
    doc_text: str,
    chunk_texts: List[str],
    top_doc: int,
    top_chunk: int,
    lang: str,
) -> Tuple[List[str], List[List[str]], Dict[str, Any]]:
    if not doc_text or not chunk_texts:
        return [], [[] for _ in chunk_texts], {"status": "empty"}

    if lang == "en":
        stop_words = "english"
        extra_stop = EXTRA_EN_STOP
    else:
        stop_words = None
        extra_stop = VI_STOP

    corpus = [c for c in chunk_texts if c and len(c) > 20]
    corpus.append(doc_text)

    max_df = 1.0 if len(corpus) <= 2 else 0.85

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words=stop_words,
        ngram_range=(1, 2),
        max_features=50000,
        sublinear_tf=True,
        max_df=max_df,
        min_df=1,
        token_pattern=_tfidf_token_pattern(),
    )

    noise = {
        "et al", "figure", "fig", "table", "tables",
        "http", "https", "arxiv", "doi", "pdf", "supplementary",
    }

    def is_bad_term(tt: str) -> bool:
        if not tt:
            return True
        t = tt.strip().lower()

        if t in noise:
            return True

        if len(t) < 3:
            if t.isdigit() and len(t) >= 2:
                return False
            return True

        toks = t.split()
        if not toks:
            return True

        if all(tok in extra_stop for tok in toks):
            return True

        for tok in toks:
            if len(tok) <= 1 and not tok.isdigit():
                return True

        return False

    try:
        X = vectorizer.fit_transform(corpus)
        terms = vectorizer.get_feature_names_out()
    except Exception as e:
        return [], [[] for _ in chunk_texts], {"status": "error", "error": str(e)}

    def top_terms_from_row(row, topn: int) -> List[str]:
        scores = row.toarray().ravel()
        idxs = scores.nonzero()[0]
        pairs = [(terms[i], float(scores[i])) for i in idxs]
        pairs = [(t.strip().lower(), s) for (t, s) in pairs if not is_bad_term(t)]
        pairs.sort(key=lambda x: x[1], reverse=True)
        out: List[str] = []
        seen = set()
        for t, _s in pairs:
            if t in seen:
                continue
            out.append(t)
            seen.add(t)
            if len(out) >= topn:
                break
        return out

    doc_keywords = top_terms_from_row(X[-1], top_doc)

    chunk_keywords: List[List[str]] = []
    for i in range(X.shape[0] - 1):
        chunk_keywords.append(top_terms_from_row(X[i], top_chunk))

    if len(chunk_keywords) < len(chunk_texts):
        chunk_keywords += [[] for _ in range(len(chunk_texts) - len(chunk_keywords))]
    elif len(chunk_keywords) > len(chunk_texts):
        chunk_keywords = chunk_keywords[: len(chunk_texts)]

    return doc_keywords, chunk_keywords, {"status": "ok", "lang": lang}


class STEmbeddings(Embeddings):
    """
    LangChain Embeddings wrapper so FAISS.save_local writes index.faiss/index.pkl
    """
    def __init__(self, model: SentenceTransformer, normalize: bool = True):
        self.model = model
        self.normalize = normalize

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        vecs = self.model.encode(
            texts,
            normalize_embeddings=self.normalize,
            show_progress_bar=False,
        )
        return vecs.tolist()

    def embed_query(self, text: str) -> List[float]:
        vec = self.model.encode(
            [text],
            normalize_embeddings=self.normalize,
            show_progress_bar=False,
        )[0]
        return vec.tolist()


@dataclass
class IndexOptions:
    data_dir: str = DATA_DIR
    cache_dir: str = FAISS_FOLDER
    embed_model_name: str = EMBED_MODEL_NAME

    chunk_sent_min: int = CHUNK_SENT_MIN
    chunk_sent_max: int = CHUNK_SENT_MAX
    chunk_sent_overlap: int = CHUNK_SENT_OVERLAP
    chunk_char_budget: int = CHUNK_CHAR_BUDGET

    doc_keywords_top_n: int = DOC_KEYWORDS_TOP_N
    chunk_keywords_top_n: int = CHUNK_KEYWORDS_TOP_N

    normalize_embeddings: bool = NORMALIZE_EMBEDDINGS


def scan_files(data_dir: str) -> List[str]:
    files: List[str] = []
    if not os.path.isdir(data_dir):
        return files

    lang_subs = ["english", "vietnamese"]
    has_lang_layout = all(os.path.isdir(os.path.join(data_dir, s)) for s in lang_subs)

    if has_lang_layout:
        for s in lang_subs:
            root = os.path.join(data_dir, s)
            for r, _dirs, fnames in os.walk(root):
                for fname in fnames:
                    if fname.lower().endswith(SUPPORTED_EXT):
                        files.append(os.path.join(r, fname))
        return files

    for r, _dirs, fnames in os.walk(data_dir):
        for fname in fnames:
            if fname.lower().endswith(SUPPORTED_EXT):
                files.append(os.path.join(r, fname))
    return files


def build_existing_cache_map(cache_dir: str) -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    if not os.path.isdir(cache_dir):
        return mapping

    for sub in os.listdir(cache_dir):
        out_dir = os.path.join(cache_dir, sub)
        if not os.path.isdir(out_dir):
            continue
        meta_path = os.path.join(out_dir, "metadata_index.json")
        if not os.path.isfile(meta_path):
            continue
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception:
            continue

        source_id = str(meta.get("source_id") or "").strip() or str(meta.get("source_file") or "").strip()
        if not source_id:
            continue
        if is_valid_faiss_cache(out_dir):
            mapping[source_id] = out_dir

    return mapping


def _load_embedding_model(model_name: str) -> SentenceTransformer:
    """
    bge-m3 often needs trust_remote_code=True depending on environment.
    Provide best-effort fallback.
    """
    try:
        return SentenceTransformer(model_name, trust_remote_code=True)
    except TypeError:
        # older sentence-transformers without trust_remote_code param
        return SentenceTransformer(model_name)
    except Exception:
        # last attempt without trust_remote_code
        return SentenceTransformer(model_name)


def generate_index_for_file(
    filepath: str,
    opts: IndexOptions,
    existing_map: Dict[str, str],
    st_model: SentenceTransformer,
) -> None:
    source_id = rel_source_id(filepath, opts.data_dir)
    fname = os.path.basename(filepath)
    title = os.path.splitext(fname)[0]

    print(f"\n📄 Processing: {source_id}")

    if source_id in existing_map and is_valid_faiss_cache(existing_map[source_id]):
        print(f"⏭️ Skip (already indexed): {source_id}")
        return

    out_dir = build_out_dir(opts.cache_dir, filepath)

    if os.path.isdir(out_dir) and is_valid_faiss_cache(out_dir):
        print(f"⏭️ Skip (cache exists): {out_dir}")
        return

    if os.path.isdir(out_dir) and not is_valid_faiss_cache(out_dir):
        print(f"♻️ Cache incomplete, rebuilding: {out_dir}")
        import shutil
        shutil.rmtree(out_dir, ignore_errors=True)

    os.makedirs(out_dir, exist_ok=True)

    try:
        raw_text, extraction_method = extract_text_from_file(filepath)
        if not raw_text or len(raw_text.strip()) < MIN_DOC_CHARS:
            print("⚠️ Text rỗng/quá ngắn, bỏ qua.")
            return

        norm_text = clean_extracted_text(raw_text)
        if len(norm_text.strip()) < MIN_DOC_CHARS:
            print("⚠️ Text sau clean quá ngắn, bỏ qua.")
            return

        lang = detect_language_light(norm_text)
        content_sha1 = sha1_text(norm_text)

        sentences = split_into_sentences(norm_text)
        if not sentences:
            print("⚠️ Không tách được câu, bỏ qua.")
            return

        if SPLIT_LONG_SENTENCE:
            expanded: List[str] = []
            for s in sentences:
                if len(s) > LONG_SENT_CHAR:
                    expanded.extend(split_long_sentence(s))
                else:
                    expanded.append(s)
            sentences = [s for s in expanded if s and len(s) >= MIN_SENT_CHARS]

        chunks_raw, chunk_metas, chunk_stats = build_chunks_from_sentences(
            sentences=sentences,
            sent_min=opts.chunk_sent_min,
            sent_max=opts.chunk_sent_max,
            char_budget=opts.chunk_char_budget,
            overlap=opts.chunk_sent_overlap,
        )

        if not chunks_raw:
            print("⚠️ Không tạo được chunk, bỏ qua.")
            return

        cleaned_chunks: List[str] = []
        cleaned_metas: List[Dict[str, Any]] = []
        for c, m in zip(chunks_raw, chunk_metas):
            cc = (c or "").strip()
            if not cc:
                continue
            if len(cc) < MIN_CHUNK_CHARS:
                continue
            cleaned_chunks.append(cc)
            cleaned_metas.append(m)

        if not cleaned_chunks:
            print("⚠️ Không còn chunk hợp lệ sau lọc, bỏ qua.")
            return

        kw_doc_text = norm_text
        if INCLUDE_TITLE_IN_KEYWORDS and title and title.strip():
            kw_doc_text = f"{title}\n\n{norm_text}"

        doc_keywords, chunk_keywords, kw_info = build_doc_and_chunk_keywords(
            doc_text=kw_doc_text,
            chunk_texts=cleaned_chunks,
            top_doc=opts.doc_keywords_top_n,
            top_chunk=opts.chunk_keywords_top_n,
            lang=lang,
        )

        texts_for_index: List[str] = [f"[CONTENT] {c}" for c in cleaned_chunks]

        with open(os.path.join(out_dir, "sentences.pkl"), "wb") as f:
            pickle.dump(sentences, f)

        with open(os.path.join(out_dir, "texts.pkl"), "wb") as f:
            pickle.dump(texts_for_index, f)

        chunk_records: List[Dict[str, Any]] = []
        for i, (c, meta) in enumerate(zip(cleaned_chunks, cleaned_metas)):
            rec = {
                "chunk_id": int(i),
                "source_id": source_id,
                "source_file": fname,
                "title": title,
                "language": lang,
                "sent_start": int(meta.get("sent_start", -1)),
                "sent_end": int(meta.get("sent_end", -1)),
                "sent_count": int(meta.get("sent_count", 0)),
                "char_len": int(meta.get("char_len", len(c))),
                "word_count": int(len(c.split())),
                "chunk_sha1": sha1_text(c),
                "chunk_keywords": chunk_keywords[i] if i < len(chunk_keywords) else [],
                "preview": c[:220] + ("..." if len(c) > 220 else ""),
            }
            chunk_records.append(rec)

        with open(os.path.join(out_dir, "chunks_meta.json"), "w", encoding="utf-8") as f:
            json.dump(chunk_records, f, ensure_ascii=False, indent=2)

        embedder = STEmbeddings(st_model, normalize=opts.normalize_embeddings)

        metadatas = []
        for i, rec in enumerate(chunk_records):
            metadatas.append(
                {
                    "source_id": source_id,
                    "source_file": fname,
                    "title": title,
                    "language": lang,
                    "chunk_id": int(i),
                    "sent_start": int(rec["sent_start"]),
                    "sent_end": int(rec["sent_end"]),
                    "doc_keywords": doc_keywords,
                    "chunk_keywords": rec.get("chunk_keywords", []),
                }
            )

        vs = FAISS.from_texts(
            texts=texts_for_index,
            embedding=embedder,
            metadatas=metadatas,
        )
        vs.save_local(out_dir)

        try:
            st = os.stat(filepath)
            file_size = int(st.st_size)
            file_mtime = datetime.fromtimestamp(st.st_mtime).isoformat(timespec="seconds")
        except Exception:
            file_size = None
            file_mtime = None

        lengths = [r["char_len"] for r in chunk_records] or [0]
        words = [r["word_count"] for r in chunk_records] or [0]
        sent_counts = [r["sent_count"] for r in chunk_records] or [0]

        meta_index = {
            "schema_version": "8.0",
            "created_at": now_iso(),
            "source_id": source_id,
            "source_file": fname,
            "title": title,
            "language": lang,
            "abs_path": os.path.abspath(filepath),
            "data_dir": os.path.abspath(opts.data_dir),
            "file_size_bytes": file_size,
            "file_mtime": file_mtime,
            "extraction_method": extraction_method,
            "content_sha1": content_sha1,
            "content_char_len": int(len(norm_text)),
            "content_word_count": int(len(norm_text.split())),
            "num_sentences": int(len(sentences)),
            "chunking_strategy": chunk_stats.get("strategy"),
            "chunk_sent_min": int(opts.chunk_sent_min),
            "chunk_sent_max": int(opts.chunk_sent_max),
            "chunk_sent_overlap": int(opts.chunk_sent_overlap),
            "chunk_char_budget": int(opts.chunk_char_budget),
            "split_long_sentence": bool(SPLIT_LONG_SENTENCE),
            "long_sentence_char": int(LONG_SENT_CHAR),
            "num_chunks": int(len(texts_for_index)),
            "chunk_char_len": {
                "min": int(min(lengths)),
                "max": int(max(lengths)),
                "avg": float(sum(lengths) / max(1, len(lengths))),
            },
            "chunk_word_count": {
                "min": int(min(words)),
                "max": int(max(words)),
                "avg": float(sum(words) / max(1, len(words))),
            },
            "chunk_sent_count": {
                "min": int(min(sent_counts)),
                "max": int(max(sent_counts)),
                "avg": float(sum(sent_counts) / max(1, len(sent_counts))),
            },
            "embed_model": opts.embed_model_name,
            "embeddings_normalized": bool(opts.normalize_embeddings),
            "embed_text_format": "[CONTENT] <chunk> (TITLE excluded)",
            "doc_keywords": doc_keywords,
            "doc_keywords_top_n": int(opts.doc_keywords_top_n),
            "chunk_keywords_top_n": int(opts.chunk_keywords_top_n),
            "keywords_status": kw_info.get("status") if isinstance(kw_info, dict) else "unknown",
            "tfidf_token_pattern": _tfidf_token_pattern(),
            "include_title_in_keywords": bool(INCLUDE_TITLE_IN_KEYWORDS),
            "sentences_file": "sentences.pkl",
            "chunks_meta_file": "chunks_meta.json",
            "texts_file": "texts.pkl",
            "note": (
                "BGE-M3 embedding as default; normalized embeddings recommended for inner-product search. "
                "Short sentence-aligned chunks; stores doc_keywords + chunk_keywords in metadata. "
                "TITLE excluded from embedding to avoid title-driven false positives."
            ),
        }

        with open(os.path.join(out_dir, "metadata_index.json"), "w", encoding="utf-8") as f:
            json.dump(meta_index, f, ensure_ascii=False, indent=2)

        print(f"✅ Indexed {len(texts_for_index)} chunks → {out_dir}")
        if doc_keywords:
            print(f"🔑 doc_keywords(top10): {doc_keywords[:10]}")
        if chunk_records and chunk_records[0].get("chunk_keywords"):
            print(f"🔎 chunk0_keywords: {chunk_records[0]['chunk_keywords'][:10]}")

    except Exception:
        print(f"❌ FAILED indexing: {source_id}")
        traceback.print_exc()
        import shutil
        shutil.rmtree(out_dir, ignore_errors=True)
        raise


def main():
    opts = IndexOptions()
    os.makedirs(opts.cache_dir, exist_ok=True)

    existing_map = build_existing_cache_map(opts.cache_dir)
    paths = scan_files(opts.data_dir)

    if not paths:
        print(f"⚠️ No files found in: {opts.data_dir}")
        return

    print(f"🤖 Loading embedding model once: {opts.embed_model_name}")
    st_model = _load_embedding_model(opts.embed_model_name)

    print(f"🔎 Found {len(paths)} files. Cache: {opts.cache_dir}")
    for p in paths:
        try:
            generate_index_for_file(p, opts, existing_map, st_model)
        except Exception:
            print("⛔ Error on file. Continue next.")

    print("\n✅ Done.")


if __name__ == "__main__":
    main()