import json
import os

REQUIRED_FIELDS = [
    "qa_id",
    "model",
    "language",
    "source_pdf",
    "pdf_match_score",
    "title",
    "context",
    "question",
    "answer"
]

INPUT_DIR = "../results_from_generated/stepResults/step1"


def check_file(path):
    with open(path, "r", encoding="utf-8") as f:
        qa_list = json.load(f)

    total = len(qa_list)
    valid = 0
    invalid = []

    for idx, qa in enumerate(qa_list):
        missing = [f for f in REQUIRED_FIELDS if f not in qa or qa[f] in ["", None]]

        if missing:
            invalid.append({
                "index": idx,
                "qa_id": qa.get("qa_id", "UNKNOWN"),
                "missing_fields": missing
            })
        else:
            valid += 1

    return total, valid, invalid


def main():
    print("=== QA SCHEMA CHECK REPORT ===\n")

    for fname in os.listdir(INPUT_DIR):
        if not fname.endswith(".json"):
            continue

        path = os.path.join(INPUT_DIR, fname)
        total, valid, invalid = check_file(path)

        print(f"File: {fname}")
        print(f"  Total QA: {total}")
        print(f"  Valid QA: {valid} ({valid/total:.1%})")
        print(f"  Invalid QA: {len(invalid)}")

        if invalid:
            print("  Sample issues:")
            for item in invalid[:3]:  # in tối đa 3 lỗi mẫu
                print(
                    f"    - index {item['index']} | "
                    f"qa_id={item['qa_id']} | "
                    f"missing={item['missing_fields']}"
                )
        print()


if __name__ == "__main__":
    main()
