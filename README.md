# Multilingual Semantic Search Evaluation (KLTN/NEW)

Hệ thống phục vụ nghiên cứu và đánh giá **semantic search đa ngôn ngữ (EN/VI)**, bao gồm:
- quản lý dữ liệu PDF nguồn,
- upload/xóa dữ liệu động,
- kiểm định QA,
- đánh giá retrieval theo nhiều cấu hình (MiniLM vs BGE),
- phân tích indexing/chunking/vector database.

---

## 1. Cấu trúc thư mục

```txt
NEW/
├─ BE/                # Backend API (Node.js/Express) - cổng 4000
│  ├─ backend/
│  └─ data_processing/
├─ coreLogic/         # Core retrieval/indexing/search (Python/Flask + FAISS) - cổng 5000
└─ FE/                # Frontend dashboard (React + Vite + Tailwind)
```

---

## 2. Vai trò từng phần

## Backend (`BE/backend`) làm gì?

Backend Node.js là lớp **API orchestration** cho dashboard:
- Cung cấp API cho frontend: dataset stats/list, QA summary/evaluation, option1/option2 evaluation, model comparison, query-test, additional indexing/chunking data.
- Quản lý tài liệu PDF nguồn: xem metadata, stream/download, upload PDF mới, xóa PDF.
- Khi upload PDF (`/qa/upload`), backend sẽ:
  1. trích xuất text + nhận diện ngôn ngữ,
  2. lưu file vào `articles_en` / `articles_vi` / `articles_unknown`,
  3. forward file sang `coreLogic` để tạo/cập nhật indexing (`/api/permanent/upload`),
  4. trả trạng thái về FE (`forwardedTo5000`, `forwardError`, ...).

Tóm lại: **BE là lớp điều phối API và quản trị dữ liệu**.

## Core Logic (`coreLogic`) làm gì?

Core Logic Python/Flask là nơi chứa **logic tìm kiếm ngữ nghĩa cốt lõi**:
- Quản lý và nạp index FAISS cho 2 nhánh retrieval:
  - MiniLM pipeline,
  - BGE pipeline.
- Xử lý search runtime:
  - nhận query + cấu hình retrieval/rerank,
  - chạy semantic search,
  - trả về chunk, score, latency.
- Xử lý upload vào index vĩnh viễn:
  - nhận PDF do BE forward sang,
  - tạo/cập nhật FAISS index,
  - reload index vào RAM để search ngay.
- Chứa các module model, finetune, checkpoint, script thực nghiệm.

Tóm lại: **coreLogic là tầng thuật toán retrieval và indexing**.

## Frontend (`FE`) làm gì?

Frontend React là **dashboard nghiên cứu**:
- Điều hướng theo tab (SPA) cho toàn bộ pipeline.
- Các module chính:
  - Experiment Playground,
  - Query Test Results,
  - Dataset Management,
  - QA Validation,
  - QA Evaluation,
  - MiniLM Search Results,
  - BGE Search Results,
  - Comparative Analysis,
  - Indexing & Chunking,
  - Vector Database.
- Hỗ trợ thao tác dữ liệu động trong Dataset Management:
  - Add PDF (upload),
  - Remove PDF,
  - theo dõi trạng thái indexing sau upload.

Tóm lại: **FE là lớp tương tác, trực quan hóa và phân tích kết quả**.

---

## 3. Luồng hệ thống tổng quát

1. Người dùng thao tác trên FE.
2. FE gọi BE (`localhost:4000`) để lấy dữ liệu dashboard, upload/xóa PDF, đọc metadata.
3. Khi cần search runtime, FE gọi coreLogic (`localhost:5000/search`).
4. Khi upload PDF mới, BE forward sang coreLogic (`/api/permanent/upload`) để cập nhật index.
5. FE refresh lại stats/list và hiển thị trạng thái indexing.

---

## 4. Công nghệ chính

- **FE**: React + TypeScript + Vite + Tailwind CSS + Recharts + Radix UI.
- **BE**: Node.js + Express + Multer + pdf-parse + cors.
- **Core Logic**: Python + Flask + FAISS + sentence-transformers + transformers + torch.

---

## 5. Chạy dự án local

## Yêu cầu

- Node.js 18+
- Python 3.10+ (khuyến nghị dùng virtualenv/conda)

## Bước 1: chạy coreLogic (cổng 5000)

```bash
cd coreLogic
pip install -r requirements.txt
python app.py
```

## Bước 2: chạy backend BE (cổng 4000)

```bash
cd BE/backend
npm install
npm run dev
```

## Bước 3: chạy frontend FE

```bash
cd FE
npm install
npm run dev
```

Mở URL FE do Vite cung cấp (thường là `http://localhost:5173`).

---

## 6. API trọng yếu

- `POST http://localhost:5000/search`  
  Search semantic runtime.
- `POST http://localhost:4000/qa/upload`  
  Upload PDF từ dashboard.
- `DELETE http://localhost:4000/qa/remove`  
  Xóa PDF khỏi dataset.
- `GET http://localhost:4000/dataset/stats`  
  Thống kê dataset.
- `GET http://localhost:4000/dataset/list?language=...`  
  Danh sách PDF theo ngôn ngữ.
- `GET http://localhost:4000/qa/doc-meta`  
  Metadata + stream/download PDF.

---

## 7. Ghi chú triển khai

- Một số URL `localhost` đang hard-code; khi deploy nên chuyển sang biến môi trường.
- Không commit các thư mục nặng: `node_modules/`, `venv/`, cache/checkpoints không cần thiết.
- Nên chạy theo thứ tự: `coreLogic -> BE -> FE`.

---

## 8. Mục tiêu học thuật

Dự án hướng đến đánh giá toàn diện semantic search đa ngôn ngữ qua:
- chất lượng truy hồi (Top-k, Recall, MRR, ...),
- độ trễ và hiệu năng hệ thống,
- ảnh hưởng của chiến lược indexing/chunking,
- so sánh cấu hình retrieval baseline và nâng cao trên dữ liệu học thuật thực tế.
