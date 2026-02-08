import os
import json
import hashlib
from collections import Counter

# =========================
# CONFIG
# =========================
BASE_EXP_DIR = "dataModel/exp"


# =========================
# HASH nội dung QA
# =========================
def content_hash(qa):
    key = f"{qa.get('source_pdf','').lower()}||{qa.get('question','').lower()}"
    return hashlib.md5(key.encode()).hexdigest()


# =========================
# MODEL NORMALIZER
# =========================
def normalize_model(m):
    if not m:
        return "unknown"
    m = m.lower()
    if "deepseek" in m:
        return "deepseek"
    if "gemini" in m:
        return "gemini"
    if "gpt" in m:
        return "gpt"
    return m


# =========================
# QUALITY CHECK
# =========================
def pass_quality(qa, threshold):
    if threshold is None:
        return True

    if not qa.get("verified") or not qa.get("verified_step2"):
        return False

    sim = qa.get("sim_qc", 0)
    ce = qa.get("ce_multi_prob", 0)

    return sim >= threshold and ce >= threshold


# =========================
# USER INPUT
# =========================
def get_user_input():
    exp = input("Choose experiment (exp1 / exp5 / all) [all]: ").strip() or "all"
    model = input("Choose model (gpt / gemini / deepseek / all) [all]: ").strip() or "all"
    lang = input("Choose language (en / vi / all) [all]: ").strip() or "all"
    quality = input("Choose quality (0.7 / 0.75 / 0.8 / 0.85 / 0.9 / all) [all]: ").strip() or "all"

    if quality != "all":
        try:
            quality = float(quality)
        except:
            print("⚠️ Invalid quality, fallback to ALL")
            quality = None
    else:
        quality = None

    return exp, model, lang, quality


# =========================
# AUDIT
# =========================
def audit(exp_filter, model_filter, lang_filter, quality_threshold):
    if not os.path.exists(BASE_EXP_DIR):
        print("❌ EXP folder not found:", BASE_EXP_DIR)
        return

    exp_dirs = sorted(os.listdir(BASE_EXP_DIR))

    if exp_filter != "all":
        exp_dirs = [e for e in exp_dirs if e == exp_filter]

    total = 0
    id_set = set()
    hash_set = set()

    model_counter = Counter()
    lang_counter = Counter()
    doc_counter = Counter()

    print("\n============================")
    print(" AUDIT RESULT")
    print("============================")
    print(f"Experiment filter : {exp_filter}")
    print(f"Model filter      : {model_filter}")
    print(f"Language filter   : {lang_filter}")
    print(f"Quality filter    : {quality_threshold if quality_threshold else 'ALL'}")
    print("============================\n")

    for exp in exp_dirs:
        exp_path = os.path.join(BASE_EXP_DIR, exp)
        if not os.path.isdir(exp_path):
            continue

        for file in os.listdir(exp_path):
            if not file.endswith(".json"):
                continue

            file_path = os.path.join(exp_path, file)

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception as e:
                print("❌ Error reading:", file, e)
                continue

            for qa in data:
                # FILTER MODEL
                m = normalize_model(qa.get("model"))
                if model_filter != "all" and m != model_filter:
                    continue

                # FILTER LANGUAGE
                l = qa.get("language", "unknown")
                if lang_filter != "all" and l != lang_filter:
                    continue

                # FILTER QUALITY
                if not pass_quality(qa, quality_threshold):
                    continue

                total += 1

                qa_id = qa.get("qa_id")
                if qa_id:
                    id_set.add(qa_id)

                h = content_hash(qa)
                hash_set.add(h)

                model_counter[m] += 1
                lang_counter[l] += 1
                doc_counter[qa.get("source_pdf", "unknown")] += 1

    # =========================
    # PRINT RESULT
    # =========================
    print(f"Total QA loaded        : {total}")
    print(f"Unique qa_id           : {len(id_set)}")
    print(f"Unique content         : {len(hash_set)}")
    print(f"Duplicate qa_id        : {total - len(id_set)}")
    print(f"Duplicate content      : {total - len(hash_set)}")

    if doc_counter:
        avg_per_doc = sum(doc_counter.values()) / len(doc_counter)
        print(f"Avg QA per document    : {avg_per_doc:.2f}")

    print("\nModel distribution     :", dict(model_counter))
    print("Language distribution  :", dict(lang_counter))
    print("\nDone.\n")


# =========================
# RUN
# =========================
if __name__ == "__main__":
    exp, model, lang, quality = get_user_input()
    audit(exp, model, lang, quality)
