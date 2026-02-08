import os
import json
import math
import torch
from sentence_transformers import SentenceTransformer, CrossEncoder, util

# =========================
# CONFIG
# =========================
INPUT_FILE = "temp.json"
# nếu bạn muốn check file đã qua step2 thì đổi sang:
# INPUT_FILE = "../../step2/exp13/deepseekr1t2_en.json"

BI_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CE_MODEL_NAME = "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1"

BI_THRESHOLD = 0.7
CE_THRESHOLD = 0.7

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# =========================
# LOAD MODELS
# =========================
print("🔄 Loading models...")
bi_model = SentenceTransformer(BI_MODEL_NAME)
ce_model = CrossEncoder(CE_MODEL_NAME, device=DEVICE)


def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))


# =========================
# MAIN
# =========================
def main():
    if not os.path.isfile(INPUT_FILE):
        raise FileNotFoundError(INPUT_FILE)

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        qa_list = json.load(f)

    print(f"📄 Loaded {len(qa_list)} QA pairs\n")

    questions = [qa["question"] for qa in qa_list]
    contexts = [qa["context"] for qa in qa_list]
    answers = [qa["answer"] for qa in qa_list]

    # ---------- BI-ENCODER ----------
    emb_q = bi_model.encode(questions, convert_to_tensor=True, show_progress_bar=True)
    emb_c = bi_model.encode(contexts, convert_to_tensor=True, show_progress_bar=True)
    emb_a = bi_model.encode(answers, convert_to_tensor=True, show_progress_bar=True)

    passed = []

    for i, qa in enumerate(qa_list):
        sim_qc = float(util.cos_sim(emb_q[i], emb_c[i]))
        sim_ac = float(util.cos_sim(emb_a[i], emb_c[i]))

        if sim_qc < BI_THRESHOLD or sim_ac < BI_THRESHOLD:
            continue

        # ---------- CROSS ENCODER ----------
        logit = float(ce_model.predict([(contexts[i], answers[i])])[0])
        prob = sigmoid(logit)

        if prob < CE_THRESHOLD:
            continue

        passed.append({
            "index": i,
            "sim_qc": round(sim_qc, 3),
            "sim_ac": round(sim_ac, 3),
            "ce_prob": round(prob, 3),
            "qa": qa
        })

    # =========================
    # PRINT RESULT
    # =========================
    print("\n================ PASSED QA =================\n")
    print(f"✅ Passed: {len(passed)} / {len(qa_list)}\n")

    for item in passed:
        qa = item["qa"]
        print(f"--- QA #{item['index']} ---")
        print(f"sim_qc : {item['sim_qc']}")
        print(f"sim_ac : {item['sim_ac']}")
        print(f"ce_prob: {item['ce_prob']}")
        print("QUESTION:")
        print(qa["question"])
        print("\nANSWER:")
        print(qa["answer"])
        print("\nCONTEXT:")
        print(qa["context"])
        print("\n" + "=" * 50 + "\n")


if __name__ == "__main__":
    main()
