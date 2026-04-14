#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from pathlib import Path
from typing import List, Dict, Any, Tuple

# ===== FOLDER PATHS =====
FOLDERS = [
    Path("./before_nli"),
    Path("./after_nli"),
]


def load_json(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Không tìm thấy file: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(f"File {path} không phải dạng list JSON")

    return data


def is_true(value: Any) -> bool:
    return str(value).strip().lower() == "true"


def count_file(path: Path) -> Tuple[int, int]:
    data = load_json(path)
    total = len(data)
    correct = sum(1 for item in data if is_true(item.get("check_human", "")))
    return correct, total


def process_folder(folder: Path) -> None:
    print("=" * 70)
    print(f"[FOLDER] {folder}")

    if not folder.exists():
        print(f"[ERROR] Folder không tồn tại: {folder}")
        return

    json_files = sorted(folder.glob("*.json"))
    if not json_files:
        print("[INFO] Không có file JSON nào trong folder này.")
        return

    folder_correct = 0
    folder_total = 0

    for file_path in json_files:
        try:
            correct, total = count_file(file_path)
            percent = (correct / total * 100) if total > 0 else 0.0

            folder_correct += correct
            folder_total += total

            print(
                f"{file_path.name}: {correct}/{total} "
                f"({percent:.2f}%)"
            )

        except Exception as e:
            print(f"[ERROR] Lỗi khi xử lý {file_path.name}: {e}")

    folder_percent = (folder_correct / folder_total * 100) if folder_total > 0 else 0.0

    print("-" * 70)
    print(
        f"[TOTAL {folder.name}] {folder_correct}/{folder_total} "
        f"({folder_percent:.2f}%)"
    )
    print("=" * 70)
    print()


def main():
    for folder in FOLDERS:
        process_folder(folder)


if __name__ == "__main__":
    main()