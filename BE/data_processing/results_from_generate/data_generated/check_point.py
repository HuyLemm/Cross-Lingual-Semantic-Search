import json
import os
import re
from typing import List, Dict, Any

from sentence_transformers import SentenceTransformer, CrossEncoder, util

# =========================
# CONFIG
# =========================
INPUT_FILE = "./gpt_data/exp1/input_vi_gpt.json"

BI_ENCODER_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
CROSS_ENCODER_MODEL = "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1"

BI_THRESHOLD = 0.7
CE_THRESHOLD = 0.7


# =========================
# CLEANING
# =========================
def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.strip()

    # bỏ contentReference kiểu :contentReference[oaicite:1]{index=1}
    text = re.sub(r":contentReference\[[^\]]*\]\{[^}]*\}", "", text)

    # chuẩn hóa khoảng trắng
    text = re.sub(r"\s+", " ", text).strip()
    return text


# =========================
# LOAD JSON
# =========================
def load_json(path: str) -> List[Dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# =========================
# MAIN EVAL
# =========================
def evaluate_qa_file(data: List[Dict[str, Any]]) -> None:
    print(f"Loading bi-encoder: {BI_ENCODER_MODEL}")
    bi_model = SentenceTransformer(BI_ENCODER_MODEL)

    print(f"Loading cross-encoder: {CROSS_ENCODER_MODEL}")
    ce_model = CrossEncoder(CROSS_ENCODER_MODEL)

    total = 0

    # Q-C bằng bi-encoder
    qc_bi_pass = 0

    # A-C bằng bi-encoder + cross-encoder
    ac_bi_pass = 0
    ac_ce_pass = 0
    ac_both_pass = 0

    # Final:
    # q-c bi pass AND a-c bi pass AND a-c ce pass
    final_pass = 0

    results = []

    for idx, item in enumerate(data, start=1):
        title = clean_text(item.get("title", ""))
        context = clean_text(item.get("context", ""))
        question = clean_text(item.get("question", ""))
        answer = clean_text(item.get("answer", ""))

        if not question:
            print(f"[WARN] QA #{idx} thiếu question, skip")
            continue
        if not answer:
            print(f"[WARN] QA #{idx} thiếu answer, skip")
            continue
        if not context:
            print(f"[WARN] QA #{idx} thiếu context, skip")
            continue

        total += 1

        # =========================
        # BI-ENCODER
        # =========================
        q_emb = bi_model.encode(question, convert_to_tensor=True)
        a_emb = bi_model.encode(answer, convert_to_tensor=True)
        c_emb = bi_model.encode(context, convert_to_tensor=True)

        bi_qc_score = float(util.cos_sim(q_emb, c_emb).item())
        bi_ac_score = float(util.cos_sim(a_emb, c_emb).item())

        # =========================
        # CROSS-ENCODER
        # only Answer - Context
        # =========================
        ce_ac_score = float(ce_model.predict([(answer, context)])[0])

        # =========================
        # PASS / FAIL
        # =========================
        qc_bi_ok = bi_qc_score >= BI_THRESHOLD

        ac_bi_ok = bi_ac_score >= BI_THRESHOLD
        ac_ce_ok = ce_ac_score >= CE_THRESHOLD
        ac_both_ok = ac_bi_ok and ac_ce_ok

        final_ok = qc_bi_ok and ac_bi_ok and ac_ce_ok

        if qc_bi_ok:
            qc_bi_pass += 1

        if ac_bi_ok:
            ac_bi_pass += 1
        if ac_ce_ok:
            ac_ce_pass += 1
        if ac_both_ok:
            ac_both_pass += 1

        if final_ok:
            final_pass += 1

        results.append({
            "idx": idx,
            "title": title,

            "bi_qc_score": bi_qc_score,
            "qc_bi_pass": qc_bi_ok,

            "bi_ac_score": bi_ac_score,
            "ce_ac_score": ce_ac_score,
            "ac_bi_pass": ac_bi_ok,
            "ac_ce_pass": ac_ce_ok,
            "ac_both_pass": ac_both_ok,

            "final_pass": final_ok,

            "question": question,
            "answer": answer,
            "context": context,
        })

    # =========================
    # PRINT DETAIL
    # =========================
    print("\n" + "=" * 100)
    print("DETAIL RESULTS")
    print("=" * 100)

    for r in results:
        print(f"\nQA #{r['idx']}")
        print(f"Title      : {r['title']}")

        print("\n[Question - Context | Bi-encoder only]")
        print(f"Bi-score   : {r['bi_qc_score']:.4f}   {'PASS' if r['qc_bi_pass'] else 'FAIL'}")

        print("\n[Answer - Context]")
        print(f"Bi-score   : {r['bi_ac_score']:.4f}   {'PASS' if r['ac_bi_pass'] else 'FAIL'}")
        print(f"CE-score   : {r['ce_ac_score']:.4f}   {'PASS' if r['ac_ce_pass'] else 'FAIL'}")
        print(f"Both       : {'PASS' if r['ac_both_pass'] else 'FAIL'}")

        print(f"\nFinal pass : {'PASS' if r['final_pass'] else 'FAIL'}")

        print(f"\nQuestion   : {r['question']}")
        print(f"Answer     : {r['answer']}")
        print(f"Context    : {r['context']}")

    # =========================
    # SUMMARY
    # =========================
    print("\n" + "=" * 100)
    print("SUMMARY")
    print("=" * 100)
    print(f"Total valid QA                  : {total}")

    print("\n--- Question - Context (Bi only) ---")
    print(f"Bi-encoder >= {BI_THRESHOLD}    : {qc_bi_pass}")

    print("\n--- Answer - Context ---")
    print(f"Bi-encoder >= {BI_THRESHOLD}    : {ac_bi_pass}")
    print(f"Cross-encoder >= {CE_THRESHOLD} : {ac_ce_pass}")
    print(f"Pass BOTH (A-C)                 : {ac_both_pass}")

    print("\n--- Final ---")
    print(f"Pass final check                : {final_pass}")

    if total > 0:
        print(f"\nQ-C Bi pass rate                : {qc_bi_pass / total:.2%}")

        print(f"\nA-C Bi pass rate                : {ac_bi_pass / total:.2%}")
        print(f"A-C CE pass rate                : {ac_ce_pass / total:.2%}")
        print(f"A-C BOTH pass rate              : {ac_both_pass / total:.2%}")

        print(f"\nFinal pass rate                 : {final_pass / total:.2%}")


if __name__ == "__main__":
    if not os.path.exists(INPUT_FILE):
        raise FileNotFoundError(f"Không tìm thấy file: {INPUT_FILE}")

    data = load_json(INPUT_FILE)
    evaluate_qa_file(data)