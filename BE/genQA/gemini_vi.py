import os
import time
from typing import List, Dict

from google import genai

from utils import (
    normalize_title,
    debug_print_chunks,
    load_existing_output,
    save_output,
    load_processed_titles,
    extract_text_from_pdf,
    chunk_text,
    parse_json,
    select_even_chunks,
)


# =========================
# 🔑 GEMINI API KEY
# =========================
GEMINI_API_KEY = "AIzaSyDMhZBPghHF5HPDGFrzhYiIEOUPaRdO9zc"
#AIzaSyDyiJDvW7e0mHkYAEJ3WiFDHk3a88tI0T0 thieuhuy1711
#AIzaSyDMhZBPghHF5HPDGFrzhYiIEOUPaRdO9zc lthuy21.work SUSPEND
#AIzaSyABk1ETrvuBO2UuhXBb6HKACEGlacXz7NI lthuy171103
#AIzaSyB7kXXWuqgi9ExxQ0zO-qzFB5ANCShwhy8 lkaygg0
#AIzaSyCly-eZpXxvPXGejPosel6h9GJbKOQr7WY lkayss0
#AIzaSyAxvFq6qa_wVWmnckh_mzXdQyzeowN5wVM lthuy21@clc.fitus
#AIzaSyBQi9zUIXZ1E6YxDmYw0tFQNyBF_qY-oe8 lamthieukhang
#AIzaSyDcYuT1o3PfzHMa359x1GjU2T3anhdJLxo nguyennkhanh
#AIzaSyBpstaPmtiuIOGxoma6y9Izjw8nSz201Kc phuthanh


# =========================
# CONFIG
# =========================
LANG = "vi"

PDF_FOLDER = "../articles_vi"
OUTPUT_FILE = "../geminiData/exp1/input_vi_gemini.json"

MODEL_ID = "gemini-2.5-flash"

BATCH_SIZE = 200
SLEEP_BETWEEN = 5
MAX_CHUNKS = 8


# =========================
# PROMPT (VI)
# =========================
def build_prompt(title: str, content: str) -> str:
    return f"""
Bạn là hệ thống tạo dữ liệu Question–Answer phục vụ semantic search và RAG.

CHỈ sử dụng nội dung tài liệu bên dưới. KHÔNG bổ sung kiến thức ngoài tài liệu.

YÊU CẦU BẮT BUỘC:
1. Ngôn ngữ: tiếng Việt 100%, văn phong học thuật, khách quan, chính xác
2. Sinh từ 5 đến 8 QA (KHÔNG ÍT HƠN 5)
3. Mỗi QA gồm đúng 4 trường:
   - title: "{title}"
   - context: 3–4 câu, học thuật, KHÔNG gạch đầu dòng
   - question: câu hỏi chứa đầy đủ từ khóa quan trọng
   - answer: trả lời ngắn gọn, đúng trọng tâm
4. Các QA bao phủ các khía cạnh khác nhau, không trùng ý

ĐỊNH DẠNG:
- Chỉ trả về 1 JSON array
- Mỗi phần tử có đúng 4 key:
  "title", "context", "question", "answer"

NỘI DUNG TÀI LIỆU:
{content}
""".strip()


# =========================
# GEMINI CALL
# =========================
def generate_qa_for_pdf(client, pdf_path: str) -> List[Dict]:
    text = extract_text_from_pdf(pdf_path, page_label="Trang")

    if not text.strip():
        print("⚠️ Không có text layer, bỏ qua")
        return []

    chunks = chunk_text(text)
    used_indexes, used_chunks = select_even_chunks(chunks, MAX_CHUNKS)

    # 🔍 DEBUG
    debug_print_chunks(chunks, used_indexes)

    content = "\n\n---\n\n".join(used_chunks)
    title = os.path.basename(pdf_path).replace(".pdf", "").strip()

    prompt = build_prompt(title, content)

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
# MAIN
# =========================
def main():
    existing_qa = load_existing_output(OUTPUT_FILE)
    processed_titles = load_processed_titles(existing_qa, lang=LANG)

    pdf_files = sorted(
        f for f in os.listdir(PDF_FOLDER)
        if f.lower().endswith(".pdf")
        and normalize_title(f.replace(".pdf", ""), lang=LANG) not in processed_titles
    )

    batch = pdf_files[:BATCH_SIZE]

    if not batch:
        print("✅ Không còn PDF mới để xử lý")
        return

    print(f"🚀 Batch size: {len(batch)} PDF")

    client = genai.Client(api_key=GEMINI_API_KEY)
    all_qa = existing_qa

    for idx, filename in enumerate(batch, 1):
        pdf_path = os.path.join(PDF_FOLDER, filename)
        print(f"🔄 ({idx}/{len(batch)}) {filename}")

        try:
            qa = generate_qa_for_pdf(client, pdf_path)
            all_qa.extend(qa)
            save_output(OUTPUT_FILE, all_qa)
            print(f"   ✅ {len(qa)} QA → đã lưu")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        time.sleep(SLEEP_BETWEEN)

    print(f"\n🎉 DONE — tổng QA hiện có: {len(all_qa)}")


if __name__ == "__main__":
    main()
