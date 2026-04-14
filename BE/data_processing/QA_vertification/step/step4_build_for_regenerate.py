import os
import json
from collections import defaultdict
import unicodedata
import re

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
# CONFIG
# =========================
# INPUT_FILES = [
#     "../../step2b_ce/exp1/deepseekr1t2_en.json",
#     "../../step2b_ce/exp2/deepseekr1t2_en.json",
#     "../../step2b_ce/exp3/deepseekr1t2_en.json",
#     "../../step2b_ce/exp4/deepseekr1t2_en.json",
#     "../../step2b_ce/exp5/deepseekr1t2_en.json",
#     "../../step2b_ce/exp6/deepseekr1t2_en.json",
#     "../../step2b_ce/exp7/deepseekr1t2_en.json",
#     "../../step2b_ce/exp8/deepseekr1t2_en.json",
#     "../../step2b_ce/exp9/deepseekr1t2_en.json",
#     "../../step2b_ce/exp10/deepseekr1t2_en.json",
#     "../../step2b_ce/exp11/deepseekr1t2_en.json",
#     "../../step2b_ce/exp12/deepseekr1t2_en.json",
#     "../../step2b_ce/exp13/deepseekr1t2_en.json",
# ]

# INPUT_FILES = [
#     "../../stepResults/step2b_ce/exp1/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp2/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp3/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp4/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp5/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp6/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp7/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp8/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp9/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp10/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp11/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp12/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp13/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp14/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp15/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp16/deepseekr1t2_vi.json",
#     "../../stepResults/step2b_ce/exp17/deepseekr1t2_vi.json",
# ]

# INPUT_FILES = [
#     "../../stepResults/step2b_ce/exp1/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp2/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp3/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp4/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp5/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp6/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp7/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp8/gemini25flash_vi.json",
#     "../../stepResults/step2b_ce/exp9/gemini25flash_vi.json",
# ]

# INPUT_FILES = [
#     "../../results_from_generate/stepResults/step3/exp1/gpt52_en.json",
#     "../../results_from_generate/stepResults/step3/exp2/gpt52_en.json",
#     "../../results_from_generate/stepResults/step3/exp3/gpt52_en.json",
#     "../../results_from_generate/stepResults/step3/exp4/gpt52_en.json",
#     "../../results_from_generate/stepResults/step3/exp5/gpt52_en.json",
#     "../../results_from_generate/stepResults/step3/exp6/gpt52_en.json",
#     "../../results_from_generate/stepResults/step3/exp7/gpt52_en.json"
    
# ]

INPUT_FILES = [
    "../../results_from_generate/stepResults/step3/exp1/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp2/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp3/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp4/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp5/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp6/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp7/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp8/gpt52_vi.json",
    "../../results_from_generate/stepResults/step3/exp9/gpt52_vi.json"

]



# FINAL_FILE = "../../final/gemini25flash_vi.json"
# FINAL_FILE = "../../final/deepseekr1t2_vi.json"
FINAL_FILE = "../../results_from_generate/final/gpt52_vi.json"


os.makedirs(os.path.dirname(FINAL_FILE), exist_ok=True)

KEEP_FIELDS = ["title", "context", "question", "answer"]
LANG = "vi"


# =========================
# MAIN
# =========================
def rebuild_final():
    grouped = defaultdict(list)
    seen_keys = set()

    total_loaded = 0
    total_added = 0
    total_skipped = 0

    for path in INPUT_FILES:
        if not os.path.isfile(path):
            print(f"⚠ Missing input file: {path}")
            continue

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        print(f"📂 Loaded {len(data)} QA from {path}")
        total_loaded += len(data)

        for qa in data:
            # chỉ lấy QA đã pass
            if qa.get("verified") is not True or qa.get("verified_step2") is not True:
                continue

            raw_title = qa.get("title", "__NO_TITLE__")
            question = qa.get("question", "").strip()

            # 🔑 NORMALIZE
            norm_title = normalize_title(raw_title, lang=LANG)
            norm_question = question.lower().strip()

            key = (norm_title, norm_question)
            if key in seen_keys:
                total_skipped += 1
                continue

            seen_keys.add(key)

            grouped[norm_title].append({
                "title": raw_title.strip(),   # giữ title gốc để trace
                "context": qa.get("context", ""),
                "question": question,
                "answer": qa.get("answer", ""),
            })

            total_added += 1

    # ---- Flatten ----
    final_qas = []
    for qas in grouped.values():
        final_qas.extend(qas)

    # ---- Write final (OVERWRITE) ----
    with open(FINAL_FILE, "w", encoding="utf-8") as f:
        json.dump(final_qas, f, ensure_ascii=False, indent=2)

    # ---- Report ----
    print(
        f"\n✅ FINAL REBUILT (MULTI-EXPERIMENT MERGE)\n"
        f"   Input files        : {len(INPUT_FILES)}\n"
        f"   QA loaded          : {total_loaded}\n"
        f"   QA added (unique)  : {total_added}\n"
        f"   QA skipped (dup)   : {total_skipped}\n"
        f"   Total final QA     : {len(final_qas)}\n"
        f"   Total titles       : {len(grouped)}\n"
        f"   Output             : {FINAL_FILE}"
    )


if __name__ == "__main__":
    rebuild_final()
