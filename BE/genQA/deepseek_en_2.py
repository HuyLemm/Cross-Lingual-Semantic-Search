import os
import time
import requests
import json
from typing import List, Dict

from utils import (
    normalize_title,
    load_existing_output,
    save_output,
    extract_text_from_pdf,
    chunk_text,
    parse_json,
    select_even_chunks
)

# =========================
# 🔑 OPENROUTER API KEY
# =========================
OPENROUTER_API_KEY = "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"
#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
#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
#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
#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
#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

#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
#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

# =========================
# CONFIG (ENGLISH)
# =========================
LANG = "en"

PDF_FOLDER = "../articles_en"
FINAL_QA_FILE = "../final/deepseekr1t2_en.json"
OUTPUT_FILE = "../deepseekData/exp11/input10_en_deepseek.json"

MODEL_ID = "tngtech/deepseek-r1t2-chimera:free"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SLEEP_BETWEEN = 5
MAX_CHUNKS = 8
MIN_QA_PER_PDF = 7   # ⭐ TARGET PER PDF

# =========================
# LOAD FINAL QA BY TITLE
# =========================
def load_final_qas_by_title(path: str):
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        print(f"⚠ FINAL QA file empty or missing: {path}")
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print(f"⚠ FINAL QA file is not valid JSON: {path}")
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
# PROMPT (AUGMENT)
# =========================
def build_prompt(title: str, content: str, target_qas: int, existing_qas):
    existing_block = ""
    for qa in existing_qas:
        existing_block += f"- {qa['question']}\n"

    return f"""
You are generating high-quality Question–Answer pairs for a
Retrieval-Augmented Generation (RAG) evaluation and retrieval pipeline.

ONLY use information explicitly stated in the document below.
DO NOT introduce external knowledge or unstated assumptions.

GOAL:
Generate EXACTLY 7 NEW Question–Answer pairs that are:
(1) semantically coherent at the paragraph level, and
(2) directly verifiable by sentence-level entailment models.

CRITICAL CONSTRAINTS:
- The value of "title" MUST be exactly:
  "{title}"
- DO NOT create, paraphrase, or shorten the title.

CONTENT RULES:
1. Each QA must focus on ONE clearly identifiable topic, finding, or claim.
2. The context MUST contain exactly 3–4 full sentences.
3. All sentences in the context must describe the SAME topic or finding.
4. The answer MUST be explicitly supported by the context.
5. The answer SHOULD reuse important terminology from the context
   while remaining a complete, well-formed sentence.
6. Avoid abstract interpretation, synthesis, or multi-step reasoning.
7. Do NOT repeat or overlap with any existing questions listed below.

EXISTING QUESTIONS (DO NOT REPEAT):
{existing_block}

FORMAT REQUIREMENTS:
- Return ONLY a JSON array
- Each element must be an object with EXACTLY 4 keys:
  "title", "context", "question", "answer"
- Do NOT include any additional text outside the JSON.

DOCUMENT CONTENT:
{content}
""".strip()

# =========================
# OPENROUTER CALL
# =========================
def generate_qa_for_pdf(
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

    payload = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "You generate academic QA datasets."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 4096
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    resp = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=120
    )
    resp.raise_for_status()

    raw = resp.json()["choices"][0]["message"]["content"].strip()
    data = parse_json(raw)

    return [
        qa for qa in data
        if set(qa.keys()) == {"title", "context", "question", "answer"}
    ]

# =========================
# MAIN (AUGMENT TO 7 QA)
# =========================
def main():
    final_qas_by_title = load_final_qas_by_title(FINAL_QA_FILE)
    augmented_titles = load_augmented_titles(OUTPUT_FILE)
    output_qas = load_existing_output(OUTPUT_FILE)

    augment_jobs = []  # (filename, need_qas)

    for f in os.listdir(PDF_FOLDER):
        if not f.lower().endswith(".pdf"):
            continue

        title_key = normalize_title(f.replace(".pdf", ""), lang=LANG)
        existing_final_qas = final_qas_by_title.get(title_key, [])
        existing_count = len(existing_final_qas)

        # ❌ already has enough QA
        if existing_count >= MIN_QA_PER_PDF:
            continue

        # ❌ already augmented
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

    start_time = time.time()

    for idx, (filename, need_qas) in enumerate(augment_jobs, start=1):
        pdf_path = os.path.join(PDF_FOLDER, filename)
        title_key = normalize_title(filename.replace(".pdf", ""), lang=LANG)

        elapsed = time.time() - start_time
        avg_time = elapsed / idx
        remaining = total - idx
        eta = avg_time * remaining

        print(
            f"🔁 PROCESS ({idx}/{total}) | "
            f"Need QA: {need_qas} | "
            f"Remaining PDFs: {remaining} | ETA: {eta:.1f}s\n"
            f"    → {filename}"
        )

        try:
            existing_final_qas = final_qas_by_title.get(title_key, [])
            new_qas = generate_qa_for_pdf(
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