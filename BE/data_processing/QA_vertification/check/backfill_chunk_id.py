import os
import json
import re
import unicodedata
from typing import List, Dict, Optional, Tuple

import numpy as np
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

# OCR deps
try:
    from pdf2image import convert_from_path
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


# =========================
# BASE PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PDF_FOLDER = os.path.abspath(
    os.path.join(BASE_DIR, "../../../backend/data_articles/articles_en")
)

QA_JSON_IN = os.path.abspath(
    os.path.join(BASE_DIR, "../../results_from_generate/stepResults/step3/exp7/gpt52_en.json")
)

QA_JSON_OUT = os.path.abspath(
    os.path.join(BASE_DIR, "../../results_from_generate/stepResults/step3/exp7/gpt52_en_chunked.json")
)

# Other examples:
# QA_JSON_IN = os.path.abspath(os.path.join(BASE_DIR, "../ep1/stepResults/step2b_ce/exp9/gemini25flash_vi.json"))
# QA_JSON_OUT = os.path.abspath(os.path.join(BASE_DIR, "../ep1/stepResults/step2b_ce/exp9/gemini25flash_vi_chunked.json"))

# QA_JSON_IN = os.path.abspath(os.path.join(BASE_DIR, "../ep1/stepResults/step2b_ce/exp5/gemini25flash_en.json"))
# QA_JSON_OUT = os.path.abspath(os.path.join(BASE_DIR, "../ep1/stepResults/step2b_ce/exp5/gemini25flash_en_chunked.json"))

# QA_JSON_IN = os.path.abspath(os.path.join(BASE_DIR, "../ep1/stepResults/step2b_ce/exp13/deepseekr1t2_en.json"))
# QA_JSON_OUT = os.path.abspath(os.path.join(BASE_DIR, "../ep1/stepResults/step2b_ce/exp13/deepseekr1t2_en_chunked.json"))


# =========================
# CONFIG
# =========================
MAX_CHARS_PER_CHUNK = 4000
EMBED_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

# OCR CONFIG (Windows)
POPPLER_BIN = r"C:\Downloads\Release-25.12.0-0\poppler-25.12.0\Library\bin"
TESSERACT_CMD = r""  # e.g. r"C:\Program Files\Tesseract-OCR\tesseract.exe"
OCR_DPI = 200
OCR_MAX_PAGES = None  # None = all pages

# Debug / output options
PREVIEW_CHARS = 240
DEBUG_PDF_MATCH = True


# =========================
# NORMALIZATION / PDF INDEX
# =========================
def normalize_name(s: str) -> str:
    s = unicodedata.normalize("NFKC", s or "")
    s = s.strip().lower()

    # remove .pdf if present
    s = re.sub(r"\.pdf$", "", s, flags=re.IGNORECASE)

    # normalize separators
    s = s.replace("_", " ")
    s = s.replace("-", " ")

    # remove accents
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.replace("đ", "d").replace("Đ", "D")

    # keep letters/numbers/spaces only
    s = re.sub(r"[^a-z0-9 ]+", "", s)

    # collapse whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s


def build_pdf_index(pdf_folder: str) -> Tuple[str, Dict[str, str], Dict[str, List[str]]]:
    pdf_folder = os.path.abspath(pdf_folder)
    index_exact: Dict[str, str] = {}
    index_norm: Dict[str, List[str]] = {}

    if not os.path.isdir(pdf_folder):
        print(f"❌ PDF folder not found: {pdf_folder}")
        return pdf_folder, index_exact, index_norm

    for fn in os.listdir(pdf_folder):
        if not fn.lower().endswith(".pdf"):
            continue

        full = os.path.join(pdf_folder, fn)
        index_exact[fn] = full

        norm_keys = {
            normalize_name(fn),
            normalize_name(os.path.splitext(fn)[0]),
        }

        for key in norm_keys:
            if key not in index_norm:
                index_norm[key] = []
            if full not in index_norm[key]:
                index_norm[key].append(full)

    return pdf_folder, index_exact, index_norm


PDF_FOLDER_ABS, PDF_INDEX_EXACT, PDF_INDEX_NORM = build_pdf_index(PDF_FOLDER)


def find_near_matches(query: str, max_items: int = 10) -> List[str]:
    probe = normalize_name(query)
    if not probe:
        return []

    out = []
    seen = set()

    for norm_key, paths in PDF_INDEX_NORM.items():
        if probe in norm_key or norm_key in probe:
            for p in paths:
                if p not in seen:
                    seen.add(p)
                    out.append(p)

    return out[:max_items]


