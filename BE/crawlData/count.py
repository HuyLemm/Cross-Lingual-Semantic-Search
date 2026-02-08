import os
import json
from collections import defaultdict
from typing import Dict, Set

# =========================
# CONFIG
# =========================
MODEL_INPUTS = {
    "en_gemini": "input_en_gemini.json",
    "en_gpt": "input_en_gpt.json",
    "en_deepseek": "input_en_deepseek.json",
    "vi_deepseek": "input_vi_deepseek.json",
    "vi_gemini": "input_vi_gemini.json",
    "vi_gpt": "input_vi_gpt.json",
}

ARTICLES_EN_DIR = "articles_en"
ARTICLES_VI_DIR = "articles_vi"


# =========================
# HELPERS
# =========================
def load_input(file_path: str):
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def list_pdf_titles(folder: str) -> Set[str]:
    if not os.path.exists(folder):
        return set()
    return {
        os.path.splitext(f)[0].lower().strip()
        for f in os.listdir(folder)
        if f.lower().endswith(".pdf")
    }


# =========================
# LOAD PDFs
# =========================
pdfs_en = list_pdf_titles(ARTICLES_EN_DIR)
pdfs_vi = list_pdf_titles(ARTICLES_VI_DIR)

# =========================
# PROCESS PER MODEL
# =========================
stats = {}

for model, input_file in MODEL_INPUTS.items():
    data = load_input(input_file)

    qa_count = len(data)
    titles = {item["title"].lower().strip() for item in data if "title" in item}

    if model.startswith("en_"):
        pdf_pool = pdfs_en
    else:
        pdf_pool = pdfs_vi

    processed_pdfs = {
        pdf for pdf in pdf_pool
        if any(pdf in title for title in titles)
    }

    unprocessed_pdfs = pdf_pool - processed_pdfs

    stats[model] = {
        "qa_count": qa_count,
        "processed_pdfs": len(processed_pdfs),
        "unprocessed_pdfs": len(unprocessed_pdfs),
        "unprocessed_list": sorted(unprocessed_pdfs),
    }


# =========================
# REPORT
# =========================
print("\n========== QA & PDF REPORT (BY MODEL) ==========\n")

total_qa = 0

for model, s in stats.items():
    total_qa += s["qa_count"]

    print(f"▶ Model: {model}")
    print(f"  QA count            : {s['qa_count']}")
    print(f"  Processed PDFs      : {s['processed_pdfs']}")
    print(f"  Unprocessed PDFs    : {s['unprocessed_pdfs']}")

    # if s["unprocessed_list"]:
    #     print("  --- Unprocessed PDF files ---")
    #     for pdf in s["unprocessed_list"]:
    #         print(f"    - {pdf}.pdf")
    # print()

print("========== TOTAL ==========")
print(f"Total QA (all models): {total_qa}")
