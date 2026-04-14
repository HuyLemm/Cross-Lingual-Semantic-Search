import os
import json
from typing import Any, Dict, List, Optional, Tuple, Set

BASE_DIR = "step_completed"
CANDIDATE_LIST_KEYS = ["qas", "qa", "data", "items", "results"]

deleted_titles: Set[str] = set()
deleted_count = 0


# =========================
# IO
# =========================
def load_json(path: str) -> Optional[Any]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ JSON read error: {path} | {e}")
        return None


def save_json(path: str, obj: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


# =========================
# EXTRACT QA LIST
# =========================
def extract_qa_list(obj: Any) -> Tuple[Optional[List[Dict[str, Any]]], Optional[str]]:
    if isinstance(obj, list) and all(isinstance(x, dict) for x in obj):
        return obj, None

    if isinstance(obj, dict):
        for k in CANDIDATE_LIST_KEYS:
            v = obj.get(k)
            if isinstance(v, list) and all(isinstance(x, dict) for x in v):
                return v, k

    return None, None


# =========================
# SORT
# =========================
def safe_int(x: Any, default: int = 10**12) -> int:
    try:
        return int(x)
    except Exception:
        return default


def qa_sort_key(item):
    idx, qa = item
    chunk_id = qa.get("chunk_id")
    if chunk_id is not None:
        return (0, safe_int(chunk_id), qa.get("qa_id", ""), idx)
    return (1, qa.get("qa_id", ""), idx)


def has_valid_chunk_preview(qa: Dict[str, Any]) -> bool:
    v = qa.get("chunk_preview", None)
    return isinstance(v, str) and v.strip() != ""


# =========================
# PROCESS FILE
# =========================
def process_chunked_file(path: str):
    global deleted_titles, deleted_count

    obj = load_json(path)
    if obj is None:
        return

    qas, wrapper_key = extract_qa_list(obj)
    if qas is None:
        return

    original_count = len(qas)

    kept = []
    removed_here = 0

    for qa in qas:
        if not has_valid_chunk_preview(qa):
            removed_here += 1
            deleted_count += 1
            deleted_titles.add(str(qa.get("title", "UNKNOWN_TITLE")))
        else:
            kept.append(qa)

    # sort
    indexed = list(enumerate(kept))
    indexed.sort(key=qa_sort_key)
    sorted_qas = [qa for _, qa in indexed]

    # re-index qa_id theo (model, language)
    counters = {}
    for qa in sorted_qas:
        model = qa.get("model", "unknown")
        lang = qa.get("language", "xx")
        key = (model, lang)

        if key not in counters:
            counters[key] = 0

        qa["qa_id"] = f"QA_{model}_{lang}_{counters[key]:06d}"
        counters[key] += 1

    # ===== WRITE TO NON-CHUNKED FILE =====
    non_chunked_path = path.replace("_chunked.json", ".json")

    if wrapper_key is None:
        new_obj = sorted_qas
    else:
        obj[wrapper_key] = sorted_qas
        new_obj = obj

    save_json(non_chunked_path, new_obj)

    print(f"✔ Processed: {path}")
    print(f"   → Written to: {non_chunked_path}")
    print(f"   Removed QA (missing chunk_preview): {removed_here}")
    print(f"   Remaining                         : {len(sorted_qas)}")


# =========================
# MAIN
# =========================
def main():
    for root, _, files in os.walk(BASE_DIR):
        for fn in files:
            if not fn.endswith("_chunked.json"):
                continue

            full_path = os.path.join(root, fn)
            process_chunked_file(full_path)

    print("\n===== DONE =====")
    print(f"Total deleted QA (missing chunk_preview): {deleted_count}")
    print(f"Unique titles affected                  : {len(deleted_titles)}")

    if deleted_titles:
        print("\nTitles of deleted QAs:")
        for t in sorted(deleted_titles):
            print(" -", t)


if __name__ == "__main__":
    main()