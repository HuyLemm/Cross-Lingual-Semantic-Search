import json
import os

# =========================
# CONFIG
# =========================
INPUT_FILE = "final_full_vi.json"

OUTPUT_07 = "final_07_vi.json"
OUTPUT_08 = "final_08_vi.json"

THRESHOLD_07 = 0.7
THRESHOLD_08 = 0.8


# =========================
# LOAD
# =========================
def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# =========================
# FILTER
# =========================
def filter_data(data, threshold):
    results = []

    for item in data:
        bi_score = float(item.get("bi_score", 0))
        ce_prob = float(item.get("ce_prob", 0))

        if bi_score >= threshold and ce_prob >= threshold:
            results.append({
                "title": item["title"],
                "context": item["context"],
                "question": item["question"]
            })

    return results


# =========================
# MAIN
# =========================
def main():
    if not os.path.isfile(INPUT_FILE):
        raise FileNotFoundError(f"Không tìm thấy file: {INPUT_FILE}")

    data = load_json(INPUT_FILE)

    print(f"Tổng số item: {len(data)}")

    data_07 = filter_data(data, THRESHOLD_07)
    data_08 = filter_data(data, THRESHOLD_08)

    save_json(OUTPUT_07, data_07)
    save_json(OUTPUT_08, data_08)

    print("\n=== RESULT ===")
    print(f">= 0.7: {len(data_07)} ({len(data_07)/len(data):.1%})")
    print(f">= 0.8: {len(data_08)} ({len(data_08)/len(data):.1%})")

    print(f"\nSaved:")
    print(f"- {OUTPUT_07}")
    print(f"- {OUTPUT_08}")


# =========================
# ENTRY
# =========================
if __name__ == "__main__":
    main()