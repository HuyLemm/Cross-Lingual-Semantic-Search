import os
import time
import json
from typing import List, Dict

from google import genai

from utils import (
    normalize_title,
    load_existing_output,
    save_output,
    extract_text_from_pdf,
    chunk_text,
    parse_json,
    select_even_chunks,
)

# =========================
# 🔑 GEMINI API KEY
# =========================
GEMINI_API_KEY = "AIzaSyBTmF966jt-jKQZt2Keb8mG4CNQjBO9C1o"

#AIzaSyCmUffu8Bj_Xhkohf-Khkza4xPJVN9s7Ko thieuhuy1711
#AIzaSyDMhZBPghHF5HPDGFrzhYiIEOUPaRdO9zc lthuy21.work unvailable
#AIzaSyABk1ETrvuBO2UuhXBb6HKACEGlacXz7NI lthuy171103
#AIzaSyB7kXXWuqgi9ExxQ0zO-qzFB5ANCShwhy8 lkaygg0 unavailable
#AIzaSyDq80nRwn-V2br5AZM9qqF22yfJR2WLeyg lkayss0
#AIzaSyAxvFq6qa_wVWmnckh_mzXdQyzeowN5wVM lthuy21@clc.fitus
#AIzaSyCXQsLJPjC6vcz-Tt7QqZo_7M5KgCX_Sec lamthieukhang
#AIzaSyAKbyCAsXdQvy6x47y93NtJmS_VwCXcsRA nguyennkhanh 
#AIzaSyC-KgA4BQQfWtPPUwkRcbk6sM_guNYCFvg phuthanh
#AIzaSyDcYuT1o3PfzHMa359x1GjU2T3anhdJLxo 
#AIzaSyAIiVYHwYWk1sVxrklFBicEDDTbKG_AihI

#AIzaSyBTmF966jt-jKQZt2Keb8mG4CNQjBO9C1o huyanh
#AIzaSyCvX4jxy4VajXnYPbUlAlaeSs46pBeW6wk 
#AIzaSyAxUMbbyYE9lPKR9CuVwNVgZbpgNCw5u2s

# =========================
# CONFIG
# =========================
LANG = "vi"

PDF_FOLDER = "../backend/data/articles_vi"

# FINAL PASSED QA (STEP 2)
FINAL_QA_FILE = "../final/gemini25flash_vi.json"

# OUTPUT ROUND 2 (AUGMENTED)
OUTPUT_FILE = "../genData/geminiData/exp2/input2_vi_gemini.json"

MODEL_ID = "gemini-2.5-flash"

SLEEP_BETWEEN = 5
MAX_CHUNKS = 8
MIN_QA_PER_PDF = 7


# =========================
# LOAD FINAL QA BY TITLE
# =========================
def load_final_qas_by_title(path: str):
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
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
# PROMPT (VI – BE + CE OPTIMIZED)
# =========================
def build_prompt(title: str, content: str, target_qas: int, existing_qas):
    existing_block = ""
    for qa in existing_qas:
        existing_block += f"- {qa['question']}\n"

    return f"""
Bạn đang tạo các cặp Câu hỏi – Trả lời (Question–Answer)
chất lượng cao cho một hệ thống đánh giá
Retrieval-Augmented Generation (RAG).

CHỈ sử dụng thông tin được nêu RÕ RÀNG trong tài liệu bên dưới.
KHÔNG được suy luận, bổ sung kiến thức bên ngoài hoặc giả định.

MỤC TIÊU:
Tạo CHÍNH XÁC 7 cặp Question–Answer MỚI sao cho:
(1) Ngữ nghĩa nhất quán ở cấp độ đoạn văn
(2) Có thể được xác minh trực tiếp bằng mô hình textual entailment

RÀNG BUỘC BẮT BUỘC:
- Giá trị của trường "title" PHẢI chính xác là:
  "{title}"
- KHÔNG được tạo, rút gọn hay diễn giải lại tiêu đề

QUY TẮC NỘI DUNG:
1. Mỗi QA chỉ tập trung vào MỘT ý, phát hiện hoặc kết luận rõ ràng
2. Trường "context" PHẢI có đúng 3–4 câu hoàn chỉnh
3. TẤT CẢ các câu trong context phải nói về CÙNG MỘT chủ đề
4. Câu trả lời PHẢI được hỗ trợ trực tiếp và rõ ràng bởi context
5. KHÔNG được trùng lặp hoặc chồng chéo với các câu hỏi đã có

CÁC CÂU HỎI ĐÃ TỒN TẠI (KHÔNG ĐƯỢC LẶP LẠI):
{existing_block}

YÊU CẦU ĐỊNH DẠNG:
- Chỉ trả về MỘT JSON array
- Mỗi phần tử là object có ĐÚNG 4 khóa:
  "title", "context", "question", "answer"
- KHÔNG thêm bất kỳ văn bản nào ngoài JSON

NỘI DUNG TÀI LIỆU:
{content}
""".strip()


# =========================
# GEMINI CALL
# =========================
def generate_qa_for_pdf(
    client,
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

    resp = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt
    )

    data = parse_json(resp.text.strip())

    return [
        qa for qa in data
        if set(qa.keys()) == {"title", "context", "question", "answer"}
    ]


# =========================
# MAIN (AUGMENT TO MIN_QA)
# =========================
def main():
    final_qas_by_title = load_final_qas_by_title(FINAL_QA_FILE)
    augmented_titles = load_augmented_titles(OUTPUT_FILE)

    output_qas = load_existing_output(OUTPUT_FILE)

    augment_jobs = []

    for f in os.listdir(PDF_FOLDER):
        if not f.lower().endswith(".pdf"):
            continue

        title_key = normalize_title(f.replace(".pdf", ""), lang=LANG)
        existing_final_qas = final_qas_by_title.get(title_key, [])
        existing_count = len(existing_final_qas)

        if existing_count >= MIN_QA_PER_PDF:
            continue

        if title_key in augmented_titles:
            continue

        need_qas = MIN_QA_PER_PDF - existing_count
        augment_jobs.append((f, need_qas))

    total = len(augment_jobs)

    if total == 0:
        print("✅ Không có PDF nào cần sinh QA.")
        return

    print(f"📊 TỔNG PDF CẦN XỬ LÝ: {total}")
    print(f"⏱ Thời gian ước tính: ~{total * SLEEP_BETWEEN:.1f}s\n")

    client = genai.Client(api_key=GEMINI_API_KEY)
    start_time = time.time()

    for idx, (filename, need_qas) in enumerate(augment_jobs, start=1):
        pdf_path = os.path.join(PDF_FOLDER, filename)
        title_key = normalize_title(filename.replace(".pdf", ""), lang=LANG)

        elapsed = time.time() - start_time
        avg = elapsed / idx
        eta = avg * (total - idx)

        print(
            f"🔁 XỬ LÝ ({idx}/{total}) | "
            f"Cần QA: {need_qas} | "
            f"Còn lại: {total - idx} | "
            f"ETA: {eta:.1f}s\n"
            f"    → {filename}"
        )

        try:
            existing_final_qas = final_qas_by_title.get(title_key, [])

            new_qas = generate_qa_for_pdf(
                client,
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
