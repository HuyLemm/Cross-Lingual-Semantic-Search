import os
import time
import requests
import json
from typing import List, Dict

from utils import (
    normalize_title,
    load_existing_output,
    save_output,
    extract_text_from_pdf,
    chunk_text,
    parse_json,
    select_even_chunks
)

# =========================
# 🔑 OPENROUTER API KEY
# =========================
OPENROUTER_API_KEY = "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"
#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
#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
#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
#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

#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

# =========================
# CONFIG (VIETNAMESE)
# =========================
LANG = "vi"

PDF_FOLDER = "../backend/data/articles_vi"
FINAL_QA_FILE = "../final/deepseekr1t2_vi.json"
OUTPUT_FILE = "../genData/deepseekData/exp17/input17_vi_deepseek.json"

MODEL_ID = "tngtech/deepseek-r1t2-chimera:free"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

SLEEP_BETWEEN = 5
MAX_CHUNKS = 8
MIN_QA_PER_PDF = 7

# =========================
# LOAD FINAL QA BY TITLE
# =========================
def load_final_qas_by_title(path: str):
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        print(f"⚠ FINAL QA file empty or missing: {path}")
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print(f"⚠ FINAL QA file is not valid JSON: {path}")
        return {}

    by_title = {}
    for qa in data:
        if "title" not in qa:
            continue
        t = normalize_title(qa["title"], lang=LANG)
        by_title.setdefault(t, []).append(qa)

    return by_title


def load_augmented_titles(path: str):
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return set()

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return set()

    return {
        normalize_title(qa["title"], lang=LANG)
        for qa in data
        if "title" in qa
    }

# =========================
# PROMPT (VI – AUGMENT)
# =========================
def build_prompt(title: str, content: str, target_qas: int, existing_qas):
    existing_block = ""
    for qa in existing_qas:
        existing_block += f"- {qa['question']}\n"

    return f"""
Bạn đang tạo các cặp Câu hỏi – Trả lời (QA) chất lượng cao
cho hệ thống Retrieval-Augmented Generation (RAG),
phục vụ đánh giá truy hồi và kiểm chứng ngữ nghĩa.

CHỈ sử dụng thông tin được trình bày RÕ RÀNG trong tài liệu bên dưới.
KHÔNG thêm kiến thức bên ngoài hoặc suy diễn không có căn cứ.

MỤC TIÊU:
Tạo CHÍNH XÁC 7 CẶP QA MỚI thỏa mãn:
(1) gắn kết ngữ nghĩa ở cấp đoạn văn, và
(2) có thể được xác minh trực tiếp bằng mô hình entailment.

RÀNG BUỘC BẮT BUỘC:
- Trường "title" PHẢI đúng CHÍNH XÁC:
  "{title}"
- KHÔNG được rút gọn, diễn giải, hay thay đổi tiêu đề.

QUY TẮC NỘI DUNG:
1. Mỗi QA chỉ tập trung vào MỘT chủ đề, phát hiện, hoặc kết luận rõ ràng.
2. Context PHẢI gồm CHÍNH XÁC 3–4 câu đầy đủ.
3. TẤT CẢ các câu trong context phải mô tả CÙNG MỘT chủ đề.
4. Câu trả lời PHẢI được hỗ trợ trực tiếp từ context.
5. Câu trả lời NÊN tái sử dụng thuật ngữ quan trọng trong context
   và phải là một câu hoàn chỉnh.
6. Tránh suy diễn trừu tượng hoặc tổng hợp nhiều ý.
7. KHÔNG lặp lại hoặc trùng nội dung với các câu hỏi đã có bên dưới.

CÁC CÂU HỎI ĐÃ CÓ (KHÔNG LẶP LẠI):
{existing_block}

YÊU CẦU ĐỊNH DẠNG:
- CHỈ trả về MỘT mảng JSON
- Mỗi phần tử PHẢI có ĐÚNG 4 trường:
  "title", "context", "question", "answer"
- KHÔNG thêm bất kỳ văn bản nào ngoài JSON.

NỘI DUNG TÀI LIỆU:
{content}
""".strip()


