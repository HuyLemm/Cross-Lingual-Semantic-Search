import os
import time
import requests
from typing import List, Dict

from utils import (
    normalize_title,
    debug_print_chunks,
    load_existing_output,
    save_output,
    load_processed_titles,
    extract_text_from_pdf,
    chunk_text,
    parse_json,   
    select_even_chunks
)


# =========================
# 🔑 OPENROUTER API KEY
# =========================
OPENROUTER_API_KEY = "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"
# 1. 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 mail truong
# 2. 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 github
# 3. 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 mail thieuhuy1711
# 4. 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
# 5. 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
# 6. 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
# 7. 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
  #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

# =========================
# CONFIG
# =========================
LANG = "vi"

PDF_FOLDER = "../articles_vi"
OUTPUT_FILE = "../deepseekData/input_vi_deepseek.json"

MODEL_ID = "tngtech/deepseek-r1t2-chimera:free"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

BATCH_SIZE = 200
SLEEP_BETWEEN = 5
MAX_CHUNKS = 8

# =========================
# PROMPT
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
   - answer: ngắn gọn, đúng trọng tâm, không suy diễn
4. Không trùng ý
5. Không tạo QA nếu thông tin không có trong tài liệu

ĐỊNH DẠNG ĐẦU RA:
- Chỉ trả về 1 JSON array
- Mỗi phần tử là object có đúng 4 key:
  "title", "context", "question", "answer"

NỘI DUNG TÀI LIỆU:
{content}
""".strip()


# =========================
# OPENROUTER CALL
# =========================
def generate_qa_for_pdf(pdf_path: str) -> List[Dict]:
    text = extract_text_from_pdf(pdf_path, page_label="Trang")

    if not text.strip():
        print("   ⚠️ Không có text layer, bỏ qua")
        return []

    chunks = chunk_text(text)

     # ✅ EVEN CHUNK SELECTION
    used_indexes, used_chunks = select_even_chunks(chunks, MAX_CHUNKS)

    # 🔍 DEBUG
    debug_print_chunks(chunks, used_indexes)

    content = "\n\n---\n\n".join(used_chunks)

    title = os.path.basename(pdf_path).replace(".pdf", "").strip()

    prompt = build_prompt(title, content)

    payload = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "Bạn là hệ thống tạo QA học thuật"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 4096
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "semantic-qa-generator"
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
    all_qa = existing_qa

    for idx, filename in enumerate(batch, 1):
        pdf_path = os.path.join(PDF_FOLDER, filename)
        print(f"🔄 ({idx}/{len(batch)}) {filename}")

        try:
            qa = generate_qa_for_pdf(pdf_path)
            all_qa.extend(qa)
            save_output(OUTPUT_FILE, all_qa)
            print(f"   ✅ {len(qa)} QA → đã lưu")
        except Exception as e:
            print(f"   ❌ Error: {e}")

        time.sleep(SLEEP_BETWEEN)

    print(f"\n🎉 DONE — tổng QA hiện có: {len(all_qa)}")


if __name__ == "__main__":
    main()
