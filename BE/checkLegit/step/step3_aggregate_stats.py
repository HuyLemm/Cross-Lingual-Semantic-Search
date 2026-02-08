import os
import json
from collections import defaultdict

# =========================
# CONFIG
# =========================
INPUT_DIR = "../../step2b_ce/exp3"   # nơi chứa QA đã qua paraphrase + cross-encoder

# nếu bạn đang để file ở ../validated_dual hoặc ../validated thì đổi lại cho đúng
# ví dụ:
# INPUT_DIR = "../validated_ce"

FILES = [
    "deepseekr1t2_en.json",
    "deepseekr1t2_vi.json",
    "gemini25flash_en.json",
    "gemini25flash_vi.json",
    "gpt52_en.json",
    "gpt52_vi.json",
]


def process_file(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = len(data)

    paraphrase_ok = sum(1 for qa in data if qa.get("verified") is True)
    ce_ok = sum(1 for qa in data if qa.get("verified_step2") is True)

    both_ok = sum(
        1 for qa in data
        if qa.get("verified") is True and qa.get("verified_step2") is True
    )

    either_ok = sum(
        1 for qa in data
        if qa.get("verified") is True or qa.get("verified_step2") is True
    )

    return {
        "total": total,
        "paraphrase_ok": paraphrase_ok,
        "ce_ok": ce_ok,
        "both_ok": both_ok,
        "either_ok": either_ok,
    }


def main():
    print("\n=== STEP 3: DATASET QUALITY SUMMARY ===\n")

    grand = defaultdict(int)

    for fname in FILES:
        path = os.path.join(INPUT_DIR, fname)
        if not os.path.exists(path):
            print(f"⚠ Missing file: {fname}")
            continue

        stats = process_file(path)

        total = stats["total"]
        p_ok = stats["paraphrase_ok"]
        ce_ok = stats["ce_ok"]
        both = stats["both_ok"]
        either = stats["either_ok"]

        print(f"{fname}")
        print(f"  Total QA            : {total}")
        print(f"  Paraphrase verified : {p_ok} ({p_ok/total*100:.1f}%)")
        print(f"  Cross-Encoder ok    : {ce_ok} ({ce_ok/total*100:.1f}%)")
        print(f"  Both steps passed   : {both} ({both/total*100:.1f}%)")
        print(f"  Either step passed  : {either} ({either/total*100:.1f}%)")
        print("-" * 50)

        for k, v in stats.items():
            grand[k] += v

    print("\n=== OVERALL DATASET ===")
    if grand["total"] > 0:
        print(f"Total QA               : {grand['total']}")
        print(
            f"Paraphrase verified    : {grand['paraphrase_ok']} "
            f"({grand['paraphrase_ok']/grand['total']*100:.1f}%)"
        )
        print(
            f"Cross-Encoder verified : {grand['ce_ok']} "
            f"({grand['ce_ok']/grand['total']*100:.1f}%)"
        )
        print(
            f"Both steps passed      : {grand['both_ok']} "
            f"({grand['both_ok']/grand['total']*100:.1f}%)"
        )
        print(
            f"Either step passed     : {grand['either_ok']} "
            f"({grand['either_ok']/grand['total']*100:.1f}%)"
        )
    else:
        print("No data found.")


if __name__ == "__main__":
    main()
