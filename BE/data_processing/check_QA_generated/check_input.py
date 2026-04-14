import os
import json
import re
import unicodedata
from collections import Counter, defaultdict

# =========================
# DATASET CONFIG
# =========================
DATASETS = {
    "1": {
        "name": "GPT_VI",
        "lang": "vi",
        "pdf_folder": "../articles_vi",
        "qa_json": "../gptData/input_vi_gpt.json",
    },
    "2": {
        "name": "GPT_EN",
        "lang": "en",
        "pdf_folder": "../articles_en",
        "qa_json": "../gptData/input_en_gpt.json",
    },
    "3": {
        "name": "GEMINI_VI",
        "lang": "vi",
        "pdf_folder": "../articles_vi",
        "qa_json": "../geminiData/input_vi_gemini_filtered.json",
    },
    "4": {
        "name": "GEMINI_EN",
        "lang": "en",
        "pdf_folder": "../articles_en",
        "qa_json": "../geminiData/input_en_gemini_filtered.json",
    },
    "5": {
        "name": "DEEPSEEK_VI",
        "lang": "vi",
        "pdf_folder": "../articles_vi",
        "qa_json": "../deepseekData/input_vi_deepseek_filtered.json",
    },
    "6": {
        "name": "DEEPSEEK_EN",
        "lang": "en",
        "pdf_folder": "../articles_en",
        "qa_json": "../deepseekData/input_en_deepseek_filtered.json",
    },
}

# =========================
# NORMALIZE
# =========================
def normalize_vi(text: str) -> str:
    """
    Normalize mạnh cho tiếng Việt:
    - Unicode NFC
    - remove NBSP
    - collapse whitespace
    - remove space inside words
    """
    text = unicodedata.normalize("NFC", text)
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"(?<=\w)\s+(?=\w)", "", text)
    return text.lower().strip()


def normalize_en(text: str) -> str:
    text = text.lower()
    text = text.replace(".pdf", "")
    # 🔥 xoá toàn bộ ký tự không phải chữ & số
    text = re.sub(r"[^a-z0-9]", " ", text)
    # gộp nhiều space
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# =========================
# LOADERS
# =========================
def load_pdfs(pdf_folder, normalize_fn):
    return sorted(
        normalize_fn(f.replace(".pdf", ""))
        for f in os.listdir(pdf_folder)
        if f.lower().endswith(".pdf")
    )


def load_qa(qa_json):
    with open(qa_json, "r", encoding="utf-8") as f:
        return json.load(f)


# =========================
# CHECK INPUT
# =========================
def check_input(pdf_folder, qa_json, normalize_fn):
    pdf_titles = load_pdfs(pdf_folder, normalize_fn)
    qas = load_qa(qa_json)

    qa_titles = [normalize_fn(qa["title"]) for qa in qas]
    qa_title_set = set(qa_titles)

    total_pdf = len(pdf_titles)
    processed_pdf = len(set(pdf_titles) & qa_title_set)
    missing_pdf = sorted(set(pdf_titles) - qa_title_set)
    extra_titles = sorted(qa_title_set - set(pdf_titles))

    print("📊 INPUT CHECK REPORT")
    print("=" * 50)
    print(f"📂 Tổng PDF trong folder : {total_pdf}")
    print(f"✅ PDF đã có QA          : {processed_pdf}")
    print(f"❌ PDF còn thiếu QA      : {len(missing_pdf)}")
    print(f"⚠️ Title QA không có PDF : {len(extra_titles)}")

    if missing_pdf:
        print("\n📄 DANH SÁCH PDF THIẾU QA:")
        for t in missing_pdf:
            print("  -", t)

    if extra_titles:
        print("\n📄 TITLE QA KHÔNG CÓ PDF:")
        for t in extra_titles:
            print("  -", t)

    return qas, qa_titles


# =========================
# DUPLICATE CHECK
# =========================
def check_duplicate_qa(qas, normalize_fn):
    q_map = defaultdict(list)
    c_map = defaultdict(list)

    for i, qa in enumerate(qas):
        title = normalize_fn(qa["title"])
        q_key = normalize_fn(qa["question"])
        c_key = normalize_fn(qa["context"])

        q_map[(title, q_key)].append(i)
        c_map[(title, c_key)].append(i)

    dup_q = {k: v for k, v in q_map.items() if len(v) > 1}
    dup_c = {k: v for k, v in c_map.items() if len(v) > 1}

    return dup_q, dup_c


def check_multiple_runs_non_consecutive(qa_titles):
    """
    Flag title chỉ khi nó xuất hiện lại SAU khi đã bị ngắt quãng
    """
    seen = set()
    finished = set()
    bad_titles = defaultdict(int)

    prev = None
    for t in qa_titles:
        if t != prev:
            if t in finished:
                bad_titles[t] += 1
            if prev is not None:
                finished.add(prev)
        seen.add(t)
        prev = t

    return dict(bad_titles)



# =========================
# MAIN
# =========================
def main():
    print("🔎 CHỌN DATASET ĐỂ CHECK")
    print("=" * 40)
    for k, v in DATASETS.items():
        print(f"{k}. {v['name']}")

    choice = input("\n👉 Nhập số (1–6): ").strip()

    if choice not in DATASETS:
        print("❌ Lựa chọn không hợp lệ")
        return

    cfg = DATASETS[choice]
    normalize_fn = normalize_vi if cfg["lang"] == "vi" else normalize_en

    print(f"\n🚀 CHECKING DATASET: {cfg['name']}")
    print("=" * 50)

    qas, qa_titles = check_input(
        cfg["pdf_folder"],
        cfg["qa_json"],
        normalize_fn
    )

    print("\n🔍 DUPLICATE CHECK")
    print("=" * 50)

    dup_q, dup_c = check_duplicate_qa(qas, normalize_fn)

    print(f"❌ QA trùng QUESTION : {len(dup_q)} case")
    print(f"❌ QA trùng CONTEXT  : {len(dup_c)} case")

    multi = check_multiple_runs_non_consecutive(qa_titles)
    print(f"⚠️ Title nghi chạy lặp: {len(multi)}")

    if multi:
        print("\n📌 TITLE BỊ CHẠY LẶP:")
        for t, c in multi.items():
            print(f"  - {t}: {c} QA")

    print("\n✅ CHECK DONE")


if __name__ == "__main__":
    main()
