import json
import os
import re
import time
from difflib import SequenceMatcher

# =========================
# CONFIG
# =========================
INPUT_FILES = {
    "../../genData/deepseekData/exp13/input13_en_deepseek_filtered.json": ("deepseek-r1t2", "en"),
    "../../genData/deepseekData/exp17/input17_vi_deepseek_filtered.json": ("deepseek-r1t2", "vi"),
    "../../genData/geminiData/exp5/input5_en_gemini_filtered.json": ("gemini-2.5-flash", "en"),
    "../../genData/geminiData/exp9/input9_vi_gemini_filtered.json": ("gemini-2.5-flash", "vi"),
    "../../genData/gptData/exp1/input_en_gpt_filtered.json": ("gpt-5.2", "en"),
    "../../genData/gptData/exp1/input_vi_gpt_filtered.json": ("gpt-5.2", "vi"),
}

# 👉 CHỈNH DÒNG NÀY ĐỂ CHỌN FILE CHẠY
# SELECTED_INPUT = "../../genData/deepseekData/exp17/input17_vi_deepseek_filtered.json"
# SELECTED_INPUT = "../../genData/geminiData/exp9/input9_vi_gemini_filtered.json"
SELECTED_INPUT = "../../genData/gptData/exp1/input_en_gpt_filtered.json"

PDF_DIR = {
    "en": "../../backend/data/articles_en",
    "vi": "../../backend/data/articles_vi"
}

OUTPUT_DIR = "../../stepResults/step1/exp1"
os.makedirs(OUTPUT_DIR, exist_ok=True)

MATCH_THRESHOLD = 0.6
PRINT_EVERY = 50
SAVE_EVERY = 50


# =========================
# UTILS
# =========================
def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()


def load_pdfs(folder: str):
    return [
        f for f in os.listdir(folder)
        if f.lower().endswith(".pdf")
    ]


def find_best_pdf(title: str, pdf_files):
    title_n = normalize_text(title)
    best_pdf = "unknown"
    best_score = 0.0

    for pdf in pdf_files:
        pdf_n = normalize_text(pdf.replace(".pdf", ""))
        score = similarity(title_n, pdf_n)
        if score > best_score:
            best_score = score
            best_pdf = pdf

    if best_score < MATCH_THRESHOLD:
        return "unknown", round(best_score, 3)

    return best_pdf, round(best_score, 3)


# =========================
# MAIN LOGIC
# =========================
def process_file(input_path, model, language):
    out_name = f"{model.replace('.', '').replace('-', '')}_{language}.json"
    out_path = os.path.join(OUTPUT_DIR, out_name)

    # ===== LOAD EXISTING OUTPUT (RESUME) =====
    if os.path.exists(out_path):
        with open(out_path, "r", encoding="utf-8") as f:
            output = json.load(f)
        processed_ids = {qa["qa_id"] for qa in output}
    else:
        output = []
        processed_ids = set()

    with open(input_path, "r", encoding="utf-8") as f:
        qa_list = json.load(f)

    pdf_files = load_pdfs(PDF_DIR[language])

    total = len(qa_list)
    mapped_pdf = 0
    start_time = time.time()

    print(f"\n▶ Processing {os.path.basename(input_path)} | {total} QA")

    for idx, qa in enumerate(qa_list, start=1):
        qa_id = f"QA_{model}_{language}_{idx-1:06d}"

        if qa_id in processed_ids:
            continue

        title = qa.get("title", "")

        pdf, pdf_score = find_best_pdf(title, pdf_files)
        if pdf != "unknown":
            mapped_pdf += 1

        entry = {
            "qa_id": qa_id,
            "model": model,
            "language": language,
            "source_pdf": pdf,
            "pdf_match_score": pdf_score,
            "title": title,
            "context": qa.get("context", ""),
            "question": qa.get("question", ""),
            "answer": qa.get("answer", "")
        }

        output.append(entry)

        # ===== SAVE PROGRESS =====
        if len(output) % SAVE_EVERY == 0:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(output, f, ensure_ascii=False, indent=2)

        # ===== PRINT PROGRESS =====
        if idx % PRINT_EVERY == 0 or idx == total:
            elapsed = time.time() - start_time
            percent = idx / total * 100
            eta = (elapsed / idx) * (total - idx) if idx else 0

            print(
                f"  ⏳ {idx}/{total} ({percent:.1f}%) | "
                f"pdf mapped: {mapped_pdf} | "
                f"ETA: {eta:.1f}s",
                end="\r"
            )

    print()

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(
        f"✔ Finished {os.path.basename(out_path)} | "
        f"PDF mapped: {mapped_pdf}/{total}"
    )


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    if SELECTED_INPUT not in INPUT_FILES:
        raise ValueError(
            f"SELECTED_INPUT not registered:\n{SELECTED_INPUT}"
        )

    if not os.path.exists(SELECTED_INPUT):
        raise FileNotFoundError(
            f"Input file not found:\n{SELECTED_INPUT}"
        )

    model, lang = INPUT_FILES[SELECTED_INPUT]
    process_file(SELECTED_INPUT, model, lang)
