import os
import json
import math
import re
import torch
from sentence_transformers import SentenceTransformer, CrossEncoder, util

# =========================
# CONFIG
# =========================
INPUT_FILE = "output_vi.json"
OUTPUT_FILE = "final_vi.json"
OUTPUT_FULL_FILE = "final_full_vi.json"

BI_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CE_MODEL_NAME = "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

BI_THRESHOLD = 0.70
CE_THRESHOLD = 0.70

BI_BATCH_SIZE = 64
CE_BATCH_SIZE = 32

# guard tạo folder nếu có dirname
output_dir_1 = os.path.dirname(OUTPUT_FILE)
output_dir_2 = os.path.dirname(OUTPUT_FULL_FILE)

if output_dir_1:
    os.makedirs(output_dir_1, exist_ok=True)

if output_dir_2:
    os.makedirs(output_dir_2, exist_ok=True)

# =========================
# LOAD MODELS
# =========================
print(f"Loading Bi-Encoder on {DEVICE} ...")
bi_model = SentenceTransformer(BI_MODEL_NAME, device=DEVICE)

print(f"Loading Cross-Encoder on {DEVICE} ...")
ce_model = CrossEncoder(CE_MODEL_NAME, device=DEVICE)


# =========================
# HELPERS
# =========================
def clean_text(text: str) -> str:
    text = str(text).strip()
    text = re.sub(r"\s+", " ", text)
    return text


def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    text = re.sub(r",\s*,+", ",", text)
    text = re.sub(r",\s*([\]}])", r"\1", text)

    data = json.loads(text)
    if not isinstance(data, list):
        raise ValueError(f"{path} must be a JSON list.")
    return data


def save_json(path: str, data):
    if os.path.isdir(path):
        raise RuntimeError(f"OUTPUT path is a directory, expected a file: {path}")

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def build_valid_items(data):
    items = []
    for idx, qa in enumerate(data):
        title = clean_text(qa.get("title", ""))
        context = clean_text(qa.get("context", ""))
        question = clean_text(qa.get("question", ""))

        if not title or not context or not question:
            print(f"[Skip] Item {idx} missing title/context/question")
            continue

        items.append({
            "title": title,
            "context": context,
            "question": question
        })
    return items


def bi_scores_for_pairs(items):
    questions = [x["question"] for x in items]
    contexts = [x["context"] for x in items]

    q_emb = bi_model.encode(
        questions,
        batch_size=BI_BATCH_SIZE,
        convert_to_tensor=True,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    c_emb = bi_model.encode(
        contexts,
        batch_size=BI_BATCH_SIZE,
        convert_to_tensor=True,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    scores_tensor = util.pairwise_cos_sim(q_emb, c_emb)
    return scores_tensor.cpu().tolist()


def ce_scores_for_pairs(items):
    pairs = [(x["question"], x["context"]) for x in items]

    raw_scores = ce_model.predict(
        pairs,
        batch_size=CE_BATCH_SIZE,
        show_progress_bar=True
    )

    logits = []
    probs = []

    for s in raw_scores:
        logit = float(s)
        prob = sigmoid(logit)
        logits.append(logit)
        probs.append(prob)

    return logits, probs


# =========================
# MAIN PROCESS
# =========================
def process_file(input_path: str, output_path: str, output_full_path: str):
    data = load_json(input_path)
    items = build_valid_items(data)

    if not items:
        save_json(output_path, [])
        save_json(output_full_path, [])
        print("No valid items. Saved empty outputs.")
        return

    print(f"Total valid items: {len(items)}")

    # -------------------------
    # STEP 1: BI-ENCODER
    # -------------------------
    print("\n[Step 1] Bi-Encoder checking question vs context ...")
    bi_scores = bi_scores_for_pairs(items)

    stage1 = []
    bi_verified_cnt = 0

    for qa, bi_score in zip(items, bi_scores):
        bi_score = float(bi_score)

        qa_full = {
            "title": qa["title"],
            "context": qa["context"],
            "question": qa["question"],
            "bi_score": round(bi_score, 3),
            "verified_bi": bi_score >= BI_THRESHOLD,
            "bi_checked": True
        }

        if qa_full["verified_bi"]:
            bi_verified_cnt += 1
            stage1.append(qa_full)

    print(
        f"✔ BI finished | "
        f"{bi_verified_cnt}/{len(items)} verified "
        f"({bi_verified_cnt/len(items):.1%})"
    )

    if not stage1:
        save_json(output_path, [])
        save_json(output_full_path, [])
        print("No item passed BI threshold. Saved empty outputs.")
        return

    # -------------------------
    # STEP 2: CROSS-ENCODER
    # -------------------------
    print("\n[Step 2] Cross-Encoder checking question vs context ...")
    ce_logits, ce_probs = ce_scores_for_pairs(stage1)

    final_simple = []
    final_full = []

    ce_verified_cnt = 0

    for qa, logit, prob in zip(stage1, ce_logits, ce_probs):
        qa["ce_logit"] = round(logit, 3)
        qa["ce_prob"] = round(prob, 3)
        qa["verified_ce"] = prob >= CE_THRESHOLD
        qa["ce_checked"] = True

        qa["verified_final"] = qa["verified_bi"] and qa["verified_ce"]

        if qa["verified_final"]:
            ce_verified_cnt += 1

            final_simple.append({
                "title": qa["title"],
                "context": qa["context"],
                "question": qa["question"]
            })

            final_full.append({
                "title": qa["title"],
                "context": qa["context"],
                "question": qa["question"],
                "bi_score": qa["bi_score"],
                "ce_logit": qa["ce_logit"],
                "ce_prob": qa["ce_prob"],
                "verified_bi": qa["verified_bi"],
                "verified_ce": qa["verified_ce"],
                "verified_final": qa["verified_final"],
                "bi_checked": qa["bi_checked"],
                "ce_checked": qa["ce_checked"]
            })

    save_json(output_path, final_simple)
    save_json(output_full_path, final_full)

    print(
        f"✔ CE finished | "
        f"{ce_verified_cnt}/{len(stage1)} verified after CE "
        f"({ce_verified_cnt/len(stage1):.1%})"
    )

    print(
        f"\n✔ FINAL kept | "
        f"{len(final_simple)}/{len(items)} total "
        f"({len(final_simple)/len(items):.1%})"
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