# =========================
# OPENROUTER CALL
# =========================
def generate_qa_for_pdf(
    pdf_path: str,
    existing_qas: List[Dict],
    target_qas: int
) -> List[Dict]:

    if target_qas <= 0:
        return []

    text = extract_text_from_pdf(pdf_path, page_label="Trang")
    if not text.strip():
        return []

    chunks = chunk_text(text)
    _, used_chunks = select_even_chunks(chunks, MAX_CHUNKS)
    content = "\n\n---\n\n".join(used_chunks)

    title = os.path.basename(pdf_path).replace(".pdf", "").strip()
    prompt = build_prompt(title, content, target_qas, existing_qas)

    payload = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "You generate academic QA datasets in Vietnamese."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 4096
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    resp = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=120
    )
    resp.raise_for_status()

    raw = resp.json()["choices"][0]["message"]["content"].strip()
    data = parse_json(raw)

    return [
        qa for qa in data
        if set(qa.keys()) == {"title", "context", "question", "answer"}
    ]

# =========================
# MAIN (AUGMENT TO 7 QA – VI)
# =========================
def main():
    final_qas_by_title = load_final_qas_by_title(FINAL_QA_FILE)
    augmented_titles = load_augmented_titles(OUTPUT_FILE)
    output_qas = load_existing_output(OUTPUT_FILE)

    augment_jobs = []  # (filename, need_qas)

    for f in os.listdir(PDF_FOLDER):
        if not f.lower().endswith(".pdf"):
            continue

        title_key = normalize_title(f.replace(".pdf", ""), lang=LANG)
        existing_final_qas = final_qas_by_title.get(title_key, [])
        existing_count = len(existing_final_qas)

        # ❌ đã đủ QA
        if existing_count >= MIN_QA_PER_PDF:
            continue

        # ❌ đã augment rồi
        if title_key in augmented_titles:
            continue

        need_qas = MIN_QA_PER_PDF - existing_count
        augment_jobs.append((f, need_qas))

    total = len(augment_jobs)

    if total == 0:
        print("✅ Không còn PDF nào cần sinh QA.")
        return

    print(f"📊 TỔNG PDF CẦN XỬ LÝ: {total}")
    print(f"⏱ Thời gian ước tính: ~{total * SLEEP_BETWEEN:.1f}s\n")

    start_time = time.time()

    for idx, (filename, need_qas) in enumerate(augment_jobs, start=1):
        pdf_path = os.path.join(PDF_FOLDER, filename)
        title_key = normalize_title(filename.replace(".pdf", ""), lang=LANG)

        elapsed = time.time() - start_time
        avg_time = elapsed / idx
        remaining = total - idx
        eta = avg_time * remaining

        print(
            f"🔁 PROCESS ({idx}/{total}) | "
            f"Cần thêm QA: {need_qas} | "
            f"Còn lại: {remaining} | ETA: {eta:.1f}s\n"
            f"    → {filename}"
        )

        try:
            existing_final_qas = final_qas_by_title.get(title_key, [])
            new_qas = generate_qa_for_pdf(
                pdf_path,
                existing_final_qas,
                need_qas
            )

            if new_qas:
                output_qas.extend(new_qas)
                save_output(OUTPUT_FILE, output_qas)
                print(f"    ➕ Thêm {len(new_qas)} QA\n")
            else:
                print(f"    ⏭ Không sinh được QA\n")

        except Exception as e:
            print(f"    ❌ Lỗi: {e}\n")

        time.sleep(SLEEP_BETWEEN)

    print(f"🎉 HOÀN TẤT — tổng QA mới sinh: {len(output_qas)}")


if __name__ == "__main__":
    main()