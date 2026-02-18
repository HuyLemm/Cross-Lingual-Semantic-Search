import os
import json
import re
import unicodedata

# =========================
# NORMALIZE TITLE (ROBUST)
# =========================
def normalize_title(title: str) -> str:
    """
    Normalize title mạnh hơn:
    - Unicode NFC
    - lowercase
    - remove punctuation
    - fix missing spaces between words (Bangladeshperspectives -> Bangladesh perspectives)
    - unify whitespace
    """

    # Unicode normalize
    title = unicodedata.normalize("NFC", title)

    # Lowercase
    title = title.lower()

    # Replace punctuation with space
    title = re.sub(r"[:\-\_]", " ", title)

    # Remove other punctuation
    title = re.sub(r"[^\w\s]", "", title)

    # Fix missing space between letters (abcDEF -> abc DEF)
    title = re.sub(r"([a-z])([A-Z])", r"\1 \2", title)

    # Fix glued words like "bangladeshperspectives"
    title = re.sub(r"(bangladesh)(perspectives)", r"\1 \2", title)

    # Normalize whitespace
    title = re.sub(r"\s+", " ", title).strip()

    return title


# =========================
# LOAD QA JSON
# =========================
with open("genData/gptData/input_en_gpt.json", "r", encoding="utf-8") as f:
    qa_data = json.load(f)

qa_titles = set()

for item in qa_data:
    if "title" in item:
        qa_titles.add(normalize_title(item["title"]))


# =========================
# CHECK PDF FILES
# =========================
articles_folder = "backend/data/articles_en"

pdf_files = [
    f for f in os.listdir(articles_folder)
    if f.lower().endswith(".pdf")
]

files_with_qa = []
files_without_qa = []


def has_match(pdf_title_norm, qa_titles):
    # exact match
    if pdf_title_norm in qa_titles:
        return True

    # fuzzy contain match
    for qa in qa_titles:
        if pdf_title_norm in qa or qa in pdf_title_norm:
            return True

    return False


for pdf in pdf_files:
    title_from_file = os.path.splitext(pdf)[0]
    normalized_pdf_title = normalize_title(title_from_file)

    if has_match(normalized_pdf_title, qa_titles):
        files_with_qa.append(pdf)
    else:
        files_without_qa.append(pdf)


# =========================
# COUNT
# =========================
total_files = len(pdf_files)
num_with_qa = len(files_with_qa)
num_without_qa = len(files_without_qa)


# =========================
# PRINT RESULT
# =========================
print(f"Tổng số file PDF: {total_files}")
print(f"Số file đã có QA: {num_with_qa}")
print(f"Số file chưa có QA: {num_without_qa}")

if files_without_qa:
    print("\nDanh sách file CHƯA có QA:\n")
    for idx, file in enumerate(sorted(files_without_qa), start=1):
        print(f"{idx}. {file}")
        if idx % 3 == 0:
            print()
else:
    print("\nTất cả file đều đã có QA.")
