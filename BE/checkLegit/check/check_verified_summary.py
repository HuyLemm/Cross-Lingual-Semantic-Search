import os
import json

# =========================
# CONFIG
# =========================
VALIDATED_DIR = "../validated"   # thư mục output của Bước 2

FILES = [
    "deepseekr1t2_en.json",
    "deepseekr1t2_vi.json",
    "gemini25flash_en.json",
    "gemini25flash_vi.json",
    "gpt52_en.json",
    "gpt52_vi.json",
]


def check_file(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = len(data)
    verified = sum(1 for qa in data if qa.get("verified") is True)

    return total, verified


def main():
    print("=== VERIFIED QA SUMMARY ===\n")

    grand_total = 0
    grand_verified = 0

    for fname in FILES:
        path = os.path.join(VALIDATED_DIR, fname)

        if not os.path.exists(path):
            print(f"⚠ Missing file: {fname}")
            continue

        total, verified = check_file(path)
        percent = (verified / total * 100) if total > 0 else 0

        grand_total += total
        grand_verified += verified

        print(
            f"{fname:<25} "
            f"Verified: {verified:>5}/{total:<5} "
            f"({percent:>5.1f}%)"
        )

    print("\n-----------------------------")
    if grand_total > 0:
        print(
            f"TOTAL                 "
            f"Verified: {grand_verified}/{grand_total} "
            f"({grand_verified/grand_total*100:.1f}%)"
        )
    else:
        print("TOTAL: No data")


if __name__ == "__main__":
    main()