def find_pdf_path_for_qa(qa: Dict) -> Optional[str]:
    """
    Prefer qa["source_pdf"] if present, else title + ".pdf".
    Also supports normalized fallback.
    """
    src = (qa.get("source_pdf") or "").strip()
    title = (qa.get("title") or "").strip()

    # 1) exact source_pdf
    if src:
        if src in PDF_INDEX_EXACT:
            return PDF_INDEX_EXACT[src]

        candidate = os.path.join(PDF_FOLDER_ABS, src)
        if os.path.exists(candidate):
            return candidate

    # 2) normalized source_pdf
    if src:
        norm_src = normalize_name(src)
        matches = list(dict.fromkeys(PDF_INDEX_NORM.get(norm_src, [])))
        if len(matches) == 1:
            return matches[0]

    # 3) exact title + ".pdf"
    if title:
        title_pdf = f"{title}.pdf"
        if title_pdf in PDF_INDEX_EXACT:
            return PDF_INDEX_EXACT[title_pdf]

        candidate = os.path.join(PDF_FOLDER_ABS, title_pdf)
        if os.path.exists(candidate):
            return candidate

    # 4) normalized title
    if title:
        norm_title = normalize_name(title)
        matches = list(dict.fromkeys(PDF_INDEX_NORM.get(norm_title, [])))
        if len(matches) == 1:
            return matches[0]

    # 5) fallback mềm: nếu near match có đúng 1 file thì nhận luôn
    near = []
    if src:
        near.extend(find_near_matches(src))
    if title:
        near.extend(find_near_matches(title))

    dedup_near = []
    seen = set()
    for p in near:
        if p not in seen:
            seen.add(p)
            dedup_near.append(p)

    if len(dedup_near) == 1:
        return dedup_near[0]

    # 6) debug
    if DEBUG_PDF_MATCH:
        print("⚠️ PDF not found")
        print("   qa_id      =", repr(qa.get("qa_id", "")))
        print("   source_pdf =", repr(src))
        print("   title      =", repr(title))
        print("   PDF_FOLDER =", PDF_FOLDER_ABS)

        if dedup_near:
            print("   Near matches:")
            for p in dedup_near[:10]:
                print("    -", os.path.basename(p))

    return None


