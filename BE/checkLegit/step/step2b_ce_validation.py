import os
import json
import torch
import math
from sentence_transformers import CrossEncoder

# =========================
# CONFIG
# =========================
# INPUT_FILE = "../../stepResults/step2/exp17/deepseekr1t2_vi.json"
# OUTPUT_FILE = "../../stepResults/step2b_ce/exp17/deepseekr1t2_vi.json"

# INPUT_FILE = "../../stepResults/step2/exp9/gemini25flash_vi.json"
# OUTPUT_FILE = "../../stepResults/step2b_ce/exp9/gemini25flash_vi.json"

INPUT_FILE = "../../stepResults/step2/exp1/gpt52_en.json"
OUTPUT_FILE = "../../stepResults/step2b_ce/exp1/gpt52_en.json"

os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

MODEL_NAME = "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MULTI_THRESHOLD = 0.70

# =========================
# LOAD MODEL
# =========================
ce_model = CrossEncoder(MODEL_NAME, device=DEVICE)


def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def ce_score(context: str, answer: str):
    logit = float(ce_model.predict([(context, answer)])[0])
    prob = sigmoid(logit)
    return logit, prob


def process_file(input_path: str, output_path: str):
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    verified_cnt = 0

    for qa in data:
        context = qa.get("context", "")
        answer = qa.get("answer", "")

        logit, prob = ce_score(context, answer)

        qa["ce_multi_logit"] = round(logit, 3)
        qa["ce_multi_prob"] = round(prob, 3)
        qa["verified_step2"] = prob >= MULTI_THRESHOLD
        qa["ce_multi_checked"] = True

        if qa["verified_step2"]:
            verified_cnt += 1

    # guard chống folder .json
    if os.path.isdir(output_path):
        raise RuntimeError(
            f"❌ OUTPUT_FILE is a directory, expected a file: {output_path}"
        )

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(
        f"✔ MULTI CE finished | "
        f"{verified_cnt}/{len(data)} verified "
        f"({verified_cnt/len(data):.1%})"
    )


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    if not os.path.isfile(INPUT_FILE):
        raise FileNotFoundError(f"Input file not found: {INPUT_FILE}")

    process_file(INPUT_FILE, OUTPUT_FILE)
