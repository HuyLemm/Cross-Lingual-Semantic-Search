import os
import re
import time
from typing import List, Dict

from google import genai

from utils import (
    normalize_title,
    debug_print_chunks,
    load_existing_output,
    save_output,
    load_processed_titles,
    extract_text_from_pdf,
    chunk_text,
    parse_json,
    select_even_chunks,
)


GEMINI_API_KEY = "API_KEY"


# =========================
# CONFIG
# =========================
LANG = "en"

PDF_FOLDER = "../articles_en"
OUTPUT_FILE = "../geminiData/exp1/input_en_gemini.json"

MODEL_ID = "gemini-2.5-flash"

BATCH_SIZE = 200
SLEEP_BETWEEN = 5
MAX_CHUNKS = 8

# =========================
# PROMPT (ENGLISH)
# =========================
def build_prompt(title: str, content: str) -> str:
    return f"""
You are a system specialized in generating high-quality Question–Answer datasets
for semantic search and Retrieval-Augmented Generation (RAG).

ONLY use the information explicitly stated in the document below.
DO NOT introduce any external knowledge or assumptions.

MANDATORY REQUIREMENTS:
1. Language: 100% English, academic, objective, and precise tone
2. Generate between 5 and 8 QAs (NOT fewer than 5)
3. Each QA must contain exactly 4 fields:
   - title: "{title}"
   - context: 3–4 full sentences, academically paraphrased, no bullet points
   - question: a well-formed question including all key concepts and keywords
   - answer: concise, accurate, strictly based on the document
4. QAs must cover different aspects and must not repeat ideas

OUTPUT FORMAT:
- Return ONLY a single JSON array
- Each element must be an object with exactly 4 keys:
  "title", "context", "question", "answer"

DOCUMENT CONTENT:
{content}
""".strip()


# =========================
# GEMINI CALL
# =========================
def generate_qa_for_pdf(client, pdf_path: str) -> List[Dict]:
    text = extract_text_from_pdf(pdf_path, page_label="Page")

    if not text.strip():
        print("   ⚠️ No text layer detected, skipping")
        return []

    chunks = chunk_text(text)

    used_indexes, used_chunks = select_even_chunks(chunks, MAX_CHUNKS)

    # -------------------------
    # DEBUG PRINT CHUNKS
    # -------------------------
    debug_print_chunks(chunks, used_indexes)

    content = "\n\n---\n\n".join(used_chunks)

    title = os.path.basename(pdf_path).replace(".pdf", "").strip()

    prompt = build_prompt(title, content)

    resp = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt
    )

    data = parse_json(resp.text.strip())

    return [
        qa for qa in data
        if set(qa.keys()) == {"title", "context", "question", "answer"}
    ]


# =========================
# MAIN
# =========================
def main():
    existing_qa = load_existing_output(OUTPUT_FILE)
    processed_titles = load_processed_titles(existing_qa, lang=LANG)

    pdf_files = sorted(
        f for f in os.listdir(PDF_FOLDER)
        if f.lower().endswith(".pdf")
        and normalize_title(f.replace(".pdf", ""), lang=LANG) not in processed_titles
    )


    batch = pdf_files[:BATCH_SIZE]

    if not batch:
        print("✅ No new PDFs to process")
        return

    print(f"🚀 Batch size: {len(batch)} PDFs")

    client = genai.Client(api_key=GEMINI_API_KEY)
    all_qa = existing_qa

    for idx, filename in enumerate(batch, 1):
        pdf_path = os.path.join(PDF_FOLDER, filename)
        print(f"🔄 ({idx}/{len(batch)}) {filename}")

        try:
            qa = generate_qa_for_pdf(client, pdf_path)
            all_qa.extend(qa)
            save_output(OUTPUT_FILE, all_qa)
            print(f"   ✅ {len(qa)} QAs generated and saved")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        time.sleep(SLEEP_BETWEEN)

    print(f"\n🎉 DONE — total QAs: {len(all_qa)}")


if __name__ == "__main__":
    main()