# =========================
# PDF TEXT (NORMAL + OCR FALLBACK)
# =========================
def extract_text_normal(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    texts = []
    for page in reader.pages:
        t = page.extract_text()
        if t and t.strip():
            t = re.sub(r"\n{3,}", "\n\n", t)
            texts.append(t.strip())
    return "\n\n".join(texts)


def extract_text_ocr(pdf_path: str) -> str:
    if not OCR_AVAILABLE:
        return ""

    if not POPPLER_BIN.strip():
        return ""

    if TESSERACT_CMD.strip():
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD

    images = convert_from_path(
        pdf_path,
        poppler_path=POPPLER_BIN,
        dpi=OCR_DPI,
    )
    if OCR_MAX_PAGES is not None:
        images = images[:OCR_MAX_PAGES]

    texts = []
    for img in images:
        t = pytesseract.image_to_string(img, lang="vie+eng")
        if t and t.strip():
            t = re.sub(r"\n{3,}", "\n\n", t)
            texts.append(t.strip())

    return "\n\n".join(texts)


def extract_text_from_pdf(pdf_path: str) -> Tuple[str, bool]:
    """
    Returns (text, used_ocr).
    """
    text = extract_text_normal(pdf_path)
    if text.strip():
        return text, False

    if OCR_AVAILABLE and POPPLER_BIN.strip():
        print(f"⚠️ OCR fallback: {os.path.basename(pdf_path)}")
        ocr_text = extract_text_ocr(pdf_path)
        return ocr_text, True

    return "", False


# =========================
# CHUNKING (hard cap <= max_chars)
# =========================
def _split_long_block(block: str, max_chars: int) -> List[str]:
    block = block.strip()
    if len(block) <= max_chars:
        return [block]

    sentences = re.split(r"(?<=[.!?])\s+", block)
    pieces, cur = [], ""

    for s in sentences:
        s = s.strip()
        if not s:
            continue

        if len(s) > max_chars:
            if cur:
                pieces.append(cur)
                cur = ""
            for start in range(0, len(s), max_chars):
                pieces.append(s[start:start + max_chars])
            continue

        if not cur:
            cur = s
        elif len(cur) + 1 + len(s) <= max_chars:
            cur += " " + s
        else:
            pieces.append(cur)
            cur = s

    if cur:
        pieces.append(cur)

    safe = []
    for p in pieces:
        p = p.strip()
        if not p:
            continue
        if len(p) <= max_chars:
            safe.append(p)
        else:
            for start in range(0, len(p), max_chars):
                safe.append(p[start:start + max_chars])
    return safe


def chunk_text(text: str, max_chars: int) -> List[str]:
    blocks = re.split(r"\n\s*\n", text)
    chunks, cur = [], ""

    for b in blocks:
        b = b.strip()
        if not b:
            continue

        sub_blocks = _split_long_block(b, max_chars) if len(b) > max_chars else [b]

        for sb in sub_blocks:
            sb = sb.strip()
            if not sb:
                continue

            if not cur:
                cur = sb
            elif len(cur) + 2 + len(sb) <= max_chars:
                cur += "\n\n" + sb
            else:
                chunks.append(cur)
                cur = sb

    if cur:
        chunks.append(cur)

    out = []
    for ch in chunks:
        ch = ch.strip()
        if not ch:
            continue
        if len(ch) <= max_chars:
            out.append(ch)
        else:
            out.extend(_split_long_block(ch, max_chars))
    return out


def build_chunks(pdf_path: str) -> Tuple[List[Dict], bool]:
    """
    Returns (chunks, used_ocr)
    chunks[] = { chunk_id_short, char_len, text }
    """
    text, used_ocr = extract_text_from_pdf(pdf_path)
    if not text.strip():
        return [], used_ocr

    raw = chunk_text(text, MAX_CHARS_PER_CHUNK)

    chunks = []
    for i, ch in enumerate(raw):
        chunks.append(
            {
                "chunk_id_short": f"{i + 1:04d}",
                "char_len": len(ch),
                "text": ch,
            }
        )
    return chunks, used_ocr


# =========================
# EMBEDDING MATCH (ALWAYS ASSIGN TOP-1)
# =========================
def best_chunk_for_qa(
    qa: Dict,
    chunks: List[Dict],
    model: SentenceTransformer
) -> Tuple[str, int, str]:
    """
    Always returns (chunk_id_short, chunk_char_len, chunk_preview).
    Assumes chunks is non-empty.
    """
    query = ((qa.get("question") or "") + "\n" + (qa.get("context") or "")).strip()

    q_emb = model.encode([query], normalize_embeddings=True)[0]
    c_embs = model.encode([c["text"] for c in chunks], normalize_embeddings=True)

    sims = np.dot(c_embs, q_emb)
    best_idx = int(np.argmax(sims))

    best = chunks[best_idx]
    preview = best["text"][:PREVIEW_CHARS].replace("\n", " ").strip()
    return best["chunk_id_short"], int(best["char_len"]), preview


# =========================
# JSON HELPERS
# =========================
def load_existing_json(path: str) -> List[Dict]:
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return []

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        return []
    except json.JSONDecodeError:
        print(f"⚠️ Output JSON invalid: {path}")
        return []


def save_json(path: str, data: List[Dict]):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def find_existing_index(data: List[Dict], obj: Dict) -> int:
    obj_qa_id = obj.get("qa_id")
    if obj_qa_id:
        for i, item in enumerate(data):
            if item.get("qa_id") == obj_qa_id:
                return i

    obj_title = obj.get("title", "")
    obj_question = obj.get("question", "")
    for i, item in enumerate(data):
        if item.get("title", "") == obj_title and item.get("question", "") == obj_question:
            return i

    return -1


def upsert_in_memory(data: List[Dict], obj: Dict):
    idx = find_existing_index(data, obj)
    if idx >= 0:
        data[idx] = obj
    else:
        data.append(obj)


def qa_sort_key(item: Dict):
    qa_id = item.get("qa_id", "")
    m = re.search(r"^(.*?)(\d+)$", qa_id)
    prefix = m.group(1) if m else qa_id
    num = int(m.group(2)) if m else 10**12
    return (
        prefix,
        num,
        item.get("source_pdf", ""),
        item.get("title", ""),
        item.get("question", ""),
    )


def reindex_qa_ids(data: List[Dict]):
    data.sort(key=qa_sort_key)

    counters: Dict[str, int] = {}

    for item in data:
        qa_id = item.get("qa_id")
        if not qa_id:
            continue

        m = re.search(r"^(.*?)(\d+)$", qa_id)
        if not m:
            continue

        prefix = m.group(1)
        old_digits = m.group(2)
        width = len(old_digits)

        if prefix not in counters:
            counters[prefix] = 0

        item["qa_id"] = f"{prefix}{counters[prefix]:0{width}d}"
        counters[prefix] += 1


# =========================
# MAIN
# =========================
def main():
    print("========== START ==========")
    print("BASE_DIR   =", BASE_DIR)
    print("PDF_FOLDER =", PDF_FOLDER_ABS)
    print("QA_JSON_IN =", QA_JSON_IN)
    print("QA_JSON_OUT=", QA_JSON_OUT)
    print(f"PDF indexed: {len(PDF_INDEX_EXACT)} files")
    print("===========================")

    if not os.path.exists(QA_JSON_IN):
        print(f"❌ Missing QA_JSON_IN: {QA_JSON_IN}")
        return

    if not os.path.isdir(PDF_FOLDER_ABS):
        print(f"❌ Missing PDF_FOLDER: {PDF_FOLDER_ABS}")
        return

    with open(QA_JSON_IN, "r", encoding="utf-8") as f:
        qas = json.load(f)

    output_data = load_existing_json(QA_JSON_OUT)

    # Resume support:
    # skip only successful records
    processed_ids = set()
    for qa in output_data:
        note = qa.get("chunk_note", "")
        chunk_id = qa.get("chunk_id")

        if note in {"pdf_not_found_assigned_default", "no_extractable_text_even_after_ocr"}:
            continue

        if chunk_id is None:
            continue

        if qa.get("qa_id"):
            processed_ids.add(("qa_id", qa["qa_id"]))
        else:
            processed_ids.add(("tq", qa.get("title", ""), qa.get("question", "")))

    model = SentenceTransformer(EMBED_MODEL)

    # cache: pdf_path -> (chunks, used_ocr)
    chunk_cache: Dict[str, Tuple[List[Dict], bool]] = {}
    total = len(qas)

    for i, qa in enumerate(qas, 1):
        if qa.get("qa_id"):
            if ("qa_id", qa["qa_id"]) in processed_ids:
                print(f"[{i}/{total}] Skip already processed: {qa['qa_id']}")
                continue
        else:
            key = ("tq", qa.get("title", ""), qa.get("question", ""))
            if key in processed_ids:
                print(f"[{i}/{total}] Skip already processed by title+question")
                continue

        pdf_path = find_pdf_path_for_qa(qa)
        qa_out = dict(qa)

        if not pdf_path:
            qa_out["chunk_id"] = "0001"
            qa_out["chunk_char_len"] = 0
            qa_out["chunk_preview"] = ""
            qa_out["used_ocr"] = False
            qa_out["chunk_note"] = "pdf_not_found_assigned_default"
            upsert_in_memory(output_data, qa_out)
            print(f"[{i}/{total}] PDF not found -> upserted temporary error record")
            continue

        if pdf_path not in chunk_cache:
            chunks, used_ocr = build_chunks(pdf_path)
            chunk_cache[pdf_path] = (chunks, used_ocr)
            print(
                f"[{i}/{total}] Built chunks for {os.path.basename(pdf_path)} "
                f"| chunks={len(chunks)} | used_ocr={used_ocr}"
            )

        chunks, used_ocr = chunk_cache[pdf_path]

        if not chunks:
            qa_out["chunk_id"] = "0001"
            qa_out["chunk_char_len"] = 0
            qa_out["chunk_preview"] = ""
            qa_out["used_ocr"] = bool(used_ocr)
            qa_out["chunk_note"] = "no_extractable_text_even_after_ocr"
            upsert_in_memory(output_data, qa_out)
            print(f"[{i}/{total}] No text even after OCR -> upserted")
            continue

        chunk_id, char_len, preview = best_chunk_for_qa(qa, chunks, model)
        qa_out["chunk_id"] = chunk_id
        qa_out["chunk_char_len"] = char_len
        qa_out["chunk_preview"] = preview
        qa_out["used_ocr"] = bool(used_ocr)
        qa_out.pop("chunk_note", None)

        upsert_in_memory(output_data, qa_out)
        print(
            f"[{i}/{total}] Upserted | pdf={os.path.basename(pdf_path)} "
            f"| chunk_id={chunk_id} | char_len={char_len} | used_ocr={used_ocr}"
        )

    # chỉ xóa ở bước cuối cùng
    before_final_cleanup = len(output_data)
    output_data = [
        x for x in output_data
        if x.get("chunk_note", "") != "pdf_not_found_assigned_default"
    ]
    removed_final = before_final_cleanup - len(output_data)

    # sort + reindex qa_id
    reindex_qa_ids(output_data)

    save_json(QA_JSON_OUT, output_data)

    print("===========================")
    print(f"Final records saved: {len(output_data)}")
    print(f"Removed final pdf_not_found_assigned_default records: {removed_final}")
    print("DONE.")


if __name__ == "__main__":
    main()