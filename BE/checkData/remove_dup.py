import json
import re
import unicodedata
from typing import List, Dict

# =========================
# DATASET CONFIG
# =========================
DATASETS = {
    "1": {
        "name": "GPT_VI",
        "lang": "vi",
        "input": "../genData/gptData/input_vi_gpt.json",
        "output": "../genData/gptData/input_vi_gpt_dedup.json",
    },
    "2": {
        "name": "GPT_EN",
        "lang": "en",
        "input": "../genData/gptData/input_en_gpt.json",
        "output": "../genData/gptData/input_en_gpt_dedup.json",
    },
    "3": {
        "name": "GEMINI_VI",
        "lang": "vi",
        "input": "../genData/geminiData/exp2/input2_vi_gemini.json",
        "output": "../genData/geminiData/exp2/input2_vi_gemini_dedup.json",
    },
    "4": {
        "name": "GEMINI_EN",
        "lang": "en",
        "input": "../genData/geminiData/exp5/input5_en_gemini.json",
        "output": "../genData/geminiData/exp5/input5_en_gemini_dedup.json",
    },
    "5": {
        "name": "DEEPSEEK_VI",
        "lang": "vi",
        "input": "../genData/deepseekData/exp8/input8_vi_deepseek.json",
        "output": "../genData/deepseekData/exp8/input8_vi_deepseek_dedup.json",
    },
    "6": {
        "name": "DEEPSEEK_EN",
        "lang": "en",
        "input": "../genData/deepseekData/exp13/input13_en_deepseek.json",
        "output": "../genData/deepseekData/exp13/input13_en_deepseek_dedup.json",
    },
}

# =========================
# NORMALIZE
# =========================
def normalize_vi(text: str) -> str:
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
# CORE LOGIC
# =========================
def keep_first_batch_per_title(
    qas: List[Dict],
    normalize_fn
) -> List[Dict]:
    """
    Với mỗi title:
    - Giữ batch QA đầu tiên
    - Loại bỏ các batch sau (do chạy lại pipeline)
    """

    result = []
    seen_title = set()

    current_title = None
    current_norm_title = None
    current_batch = []

    def flush_batch():
        nonlocal result, current_batch, current_norm_title
        if current_batch and current_norm_title not in seen_title:
            result.extend(current_batch)
            seen_title.add(current_norm_title)
        current_batch = []

    for qa in qas:
        raw_title = qa["title"]
        norm_title = normalize_fn(raw_title)

        # sang title mới
        if norm_title != current_norm_title:
            flush_batch()
            current_norm_title = norm_title

        current_batch.append(qa)

    # flush batch cuối
    flush_batch()

    return result


# =========================
# MAIN
# =========================
def main():
    print("🧹 CHỌN DATASET ĐỂ DEDUP (GIỮ BATCH ĐẦU)")
    print("=" * 45)
    for k, v in DATASETS.items():
        print(f"{k}. {v['name']}")

    choice = input("\n👉 Nhập số (1–6): ").strip()

    if choice not in DATASETS:
        print("❌ Lựa chọn không hợp lệ")
        return

    cfg = DATASETS[choice]
    normalize_fn = normalize_vi if cfg["lang"] == "vi" else normalize_en

    with open(cfg["input"], "r", encoding="utf-8") as f:
        qas = json.load(f)

    print(f"\n📥 QA ban đầu: {len(qas)}")

    cleaned = keep_first_batch_per_title(qas, normalize_fn)

    print(f"🧹 QA sau khi lọc: {len(cleaned)}")
    print(f"❌ Đã loại bỏ: {len(qas) - len(cleaned)} QA")

    with open(cfg["output"], "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Đã lưu file mới:")
    print(f"   {cfg['output']}")
    print("\n🎉 DEDUP DONE")


if __name__ == "__main__":
    main()
