import os
import time
import json
from typing import List, Dict

from google import genai

from utils import (
    normalize_title,
    load_existing_output,
    save_output,
    extract_text_from_pdf,
    chunk_text,
    parse_json,
    select_even_chunks,
)

# =========================
# 🔑 GEMINI API KEY
# =========================
GEMINI_API_KEY = "AIzaSyBTmF966jt-jKQZt2Keb8mG4CNQjBO9C1o"

#AIzaSyCmUffu8Bj_Xhkohf-Khkza4xPJVN9s7Ko thieuhuy1711
#AIzaSyDMhZBPghHF5HPDGFrzhYiIEOUPaRdO9zc lthuy21.work unvailable
#AIzaSyABk1ETrvuBO2UuhXBb6HKACEGlacXz7NI lthuy171103
#AIzaSyB7kXXWuqgi9ExxQ0zO-qzFB5ANCShwhy8 lkaygg0 unavailable
#AIzaSyCly-eZpXxvPXGejPosel6h9GJbKOQr7WY lkayss0
#AIzaSyAxvFq6qa_wVWmnckh_mzXdQyzeowN5wVM lthuy21@clc.fitus
#AIzaSyBQi9zUIXZ1E6YxDmYw0tFQNyBF_qY-oe8 lamthieukhang
#AIzaSyDcYuT1o3PfzHMa359x1GjU2T3anhdJLxo nguyennkhanh
#AIzaSyBpstaPmtiuIOGxoma6y9Izjw8nSz201Kc phuthanh
#AIzaSyDcYuT1o3PfzHMa359x1GjU2T3anhdJLxo
#AIzaSyAIiVYHwYWk1sVxrklFBicEDDTbKG_AihI

#AIzaSyBTmF966jt-jKQZt2Keb8mG4CNQjBO9C1o huyanh
#AIzaSyCvX4jxy4VajXnYPbUlAlaeSs46pBeW6wk 
#AIzaSyAxUMbbyYE9lPKR9CuVwNVgZbpgNCw5u2s
# =========================
# CONFIG
# =========================
LANG = "en"

PDF_FOLDER = "../articles_en"

# FINAL PASSED QA (STEP 2)
FINAL_QA_FILE = "../final/gemini25flash_en.json"

# OUTPUT ROUND 2 (AUGMENTED)
OUTPUT_FILE = "../geminiData/exp3/input3_en_gemini.json"

MODEL_ID = "gemini-2.5-flash"

SLEEP_BETWEEN = 5
MAX_CHUNKS = 8
MIN_QA_PER_PDF = 7


# =========================
# LOAD FINAL QA BY TITLE
# =========================
def load_final_qas_by_title(path: str):
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return {}

    by_title = {}
    for qa in data:
        if "title" not in qa:
            continue
        t = normalize_title(qa["title"], lang=LANG)
        by_title.setdefault(t, []).append(qa)

    return by_title


def load_augmented_titles(path: str):
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return set()

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return set()

    return {
        normalize_title(qa["title"], lang=LANG)
        for qa in data
        if "title" in qa
    }


# =========================
# PROMPT (AUGMENT – BE + CE OPTIMIZED)
# =========================
def build_prompt(title: str, content: str, target_qas: int, existing_qas):
    existing_block = ""
    for qa in existing_qas:
        existing_block += f"- {qa['question']}\n"

    return f"""
You are generating high-quality Question–Answer pairs for a
Retrieval-Augmented Generation (RAG) evaluation pipeline.

ONLY use information explicitly stated in the document below.
DO NOT introduce external knowledge or unstated assumptions.

GOAL:
Generate EXACTLY 7 NEW Question–Answer pairs that are:
(1) semantically coherent at the paragraph level, and
(2) directly verifiable by textual entailment models.

CRITICAL CONSTRAINTS:
- The value of "title" MUST be exactly:
  "{title}"
- DO NOT create, paraphrase, or shorten the title.

CONTENT RULES:
1. Each QA must focus on ONE clearly identifiable topic, finding, or result.
2. The context MUST contain exactly 3–4 full sentences.
3. All sentences in the context must describe the SAME topic or finding.
4. The answer MUST be explicitly and directly supported by the context.
5. Do NOT repeat or overlap with any existing questions.

EXISTING QUESTIONS (DO NOT REPEAT):
{existing_block}

FORMAT REQUIREMENTS:
- Return ONLY a JSON array
- Each element must be an object with EXACTLY 4 keys:
  "title", "context", "question", "answer"
- Do NOT include any text outside the JSON.

DOCUMENT CONTENT:
{content}
""".strip()


