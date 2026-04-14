#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from pathlib import Path
from typing import List, Dict, Any

# PATH
INPUT_PATH = Path("./after/gpt_en.json")
OUTPUT_PATH = Path("./final/gpt_en.json")


def load_json(path: Path) -> List[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: List[Dict[str, Any]]):
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def filter_pass(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    results = []

    for item in data:
        if item.get("is_pass", False):
            results.append({
                "title": item.get("title", ""),
                "context": item.get("context", ""),
                "question": item.get("question", ""),
                "answer": item.get("answer", "")
            })

    return results


def main():
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"Không tìm thấy file: {INPUT_PATH}")

    print(f"[INFO] Loading: {INPUT_PATH}")
    data = load_json(INPUT_PATH)

    print(f"[INFO] Total input: {len(data)}")

    filtered = filter_pass(data)

    print(f"[INFO] PASS count: {len(filtered)}")
    print(f"[INFO] Removed: {len(data) - len(filtered)}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    save_json(OUTPUT_PATH, filtered)

    print(f"[DONE] Saved to: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()