import os
import json
import pandas as pd

# =========================
# CONFIG
# =========================
INPUT_DIR = "../../step2b_ce_en"
OUTPUT_DIR = "../tables"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FILES = [
    ("DeepSeek", "EN", "deepseekr1t2_en.json"),
    ("DeepSeek", "VI", "deepseekr1t2_vi.json"),
    ("Gemini", "EN", "gemini25flash_en.json"),
    ("Gemini", "VI", "gemini25flash_vi.json"),
    ("GPT", "EN", "gpt52_en.json"),
    ("GPT", "VI", "gpt52_vi.json"),
]


def load_stats(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    total = len(data)

    paraphrase_ok = sum(1 for qa in data if qa.get("verified") is True)
    ce_ok = sum(1 for qa in data if qa.get("verified_step2") is True)
    both_ok = sum(
        1 for qa in data
        if qa.get("verified") is True and qa.get("verified_step2") is True
    )
    either_ok = sum(
        1 for qa in data
        if qa.get("verified") is True or qa.get("verified_step2") is True
    )

    return {
        "Total QA": total,
        "Paraphrase Pass (%)": round(paraphrase_ok / total * 100, 1),
        "Cross-Encoder Pass (%)": round(ce_ok / total * 100, 1),
        "Either-Pass (%)": round(either_ok / total * 100, 1),
        "Both-Pass (%)": round(both_ok / total * 100, 1),
    }


def main():
    rows = []
    overall = {
        "Total QA": 0,
        "Paraphrase OK": 0,
        "CE OK": 0,
        "Either OK": 0,
        "Both OK": 0,
    }

    for model, lang, fname in FILES:
        path = os.path.join(INPUT_DIR, fname)
        stats = load_stats(path)

        rows.append({
            "Model": model,
            "Language": lang,
            **stats
        })

        # accumulate overall
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        overall["Total QA"] += len(data)
        overall["Paraphrase OK"] += sum(1 for qa in data if qa.get("verified"))
        overall["CE OK"] += sum(1 for qa in data if qa.get("verified_step2"))
        overall["Either OK"] += sum(
            1 for qa in data
            if qa.get("verified") or qa.get("verified_step2")
        )
        overall["Both OK"] += sum(
            1 for qa in data
            if qa.get("verified") and qa.get("verified_step2")
        )

    # ===== TABLE 1: Model × Language =====
    df_models = pd.DataFrame(rows)
    df_models.to_csv(
        os.path.join(OUTPUT_DIR, "table_model_language.csv"),
        index=False
    )
    df_models.to_excel(
        os.path.join(OUTPUT_DIR, "table_model_language.xlsx"),
        index=False
    )

    # ===== TABLE 2: Overall =====
    total = overall["Total QA"]
    df_overall = pd.DataFrame([
        ["Total QA", total, 100.0],
        ["Paraphrase Verified", overall["Paraphrase OK"], round(overall["Paraphrase OK"]/total*100, 1)],
        ["Cross-Encoder Verified", overall["CE OK"], round(overall["CE OK"]/total*100, 1)],
        ["Both Steps Passed", overall["Both OK"], round(overall["Both OK"]/total*100, 1)],
        ["Either Step Passed", overall["Either OK"], round(overall["Either OK"]/total*100, 1)],
    ], columns=["Metric", "QA Count", "Percentage (%)"])

    df_overall.to_csv(
        os.path.join(OUTPUT_DIR, "table_overall_dataset.csv"),
        index=False
    )
    df_overall.to_excel(
        os.path.join(OUTPUT_DIR, "table_overall_dataset.xlsx"),
        index=False
    )

    # ===== OPTIONAL: LaTeX =====
    with open(os.path.join(OUTPUT_DIR, "table_model_language.tex"), "w") as f:
        f.write(df_models.to_latex(index=False))

    with open(os.path.join(OUTPUT_DIR, "table_overall_dataset.tex"), "w") as f:
        f.write(df_overall.to_latex(index=False))

    print("✅ Tables exported to:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
