import os
import json
import unicodedata
import re

# =========================
# NORMALIZE
# =========================
def normalize_title(title: str, lang: str = "en") -> str:
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
#     "../../stepResults/step2b_ce/exp1/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp2/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp3/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp4/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp5/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp6/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp7/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp8/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp9/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp10/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp11/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp12/deepseekr1t2_en.json",
#     "../../stepResults/step2b_ce/exp13/deepseekr1t2_en.json",
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
#     "../../stepResults/step2b_ce/exp1/gemini25flash_en.json",
#     "../../stepResults/step2b_ce/exp2/gemini25flash_en.json",
#     "../../stepResults/step2b_ce/exp3/gemini25flash_en.json",
#     "../../stepResults/step2b_ce/exp4/gemini25flash_en.json",
#     "../../stepResults/step2b_ce/exp5/gemini25flash_en.json",
# ]

INPUT_FILES = [
    "../../stepResults/step2b_ce/exp1/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp2/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp3/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp4/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp5/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp6/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp7/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp8/gemini25flash_vi.json",
    "../../stepResults/step2b_ce/exp9/gemini25flash_vi.json",
]

# OUTPUT ROOT
FINAL_DIR = "../../final/geminiData_vi"
FRONTEND_DIR = "../../frontend/geminiData_vi"

# FINAL_DIR = "../../final/deepseekData_vi"
# FRONTEND_DIR = "../../frontend/deepseekData_vi"

os.makedirs(FINAL_DIR, exist_ok=True)
os.makedirs(FRONTEND_DIR, exist_ok=True)

LANG = "vi"

FINAL_KEEP_FIELDS = ["title", "context", "question", "answer"]

THRESHOLDS = {
    "07": 0.70,
    "075": 0.75,
    "08": 0.80,
    "085": 0.85,
    "09": 0.90,
}

# =========================
# SCORE FILTER
# =========================
def pass_threshold(qa, th):
    return (
        qa.get("sim_qc", 0) >= th and
        qa.get("sim_ac", 0) >= th and
        qa.get("ce_multi_prob", 0) >= th
    )

# =========================
# MAIN
# =========================
def build_multi_final():
    seen_keys = set()

    total_clean = []
    total_full = []

    buckets_clean = {k: [] for k in THRESHOLDS}
    buckets_full = {k: [] for k in THRESHOLDS}

    loaded = 0
    deduped = 0

    for path in INPUT_FILES:
        if not os.path.isfile(path):
            print(f"⚠ Missing file: {path}")
            continue

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        print(f"📂 Loaded {len(data)} QA from {path}")
        loaded += len(data)

        for qa in data:
            title = qa.get("title", "").strip()
            question = qa.get("question", "").strip()

            if not title or not question:
                continue

            key = (
                normalize_title(title, LANG),
                question.lower()
            )

            if key in seen_keys:
                deduped += 1
                continue

            seen_keys.add(key)

            # clean version (for final dataset)
            clean_qa = {k: qa.get(k, "") for k in FINAL_KEEP_FIELDS}

            # full version (for frontend / reporting)
            full_qa = qa

            total_clean.append(clean_qa)
            total_full.append(full_qa)

            for tag, th in THRESHOLDS.items():
                if pass_threshold(qa, th):
                    buckets_clean[tag].append(clean_qa)
                    buckets_full[tag].append(full_qa)

    # =========================
    # WRITE FILES
    # =========================

    outputs = [
        ("totalQA", total_clean, total_full),
        ("07filteredQA", buckets_clean["07"], buckets_full["07"]),
        ("075filteredQA", buckets_clean["075"], buckets_full["075"]),
        ("08filteredQA", buckets_clean["08"], buckets_full["08"]),
        ("085filteredQA", buckets_clean["085"], buckets_full["085"]),
        ("09filteredQA", buckets_clean["09"], buckets_full["09"]),
    ]

    for suffix, clean_qas, full_qas in outputs:
        final_path = os.path.join(
            FINAL_DIR, f"gemini_vi_{suffix}.json"
        )
        frontend_path = os.path.join(
            FRONTEND_DIR, f"gemini_vi_{suffix}.json"
        )

        with open(final_path, "w", encoding="utf-8") as f:
            json.dump(clean_qas, f, ensure_ascii=False, indent=2)

        with open(frontend_path, "w", encoding="utf-8") as f:
            json.dump(full_qas, f, ensure_ascii=False, indent=2)

        print(
            f"✅ {suffix}: "
            f"{len(clean_qas)} QA → final | "
            f"{len(full_qas)} QA → frontend"
        )

    print(
        f"\n📊 SUMMARY\n"
        f"   QA loaded  : {loaded}\n"
        f"   QA deduped : {deduped}\n"
        f"   Total QA   : {len(total_clean)}\n"
        f"   ≥0.70 QA   : {len(buckets_clean['07'])}\n"
        f"   ≥0.75 QA   : {len(buckets_clean['075'])}\n"
        f"   ≥0.80 QA   : {len(buckets_clean['08'])}\n"
        f"   ≥0.85 QA   : {len(buckets_clean['085'])}\n"
        f"   ≥0.90 QA   : {len(buckets_clean['09'])}"
    )

if __name__ == "__main__":
    build_multi_final()
