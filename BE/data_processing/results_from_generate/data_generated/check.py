import os
import json
import re
import unicodedata
from collections import defaultdict


def normalize_title(title: str, lang: str = "en") -> str:
    """
    Normalize title dùng chung cho EN / VI
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
# COUNT QA PER TITLE
# =========================
def count_qas_from_json(json_path: str, lang: str = "en"):

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    title_counts = defaultdict(int)

    for item in data:
        title = item.get("title", "").strip()
        if not title:
            continue

        normalized = normalize_title(title, lang)
        title_counts[normalized] += 1

    return title_counts


# =========================
# LOAD PDF TITLES
# =========================
def load_titles_from_articles_folder(folder_path: str, lang: str = "en"):
    pdf_titles = []

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            raw_title = os.path.splitext(filename)[0]
            normalized = normalize_title(raw_title, lang)
            pdf_titles.append((raw_title, normalized))

    pdf_titles.sort(key=lambda x: x[0].lower())
    return pdf_titles


# =========================
# CHECK TITLES < 7 QA
# =========================
def print_titles_less_than_7(json_path: str, articles_folder: str, lang: str = "en"):

    title_counts = count_qas_from_json(json_path, lang)
    pdf_titles = load_titles_from_articles_folder(articles_folder, lang)

    missing = []

    for raw_title, normalized_title in pdf_titles:
        qa_count = title_counts.get(normalized_title, 0)

        if qa_count < 7:
            missing.append((raw_title, qa_count))

    print(f"Tổng số title có < 7 QA: {len(missing)}\n")

    for i, (title, count) in enumerate(missing, 1):
        print(f"{i}. {title}  -->  {count} QA")

        if i % 3 == 0:
            print()


# =========================
# MAIN
# =========================
if __name__ == "__main__":

    json_path = "../final/gpt52_vi.json"
    articles_folder = "../../../backend/data_articles/articles_vi"

    print_titles_less_than_7(json_path, articles_folder, lang="vi")