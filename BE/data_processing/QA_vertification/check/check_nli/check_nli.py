#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import time
from pathlib import Path
from typing import Any, Dict, List

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL_NAME = "MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"

# PATH
INPUT_PATH = Path("./before/gpt_vi.json")
OUTPUT_PATH = Path("./after/gpt_vi.json")


def choose_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_json_file(path: Path) -> List[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Input JSON phải là list QA")

    return data


# ✅ chỉ dùng answer
def build_hypothesis(answer: str) -> str:
    return (answer or "").strip()


def get_label_mapping(model) -> Dict[int, str]:
    mapping = {}
    for idx, label in model.config.id2label.items():
        mapping[int(idx)] = str(label).lower()
    return mapping


def predict_nli(premise, hypothesis, tokenizer, model, device):
    inputs = tokenizer(
        premise,
        hypothesis,
        truncation=True,
        max_length=512,
        return_tensors="pt",
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits[0]
        probs = torch.softmax(logits, dim=-1).cpu().tolist()

    id2label = get_label_mapping(model)

    result = {"entailment": 0.0, "neutral": 0.0, "contradiction": 0.0}

    for idx, prob in enumerate(probs):
        label = id2label.get(idx, "")
        if "entail" in label:
            result["entailment"] = prob
        elif "neutral" in label:
            result["neutral"] = prob
        elif "contrad" in label:
            result["contradiction"] = prob

    return result


def classify_verdict(scores):
    entail = scores.get("entailment", 0.0)

    if entail >= 0.7:
        return "PASS"
    elif entail >= 0.4:
        return "REVIEW"
    else:
        return "FAIL"


def save_json_array(path: Path, data: List[Dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"Không thấy file: {INPUT_PATH}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    device = choose_device()
    print(f"[INFO] Device: {device}")

    print("[INFO] Loading model...")
    t0 = time.perf_counter()

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

    model.to(device)
    model.eval()

    print(f"[INFO] Model loaded in {time.perf_counter() - t0:.2f}s")

    data = load_json_file(INPUT_PATH)
    total = len(data)
    print(f"[INFO] Total: {total}")

    results: List[Dict[str, Any]] = []
    total_start = time.perf_counter()

    for i, item in enumerate(data):
        t_item = time.perf_counter()

        context = item.get("context", "")
        answer = item.get("answer", "")

        hypothesis = build_hypothesis(answer)

        scores = predict_nli(
            premise=context,
            hypothesis=hypothesis,
            tokenizer=tokenizer,
            model=model,
            device=device,
        )

        verdict = classify_verdict(scores)

        result = dict(item)
        result["nli_model"] = MODEL_NAME
        result["nli_premise"] = context
        result["nli_hypothesis"] = hypothesis
        result["nli_scores"] = {
            "entailment": round(scores["entailment"], 6),
            "neutral": round(scores["neutral"], 6),
            "contradiction": round(scores["contradiction"], 6),
        }
        result["nli_predicted_label"] = max(
            ["entailment", "neutral", "contradiction"],
            key=lambda x: scores.get(x, 0.0),
        )
        result["nli_verdict"] = verdict
        result["is_pass"] = scores["entailment"] >= 0.7
        result["processed_index"] = i

        item_time = time.perf_counter() - t_item
        result["processing_time_sec"] = round(item_time, 4)

        results.append(result)

        # 🔥 lưu mỗi bước
        save_json_array(OUTPUT_PATH, results)

        avg = (time.perf_counter() - total_start) / (i + 1)

        print(
            f"[{i+1}/{total}] "
            f"entail={scores['entailment']:.3f} "
            f"neutral={scores['neutral']:.3f} "
            f"contr={scores['contradiction']:.3f} "
            f"verdict={verdict} "
            f"time={item_time:.2f}s "
            f"avg={avg:.2f}s"
        )

    total_time = time.perf_counter() - total_start

    print("\n[DONE]")
    print(f"Output: {OUTPUT_PATH}")
    print(f"Total time: {total_time:.2f}s")
    if total > 0:
        print(f"Avg per item: {total_time / total:.2f}s")


if __name__ == "__main__":
    main()