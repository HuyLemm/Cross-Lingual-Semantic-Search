import os
import json
from sentence_transformers import SentenceTransformer, util

# =========================
# CONFIG
# =========================
# INPUT_FILE = "../../stepResults/step1/exp9/gemini25flash_vi.json"
# OUTPUT_FILE = "../../stepResults/step2/exp9/gemini25flash_vi.json"

# INPUT_FILE = "../../stepResults/step1/exp17/deepseekr1t2_vi.json"
# OUTPUT_FILE = "../../stepResults/step2/exp17/deepseekr1t2_vi.json"

INPUT_FILE = "../../stepResults/step1/exp1/gpt52_en.json"
OUTPUT_FILE = "../../stepResults/step2/exp1/gpt52_en.json"

# tạo folder step2/exp2 nếu chưa có
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
SIM_THRESHOLD = 0.7   # ngưỡng semantic hợp lý

# =========================
# LOAD MODEL
# =========================
model = SentenceTransformer(MODEL_NAME)


def process_file(input_path, output_path):
    with open(input_path, "r", encoding="utf-8") as f:
        qa_list = json.load(f)

    questions = [qa["question"] for qa in qa_list]
    contexts = [qa["context"] for qa in qa_list]
    answers = [qa["answer"] for qa in qa_list]

    emb_q = model.encode(
        questions, convert_to_tensor=True, show_progress_bar=True
    )
    emb_c = model.encode(
        contexts, convert_to_tensor=True, show_progress_bar=True
    )
    emb_a = model.encode(
        answers, convert_to_tensor=True, show_progress_bar=True
    )

    verified_count = 0

    for i, qa in enumerate(qa_list):
        sim_qc = float(util.cos_sim(emb_q[i], emb_c[i]))
        sim_ac = float(util.cos_sim(emb_a[i], emb_c[i]))

        qa["sim_qc"] = round(sim_qc, 3)
        qa["sim_ac"] = round(sim_ac, 3)
        qa["verified"] = (
            sim_qc >= SIM_THRESHOLD and sim_ac >= SIM_THRESHOLD
        )

        if qa["verified"]:
            verified_count += 1

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(qa_list, f, ensure_ascii=False, indent=2)

    print(
        f"✔ Finished {os.path.basename(output_path)} | "
        f"Verified: {verified_count}/{len(qa_list)} "
        f"({verified_count / len(qa_list):.1%})"
    )


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":
    if not os.path.isfile(INPUT_FILE):
        raise FileNotFoundError(f"Input file not found: {INPUT_FILE}")

    process_file(INPUT_FILE, OUTPUT_FILE)
