import os
import json
import re
import time
import hashlib
import torch
from typing import List, Dict, Any
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# =========================
# CONFIG
# =========================
INPUT_FILE = "final_full.json"                 # kết quả sau check_two_stage.py
OUTPUT_FILE = "final_correct.json"             # chỉ title, context, question
OUTPUT_FULL_FILE = "final_correct_full.json"   # thêm NLI scores

NLI_MODEL_NAME = "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

NLI_THRESHOLD = 0.70
MAX_LENGTH = 512

# tạo folder nếu có dirname
out_dir_1 = os.path.dirname(OUTPUT_FILE)
out_dir_2 = os.path.dirname(OUTPUT_FULL_FILE)

if out_dir_1:
    os.makedirs(out_dir_1, exist_ok=True)
if out_dir_2:
    os.makedirs(out_dir_2, exist_ok=True)

# =========================
# LOAD MODEL
# =========================
print(f"Loading NLI model on {DEVICE} ...")
tokenizer = AutoTokenizer.from_pretrained(NLI_MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(NLI_MODEL_NAME)
model.to(DEVICE)
model.eval()

id2label = model.config.id2label
label2id = {str(v).lower(): int(k) for k, v in id2label.items()}


def find_label_id(possible_names: List[str]) -> int:
    for name in possible_names:
        if name.lower() in label2id:
            return label2id[name.lower()]
    raise ValueError(f"Không tìm thấy label trong model config. id2label = {id2label}")


ENTAILMENT_ID = find_label_id(["entailment", "entails"])
NEUTRAL_ID = find_label_id(["neutral"])
CONTRADICTION_ID = find_label_id(["contradiction", "contradictory"])


# =========================
# HELPERS
# =========================
def clean_text(text: str) -> str:
    text = str(text).strip()
    text = re.sub(r"\s+", " ", text)
    return text


def load_json(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    text = re.sub(r",\s*,+", ",", text)
    text = re.sub(r",\s*([\]}])", r"\1", text)

    data = json.loads(text)
    if not isinstance(data, list):
        raise ValueError(f"{path} must be a JSON list.")
    return data


def save_json(path: str, data: List[Dict[str, Any]]) -> None:
    if os.path.isdir(path):
        raise RuntimeError(f"OUTPUT path is a directory, expected a file: {path}")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_existing_output(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        return []
    try:
        data = load_json(path)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def make_record_id(title: str, context: str, question: str) -> str:
    raw = f"{clean_text(title)} ||| {clean_text(context)} ||| {clean_text(question)}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


def build_valid_items(data: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    items = []
    for idx, item in enumerate(data):
        title = clean_text(item.get("title", ""))
        context = clean_text(item.get("context", ""))
        question = clean_text(item.get("question", ""))

        if not title or not context or not question:
            print(f"[Skip] Item {idx} missing title/context/question")
            continue

        items.append({
            "title": title,
            "context": context,
            "question": question,
            "_id": make_record_id(title, context, question)
        })
    return items


@torch.no_grad()
def predict_nli_single(context: str, question: str) -> Dict[str, float]:
    encoded = tokenizer(
        context,
        question,
        padding=True,
        truncation=True,
        max_length=MAX_LENGTH,
        return_tensors="pt"
    )
    encoded = {k: v.to(DEVICE) for k, v in encoded.items()}

    outputs = model(**encoded)
    probs = torch.softmax(outputs.logits, dim=-1).cpu()[0]

    entailment_prob = float(probs[ENTAILMENT_ID])
    neutral_prob = float(probs[NEUTRAL_ID])
    contradiction_prob = float(probs[CONTRADICTION_ID])

    return {
        "entailment_prob": entailment_prob,
        "neutral_prob": neutral_prob,
        "contradiction_prob": contradiction_prob
    }


# =========================
# MAIN
# =========================
def process_file(input_path: str, output_path: str, output_full_path: str):
    data = load_json(input_path)
    items = build_valid_items(data)

    if not items:
        save_json(output_path, [])
        save_json(output_full_path, [])
        print("No valid items. Saved empty outputs.")
        return

    # đọc output cũ để resume
    existing_simple = load_existing_output(output_path)
    existing_full = load_existing_output(output_full_path)

    done_ids = set()
    cleaned_simple = []
    cleaned_full = []

    for item in existing_full:
        title = clean_text(item.get("title", ""))
        context = clean_text(item.get("context", ""))
        question = clean_text(item.get("question", ""))

        if title and context and question:
            rid = make_record_id(title, context, question)
            done_ids.add(rid)
            cleaned_full.append(item)

    for item in existing_simple:
        title = clean_text(item.get("title", ""))
        context = clean_text(item.get("context", ""))
        question = clean_text(item.get("question", ""))

        if title and context and question:
            cleaned_simple.append({
                "title": title,
                "context": context,
                "question": question
            })

    # đồng bộ file nếu trước đó có item rác
    if len(cleaned_simple) != len(existing_simple):
        save_json(output_path, cleaned_simple)
    if len(cleaned_full) != len(existing_full):
        save_json(output_full_path, cleaned_full)

    final_simple = cleaned_simple[:]
    final_full = cleaned_full[:]

    pending = [x for x in items if x["_id"] not in done_ids]

    total_items = len(items)
    already_done = len(done_ids)

    print(f"Total valid items : {total_items}")
    print(f"Already processed : {already_done}")
    print(f"Remaining         : {len(pending)}")
    print("\n[Step 3] NLI checking correctness/support: context => question ...")

    if not pending:
        print("Không còn item nào cần xử lý.")
        return

    passed_total = len(final_simple)
    processed_total = already_done

    for idx, qa in enumerate(pending, start=1):
        item_start = time.time()

        score = predict_nli_single(qa["context"], qa["question"])

        entailment_prob = score["entailment_prob"]
        neutral_prob = score["neutral_prob"]
        contradiction_prob = score["contradiction_prob"]

        verified_nli = entailment_prob >= NLI_THRESHOLD
        processed_total += 1

        if verified_nli:
            passed_total += 1

            final_simple.append({
                "title": qa["title"],
                "context": qa["context"],
                "question": qa["question"]
            })

            final_full.append({
                "title": qa["title"],
                "context": qa["context"],
                "question": qa["question"],
                "nli_entailment_prob": round(entailment_prob, 4),
                "nli_neutral_prob": round(neutral_prob, 4),
                "nli_contradiction_prob": round(contradiction_prob, 4),
                "verified_nli": True,
                "nli_checked": True
            })

            # lưu ngay sau khi pass
            save_json(output_path, final_simple)
            save_json(output_full_path, final_full)

        item_time = time.time() - item_start

        print(
            f"[{processed_total}/{total_items}] "
            f"time={item_time:.2f}s | "
            f"pass={passed_total} | "
            f"entail={entailment_prob:.4f} | "
            f"neutral={neutral_prob:.4f} | "
            f"contra={contradiction_prob:.4f} | "
            f"verified={verified_nli}"
        )

    print(
        f"\n✔ NLI finished | "
        f"{passed_total}/{total_items} verified "
        f"({passed_total / total_items:.1%})"
    )
    print(f"Saved simple file: {output_path}")
    print(f"Saved full file  : {output_full_path}")


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    if not os.path.isfile(INPUT_FILE):
        raise FileNotFoundError(f"Input file not found: {INPUT_FILE}")

    process_file(INPUT_FILE, OUTPUT_FILE, OUTPUT_FULL_FILE)