# utils.py
import os
import json
import re
import unicodedata
from typing import List, Dict, Set
from pypdf import PdfReader


# =========================
# NORMALIZE TITLE (EN + VI)
# =========================
def normalize_title(title: str, lang: str = "en") -> str:
    """
    Normalize title dùng chung cho EN / VI
    - VI: NFC normalize trước
    - lowercase
    - remove :, punctuation
    - unify whitespace
    """
    if lang == "vi":
        title = unicodedata.normalize("NFC", title)

    title = title.lower()
    title = title.replace(":", "")
    title = title.replace("-", " ")
    title = title.replace("_", " ")
    title = re.sub(r"[^\w\s]", "", title)
    title = re.sub(r"\s+", " ", title)

    return title.strip()


# =========================
# DEBUG
# =========================
def debug_print_chunks(all_chunks, used_indexes, max_preview=800):
    print(f"\n📄 TOTAL CHUNKS: {len(all_chunks)}")
    print(f"📌 USING CHUNKS INDEX: {used_indexes}\n")

    for order, idx in enumerate(used_indexes, 1):
        chunk = all_chunks[idx]
        print(f"--- CHUNK {order}/{len(used_indexes)} (index={idx}) ---")
        print(f"Length: {len(chunk)} characters")
        print(chunk[:max_preview])
        print("\n" + "-" * 60 + "\n")


# =========================
# JSON LOAD / SAVE
# =========================
def load_existing_output(path: str) -> List[Dict]:
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return []

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"⚠️ {path} is not valid JSON, resetting")
        return []


def save_output(path: str, data: List[Dict]):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_processed_titles(existing_qa: List[Dict], lang: str) -> Set[str]:
    return {
        normalize_title(qa["title"], lang)
        for qa in existing_qa
        if "title" in qa
    }


# =========================
# PDF TEXT EXTRACTION
# =========================
def extract_text_from_pdf(pdf_path: str, page_label: str) -> str:
    reader = PdfReader(pdf_path)
    texts = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            text = re.sub(r"\n{3,}", "\n\n", text)
            texts.append(f"[{page_label} {i+1}]\n{text.strip()}")

    return "\n\n".join(texts)


# =========================
# CHUNKING
# =========================
def chunk_text(text: str, max_chars: int = 4000) -> List[str]:
    """
    Chunk văn bản theo đoạn, giới hạn ~4000 ký tự
    Phù hợp cho semantic search & KLTN
    """
    blocks = re.split(r"\n\s*\n", text)
    chunks, cur = [], ""

    for b in blocks:
        if not b.strip():
            continue
        if len(cur) + len(b) <= max_chars:
            cur += ("\n\n" + b if cur else b)
        else:
            chunks.append(cur)
            cur = b


    if cur:
        chunks.append(cur)

    return chunks


# =========================
# CHUNK SELECTION (EVEN)
# =========================
def select_even_chunks(chunks: List[str], max_chunks: int):
    n = len(chunks)

    if n <= max_chunks:
        indexes = list(range(n))
        return indexes, chunks

    step = n / max_chunks
    indexes = [int(step * i) for i in range(max_chunks)]
    indexes[-1] = n - 1
    indexes = sorted(set(indexes))

    # nếu do set mà thiếu, bù từ cuối
    while len(indexes) < max_chunks:
        idx = indexes[-1] - 1
        if idx >= 0 and idx not in indexes:
            indexes.append(idx)
        else:
            break
        indexes = sorted(indexes)

    selected_chunks = [chunks[i] for i in indexes]
    return indexes, selected_chunks




# =========================
# GEMINI JSON PARSER
# =========================
def parse_json(raw: str) -> List[Dict]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r"\[\s*\{.*\}\s*\]", raw, re.DOTALL)
        if not m:
            return []
        return json.loads(m.group())
