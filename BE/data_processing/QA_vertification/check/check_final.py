import os
import json
from collections import defaultdict
import re
import unicodedata

# =========================
# CONFIG
# =========================
# INPUT_FILE = "../../results_from_generate/final/deepseekr1t2_vi.json"
INPUT_FILE = "../../results_from_generate/final/gemini25flash_vi.json"
ARTICLES_DIR = "../../backend/data/articles_vi"
MIN_QA_PER_PDF = 7


# =========================
# NORMALIZATION (MATCH genQA)
# =========================
def norm_title(s: str) -> str:
    if not s:
        return ""

    s = s.strip().lower()

    # remove .pdf
    if s.endswith(".pdf"):
        s = s[:-4]

    # unicode normalize
    s = unicodedata.normalize("NFKD", s)

    # map đ / Đ
    s = s.replace("đ", "d").replace("Đ", "d")

    # remove accent marks
    s = "".join(c for c in s if not unicodedata.combining(c))

    # remove punctuation
    s = re.sub(r"[^a-z0-9\s]", " ", s)

    # collapse spaces
    s = " ".join(s.split())

    return s


# =========================
# ANALYSIS
# =========================
def analyze_dataset():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"🔍 Total QA loaded: {len(data)}\n")

    # ======================================================
    # 🔧 FIX: FORCE GROUPING BY NORMALIZED TITLE
    # ======================================================
    grouped = defaultdict(list)
    for qa in data:
        grouped[norm_title(qa.get("title", ""))].append(qa)

    fixed_data = []
    for title in sorted(grouped.keys()):
        fixed_data.extend(grouped[title])

    data = fixed_data
    print("🛠 QA regrouped & sorted by normalized title\n")

    # =========================
    # 0. PDF COVERAGE CHECK
    # =========================
    print("📁 PDF COVERAGE CHECK (articles_en)")

    if not os.path.isdir(ARTICLES_DIR):
        print(f"❌ Folder not found: {ARTICLES_DIR}")
        pdf_titles = set()
    else:
        pdf_files = [
            fn for fn in os.listdir(ARTICLES_DIR)
            if fn.lower().endswith(".pdf")
        ]
        pdf_titles = {norm_title(fn) for fn in pdf_files}
        print(f"• PDFs found: {len(pdf_files)}")

    qa_titles = {
        norm_title(qa.get("title", ""))
        for qa in data
        if qa.get("title")
    }

    print(f"• Unique QA titles (normalized): {len(qa_titles)}")

    missing_qas = sorted(pdf_titles - qa_titles)
    extra_qas = sorted(qa_titles - pdf_titles)

    if missing_qas:
        print(f"❌ PDFs with NO QA found: {len(missing_qas)}")
        for t in missing_qas[:30]:
            print(f"  - {t}")
        if len(missing_qas) > 30:
            print("  ... (truncated)")
    else:
        print("✅ Every PDF has at least 1 QA title match")

    if extra_qas:
        print(f"⚠ QA titles with NO matching PDF: {len(extra_qas)}")
        for t in extra_qas[:30]:
            print(f"  - {t}")
        if len(extra_qas) > 30:
            print("  ... (truncated)")
    else:
        print("✅ Every QA title matches a PDF filename")

    # =========================
    # 1. COUNT QA PER TITLE
    # =========================
    title_counts = defaultdict(int)
    raw_titles = defaultdict(set)

    for qa in data:
        raw = qa.get("title", "")
        nt = norm_title(raw)
        title_counts[nt] += 1
        raw_titles[nt].add(raw)

    more_than_7 = {t: c for t, c in title_counts.items() if c > MIN_QA_PER_PDF}
    equal_7 = {t: c for t, c in title_counts.items() if c == MIN_QA_PER_PDF}
    less_than_7 = {t: c for t, c in title_counts.items() if c < MIN_QA_PER_PDF}

    print("\n📊 TITLE COUNT SUMMARY (NORMALIZED)")
    print(f"• Titles > 7 QA   : {len(more_than_7)}")
    print(f"• Titles = 7 QA   : {len(equal_7)}")
    print(f"• Titles < 7 QA   : {len(less_than_7)}\n")

    # =========================
    # 2. TITLES < 7 QA
    # =========================
    if less_than_7:
        print("🟡 TITLES WITH < 7 QA (NEED REGEN)")
        for t, c in sorted(less_than_7.items(), key=lambda x: x[1]):
            raws = " | ".join(sorted(raw_titles[t]))
            print(f"  - {c:>2} QA | {raws}")
    else:
        print("✅ All titles have at least 7 QA")

    # =========================
    # 3. DUPLICATE QUESTION CHECK
    # =========================
    question_seen = {}
    duplicated_questions = []

    for idx, qa in enumerate(data):
        q = qa.get("question", "").strip()
        if not q:
            continue
        if q in question_seen:
            duplicated_questions.append((q, question_seen[q], idx))
        else:
            question_seen[q] = idx

    print("\n🔁 DUPLICATE QUESTION CHECK")
    if not duplicated_questions:
        print("✅ No duplicate questions found")
    else:
        print(f"❌ Found {len(duplicated_questions)} duplicated questions:")
        for q, first_i, dup_i in duplicated_questions[:10]:
            print(f"  - Index {first_i} & {dup_i}")
            print(f"    {q}")
        if len(duplicated_questions) > 10:
            print("  ... (truncated)")

    # =========================
    # 4. GROUPING CHECK
    # =========================
    print("\n📚 TITLE GROUPING CHECK (NORMALIZED)")

    seen_titles = set()
    last_title = None

    for i, qa in enumerate(data):
        current_title = norm_title(qa.get("title", ""))
        if current_title != last_title:
            if current_title in seen_titles:
                print(
                    f"❌ Grouping broken at index {i}: "
                    f"title '{current_title}' reappears"
                )
                break
            seen_titles.add(current_title)
        last_title = current_title
    else:
        print("✅ All QA with the same title are grouped together correctly")


if __name__ == "__main__":
    analyze_dataset()