# =========================
# GEMINI CALL
# =========================
def generate_qa_for_pdf(
    client,
    pdf_path: str,
    existing_qas: List[Dict],
    target_qas: int
) -> List[Dict]:

    if target_qas <= 0:
        return []

    text = extract_text_from_pdf(pdf_path, page_label="Page")
    if not text.strip():
        return []

    chunks = chunk_text(text)
    _, used_chunks = select_even_chunks(chunks, MAX_CHUNKS)
    content = "\n\n---\n\n".join(used_chunks)

    title = os.path.basename(pdf_path).replace(".pdf", "").strip()

    prompt = build_prompt(title, content, target_qas, existing_qas)

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
# MAIN (AUGMENT TO MIN_QA)
# =========================
def main():
    final_qas_by_title = load_final_qas_by_title(FINAL_QA_FILE)
    augmented_titles = load_augmented_titles(OUTPUT_FILE)

    # resume-safe output
    output_qas = load_existing_output(OUTPUT_FILE)

    augment_jobs = []  # (filename, need_qas)

    for f in os.listdir(PDF_FOLDER):
        if not f.lower().endswith(".pdf"):
            continue

        title_key = normalize_title(f.replace(".pdf", ""), lang=LANG)
        existing_final_qas = final_qas_by_title.get(title_key, [])
        existing_count = len(existing_final_qas)

        # ❌ đã đủ QA
        if existing_count >= MIN_QA_PER_PDF:
            continue

        # ❌ đã augment rồi
        if title_key in augmented_titles:
            continue

        need_qas = MIN_QA_PER_PDF - existing_count
        augment_jobs.append((f, need_qas))

    total = len(augment_jobs)

    if total == 0:
        print("✅ No PDFs need QA generation.")
        return

    print(f"📊 TOTAL PDFs TO PROCESS: {total}")
    print(f"⏱ Estimated time: ~{total * SLEEP_BETWEEN:.1f}s\n")

    client = genai.Client(api_key=GEMINI_API_KEY)
    start_time = time.time()

    for idx, (filename, need_qas) in enumerate(augment_jobs, start=1):
        pdf_path = os.path.join(PDF_FOLDER, filename)
        title_key = normalize_title(filename.replace(".pdf", ""), lang=LANG)

        elapsed = time.time() - start_time
        avg = elapsed / idx
        eta = avg * (total - idx)

        print(
            f"🔁 PROCESS ({idx}/{total}) | "
            f"Need QA: {need_qas} | "
            f"Remaining PDFs: {total - idx} | "
            f"ETA: {eta:.1f}s\n"
            f"    → {filename}"
        )

        try:
            existing_final_qas = final_qas_by_title.get(title_key, [])

            new_qas = generate_qa_for_pdf(
                client,
                pdf_path,
                existing_final_qas,
                need_qas
            )

            if new_qas:
                output_qas.extend(new_qas)
                save_output(OUTPUT_FILE, output_qas)
                print(f"    ➕ Added {len(new_qas)} QAs\n")
            else:
                print(f"    ⏭ No QA generated\n")

        except Exception as e:
            print(f"    ❌ Error: {e}\n")

        time.sleep(SLEEP_BETWEEN)

    print(f"🎉 DONE — total new QAs generated: {len(output_qas)}")


if __name__ == "__main__":
    main()