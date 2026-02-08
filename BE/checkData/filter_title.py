import os
import json
import re
import unicodedata

# =========================
# DATASET CONFIG
# =========================
DATASETS = {
    "1": {
        "name": "GPT_VI",
        "lang": "vi",
        "pdf_folder": "../backend/data/articles_vi",
        "input": "../genData/gptData/input_vi_gpt_dedup.json",
        "output": "../genData/gptData/input_vi_gpt_filtered.json",
    },
    "2": {
        "name": "GPT_EN",
        "lang": "en",
        "pdf_folder": "../backend/data/articles_en",
        "input": "../genData/gptData/input_en_gpt_dedup.json",
        "output": "../genData/gptData/input_en_gpt_filtered.json",
    },
    "3": {
        "name": "GEMINI_VI",
        "lang": "vi",
        "pdf_folder": "../backend/data/articles_vi",
        "input": "../genData/geminiData/exp2/input2_vi_gemini_dedup.json",
        "output": "../genData/geminiData/exp2/input2_vi_gemini_filtered.json",
    },
    "4": {
        "name": "GEMINI_EN",
        "lang": "en",
        "pdf_folder": "../backend/data/articles_en",
        "input": "../genData/geminiData/exp5/input5_en_gemini_dedup.json",
        "output": "../genData/geminiData/exp5/input5_en_gemini_filtered.json",
    },
    "5": {
        "name": "DEEPSEEK_VI",
        "lang": "vi",
        "pdf_folder": "../backend/data/articles_vi",
        "input": "../genData/deepseekData/exp8/input8_vi_deepseek_dedup.json",
        "output": "../genData/deepseekData/exp8/input8_vi_deepseek_filtered.json",
    },
    "6": {
        "name": "DEEPSEEK_EN",
        "lang": "en",
        "pdf_folder": "../backend/data/articles_en",
        "input": "../genData/deepseekData/exp13/input13_en_deepseek_dedup.json",
        "output": "../genData/deepseekData/exp13/input13_en_deepseek_filtered.json",
    },
}

# =========================
# NORMALIZE
# =========================
def normalize_vi(text: str) -> str:
    """
    Normalize mạnh cho tiếng Việt
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
# LOAD
# =========================
def load_pdf_titles(folder, normalize_fn):
    return {
        normalize_fn(f.replace(".pdf", ""))
        for f in os.listdir(folder)
        if f.lower().endswith(".pdf")
    }


def load_qas(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# =========================
# MAIN
# =========================
def main():
    print("🧹 FILTER + INPUT CHECK")
    print("=" * 45)
    for k, v in DATASETS.items():
        print(f"{k}. {v['name']}")

    choice = input("\n👉 Nhập số (1–6): ").strip()

    if choice not in DATASETS:
        print("❌ Lựa chọn không hợp lệ")
        return

    cfg = DATASETS[choice]
    normalize_fn = normalize_vi if cfg["lang"] == "vi" else normalize_en

    print(f"\n🚀 FILTERING DATASET: {cfg['name']}")
    print("=" * 50)

    pdf_titles = load_pdf_titles(cfg["pdf_folder"], normalize_fn)
    qas = load_qas(cfg["input"])

    # =========================
    # FILTER QA
    # =========================
    filtered_qas = [
        qa for qa in qas
        if normalize_fn(qa.get("title", "")) in pdf_titles
    ]

    # =========================
    # TITLE SETS
    # =========================
    qa_title_set = {normalize_fn(qa["title"]) for qa in filtered_qas}

    processed_pdf = len(pdf_titles & qa_title_set)
    missing_pdf = sorted(pdf_titles - qa_title_set)
    extra_titles = sorted(qa_title_set - pdf_titles)

    # =========================
    # REPORT
    # =========================
    print(f"📂 Tổng PDF trong folder : {len(pdf_titles)}")
    print(f"📥 QA ban đầu            : {len(qas)}")
    print(f"🧹 QA sau khi lọc        : {len(filtered_qas)}")
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

    # =========================
    # SAVE
    # =========================
    with open(cfg["output"], "w", encoding="utf-8") as f:
        json.dump(filtered_qas, f, ensure_ascii=False, indent=2)

    print("\n💾 Đã lưu file:")
    print("   ", cfg["output"])
    print("\n🎉 DONE — số liệu giờ là CHUẨN")


if __name__ == "__main__":
    main()
