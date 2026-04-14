import os
import re
import traceback
import time
import unicodedata
import uuid
import shutil
from typing import Any, Dict, List, Tuple, Optional

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "36"
os.environ["TOKENIZERS_PARALLELISM"] = "true"

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

import faiss  

from model.retrieval import (
    smart_semantic_search_LLM,
    smart_semantic_search_BGE,
    load_all_faiss_LLM,
    load_all_faiss_BGE,
)
import model.retrieval as retrieval_mod

# Import thư viện generate index hiện có của bạn từ thư mục 'module'
try:
    from model import generate_faiss_index_LLM as gen_llm
    from model import generate_faiss_index_BGE as gen_bge
except ImportError:
    gen_llm = None
    gen_bge = None
    print("⚠️ Cảnh báo: Không thể import module generate_faiss_index_LLM/BGE từ thư mục 'module'. Tính năng tải file tạm/vĩnh viễn có thể không hoạt động.")

_WS_RE = re.compile(r"\s+")

def normalize_text(s: str) -> str:
    """Chuẩn hóa văn bản đầu vào sang dạng NFKC và loại bỏ khoảng trắng dư"""
    s = unicodedata.normalize("NFKC", s or "")
    s = s.strip()
    return _WS_RE.sub(" ", s)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, "FE", "dist")

# Khởi tạo đường dẫn thư mục tạm thời
TEMP_DOCS_DIR = os.path.join(BASE_DIR, "temp_data", "docs")
TEMP_FAISS_LLM_DIR = os.path.join(BASE_DIR, "temp_data", "faiss_LLM")
TEMP_FAISS_BGE_DIR = os.path.join(BASE_DIR, "temp_data", "faiss_BGE")

# Đường dẫn thư mục index vĩnh viễn
PERM_FAISS_LLM_DIR = os.path.join(BASE_DIR, "model", "faiss_cache_LLM")
PERM_FAISS_BGE_DIR = os.path.join(BASE_DIR, "model", "faiss_cache_BGE")

app = Flask(
    __name__,
    static_folder=FRONTEND_DIST,
    static_url_path="", 
)
CORS(app)

DATA_DIRS = [
    os.path.join(BASE_DIR, "data", "english"),
    os.path.join(BASE_DIR, "data", "vietnamese"),
]

def map_embedding_model(v: str, default: str = "bge-m3") -> str:
    s = (v or "").strip().lower()
    if "minilm" in s: return "minilm"
    if "bge" in s or "bge-m3" in s or "baai/bge-m3" in s: return "bge-m3"
    return default

def map_vector_index(v: str, default: str = "flatip_cpu_72t") -> str:
    s = (v or "").strip().lower()
    if "72" in s: return "flatip_cpu_72t"
    if "flatip" in s or "cpu" in s: return "flatip_cpu"
    return default

def map_retrieval_engine(v: str, default: str = "faiss_cpu_72t") -> str:
    s = (v or "").strip().lower()
    if "72" in s: return "faiss_cpu_72t"
    if "faiss" in s or "cpu" in s: return "faiss_cpu"
    return default

def map_reranker(v: str, default: str = "bge-reranker-v2-m3") -> str:
    s = (v or "").strip().lower()
    if "hybrid" in s: return "hybrid"
    if "reranker" in s or "cross" in s or "bge" in s: return "bge-reranker-v2-m3"
    return default

def map_ranking_method(v: str, default: str = "cross_encoder") -> str:
    s = (v or "").strip().lower()
    if "heuristic" in s: return "heuristic"
    if "cross" in s or "encoder" in s: return "cross_encoder"
    return default


def _serve_frontend(path: str = ""):
    if not os.path.isdir(FRONTEND_DIST):
        return jsonify({"error": "Frontend build not found"}), 500
    safe_path = (path or "").lstrip("/")
    candidate = os.path.join(FRONTEND_DIST, safe_path)
    if safe_path and os.path.isfile(candidate):
        return send_from_directory(FRONTEND_DIST, safe_path)
    return send_from_directory(FRONTEND_DIST, "index.html")

def _clamp_topk(k: int) -> int:
    try: k = int(k)
    except: return 5
    return max(1, min(k, 50))

def _safe_basename(name: str) -> str:
    base = os.path.basename(name or "").replace("\x00", "").strip()
    if not base or base in (".", ".."): return ""
    return base

def _resolve_download_file(filename: str) -> Tuple[Optional[str], Optional[str]]:
    base = _safe_basename(filename)
    if not base: return None, None
    for d in DATA_DIRS:
        p = os.path.join(d, base)
        if os.path.isfile(p): return d, base
    return None, None

_VI_DIACRITIC_RE = re.compile(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", re.IGNORECASE)

def _detect_language_auto(text: str) -> str:
    if _VI_DIACRITIC_RE.search(text or ""): return "vi"
    return "en"

def _set_faiss_threads_from_payload(vector_index: str, retrieval_engine: str) -> int:
    vi = (vector_index or "").strip().lower()
    re_ = (retrieval_engine or "").strip().lower()
    if vi.endswith("_72t") or re_.endswith("_72t"):
        n = int(os.getenv("FAISS_THREADS_72T", "72"))
        try: faiss.omp_set_num_threads(max(1, n))
        except: pass
        return max(1, n)
    return 0

# --- ROUTES ---

@app.route("/", methods=["GET"])
def homepage():
    return _serve_frontend("")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@app.route("/download", methods=["GET"])
def download():
    file_param = (request.args.get("file") or "").strip()
    dir_path, safe_name = _resolve_download_file(file_param)
    if not dir_path: return jsonify({"error": "File not found"}), 404
    return send_from_directory(dir_path, safe_name, as_attachment=True)

@app.route("/documents", methods=["GET"])
def documents_page():
    return _serve_frontend("")

@app.route("/api/documents", methods=["GET"])
def api_documents():
    lang = (request.args.get("lang") or "en").strip().lower()
    dir_path = DATA_DIRS[1] if lang.startswith("vi") else DATA_DIRS[0]
    if not os.path.isdir(dir_path): return jsonify({"lang": lang, "count": 0, "files": []})
    files = sorted([fn for fn in os.listdir(dir_path) if os.path.isfile(os.path.join(dir_path, fn))])
    return jsonify({"lang": lang, "count": len(files), "files": files})

@app.route("/view", methods=["GET"])
def view_file_inline():
    file_param = (request.args.get("file") or "").strip()
    dir_path, safe_name = _resolve_download_file(file_param)
    if not dir_path: return jsonify({"error": "File not found"}), 404
    return send_from_directory(dir_path, safe_name, as_attachment=False)

@app.route("/reload_index", methods=["POST"])
def reload_index():
    try:
        load_all_faiss_LLM(force_reload=True)
        load_all_faiss_BGE(force_reload=True)
        return jsonify({"status": "ok", "message": "FAISS reloaded (LLM + BGE)"}), 200
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


# =========================================================================
# TÍNH NĂNG TẠO INDEX VÀ CLEANUP TẠM THỜI CHO TÀI LIỆU IMPORT
# =========================================================================

@app.route("/api/temp/upload", methods=["POST"])
def temp_upload():
    """Nhận file PDF tải lên, lưu vào thư mục session và tạo FAISS index tạm thời"""
    if gen_llm is None or gen_bge is None:
        return jsonify({"error": "Các module tạo index không khả dụng"}), 500
        
    if 'files' not in request.files:
        return jsonify({"error": "Không có file nào được gửi lên"}), 400
        
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({"error": "Không có file hợp lệ"}), 400
        
    session_id = str(uuid.uuid4())
    
    doc_dir = os.path.join(TEMP_DOCS_DIR, session_id)
    faiss_llm_dir = os.path.join(TEMP_FAISS_LLM_DIR, session_id)
    faiss_bge_dir = os.path.join(TEMP_FAISS_BGE_DIR, session_id)
    
    os.makedirs(doc_dir, exist_ok=True)
    os.makedirs(faiss_llm_dir, exist_ok=True)
    os.makedirs(faiss_bge_dir, exist_ok=True)
    
    paths = []
    for f in files:
        filename = secure_filename(f.filename)
        filepath = os.path.join(doc_dir, filename)
        f.save(filepath)
        paths.append(filepath)
        
    try:
        # 1. Tạo Index LLM
        opts_llm = gen_llm.IndexOptions(data_dir=doc_dir, cache_dir=faiss_llm_dir)
        # Sử dụng model đã được load vào RAM bởi retrieval_mod để tránh load lại model tốn tài nguyên
        st_model_llm = retrieval_mod._get_embed_model_llm()
        existing_map_llm = gen_llm.build_existing_cache_map(faiss_llm_dir)
        
        for p in paths:
            gen_llm.generate_index_for_file(p, opts_llm, existing_map_llm, st_model_llm)
                
        # 2. Tạo Index BGE
        opts_bge = gen_bge.IndexOptions(data_dir=doc_dir, cache_dir=faiss_bge_dir)
        st_model_bge = retrieval_mod._get_embed_model_bge()
        existing_map_bge = gen_bge.build_existing_cache_map(faiss_bge_dir)
        
        for p in paths:
            gen_bge.generate_index_for_file(p, opts_bge, existing_map_bge, st_model_bge)
            
        return jsonify({
            "message": "Files processed successfully",
            "session_id": session_id,
            "num_files": len(paths)
        })
    except Exception as e:
        traceback.print_exc()
        # Dọn dẹp nếu có lỗi
        shutil.rmtree(doc_dir, ignore_errors=True)
        shutil.rmtree(faiss_llm_dir, ignore_errors=True)
        shutil.rmtree(faiss_bge_dir, ignore_errors=True)
        return jsonify({"error": str(e)}), 500


@app.route("/api/temp/cleanup", methods=["POST"])
def temp_cleanup():
    """Route để Frontend gọi khi rời khỏi trang, giúp xóa bộ nhớ đệm"""
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    if not session_id:
        return jsonify({"error": "Thiếu session_id"}), 400
        
    # An toàn, chỉ cho phép chữ, số và dấu gạch nối/gạch dưới (ngăn chặn directory traversal)
    session_id = secure_filename(session_id)
    
    for d in [TEMP_DOCS_DIR, TEMP_FAISS_LLM_DIR, TEMP_FAISS_BGE_DIR]:
        path = os.path.join(d, session_id)
        if os.path.exists(path):
            shutil.rmtree(path, ignore_errors=True)
            
    return jsonify({"message": "Đã dọn dẹp bộ nhớ đệm thành công"})

# =========================================================================
# THÊM TÍNH NĂNG UPLOAD VÀ TẠO INDEX VĨNH VIỄN
# =========================================================================

# @app.route("/api/permanent/upload", methods=["POST"])
# def permanent_upload():
#     """Nhận file upload (PDF, TXT, DOCX), lưu vĩnh viễn vào data/ và tạo FAISS index"""
#     if gen_llm is None or gen_bge is None:
#         return jsonify({"error": "Các module tạo index không khả dụng"}), 500
        
#     if 'files' not in request.files:
#         return jsonify({"error": "Không có file nào được gửi lên"}), 400
        
#     files = request.files.getlist('files')
#     if not files or files[0].filename == '':
#         return jsonify({"error": "Không có file hợp lệ"}), 400
        
#     # Frontend gửi param 'lang' (vd: 'vi' hoặc 'en'), mặc định là 'vi'
#     lang = request.form.get("lang", "vi").strip().lower()
#     if lang.startswith("vi"):
#         target_data_dir = DATA_DIRS[1]  # data/vietnamese
#     else:
#         target_data_dir = DATA_DIRS[0]  # data/english
        
#     os.makedirs(target_data_dir, exist_ok=True)
#     os.makedirs(PERM_FAISS_LLM_DIR, exist_ok=True)
#     os.makedirs(PERM_FAISS_BGE_DIR, exist_ok=True)
    
#     paths = []
#     for f in files:
#         filename = secure_filename(f.filename)
#         filepath = os.path.join(target_data_dir, filename)
#         f.save(filepath)
#         paths.append(filepath)
        
#     try:
#         # 1. Tạo Index LLM
#         opts_llm = gen_llm.IndexOptions(data_dir=target_data_dir, cache_dir=PERM_FAISS_LLM_DIR)
#         st_model_llm = retrieval_mod._get_embed_model_llm()
#         existing_map_llm = gen_llm.build_existing_cache_map(PERM_FAISS_LLM_DIR)
        
#         for p in paths:
#             gen_llm.generate_index_for_file(p, opts_llm, existing_map_llm, st_model_llm)
                
#         # 2. Tạo Index BGE
#         opts_bge = gen_bge.IndexOptions(data_dir=target_data_dir, cache_dir=PERM_FAISS_BGE_DIR)
#         st_model_bge = retrieval_mod._get_embed_model_bge()
#         existing_map_bge = gen_bge.build_existing_cache_map(PERM_FAISS_BGE_DIR)
        
#         for p in paths:
#             gen_bge.generate_index_for_file(p, opts_bge, existing_map_bge, st_model_bge)
            
#         # 3. Reload Index vào RAM để user có thể search ngay lập tức
#         load_all_faiss_LLM(force_reload=True)
#         load_all_faiss_BGE(force_reload=True)
            
#         return jsonify({
#             "message": "Upload và tạo Index thành công",
#             "num_files": len(paths),
#             "saved_dir": target_data_dir
#         })
#     except Exception as e:
#         traceback.print_exc()
#         # Lưu ý: Không tự động xóa file gốc (vì lỗi index vẫn có thể muốn giữ lại file)
#         return jsonify({"error": str(e)}), 500

@app.route("/api/permanent/upload", methods=["POST"])
def permanent_upload():
    """Nhận file upload (PDF, TXT, DOCX), lưu vĩnh viễn vào data/ và tạo FAISS index"""
    print("\n========== [permanent_upload] START ==========")
    try:
        print("[Flask] request.method:", request.method)
        print("[Flask] request.content_type:", request.content_type)
        print("[Flask] request.form keys:", list(request.form.keys()))
        print("[Flask] request.files keys:", list(request.files.keys()))

        if gen_llm is None or gen_bge is None:
            print("[Flask][ERROR] gen_llm or gen_bge is None")
            return jsonify({"error": "Các module tạo index không khả dụng"}), 500

        if 'files' not in request.files:
            print("[Flask][ERROR] 'files' not in request.files")
            return jsonify({"error": "Không có file nào được gửi lên"}), 400

        files = request.files.getlist('files')
        print("[Flask] number of files received:", len(files))

        if not files or files[0].filename == '':
            print("[Flask][ERROR] empty file list or empty filename")
            return jsonify({"error": "Không có file hợp lệ"}), 400

        for i, f in enumerate(files):
            print(f"[Flask] file[{i}] filename={f.filename}, content_type={f.content_type}")

        lang = request.form.get("lang", "vi").strip().lower()
        print("[Flask] lang from form:", lang)

        if lang.startswith("vi"):
            target_data_dir = DATA_DIRS[1]
        else:
            target_data_dir = DATA_DIRS[0]

        print("[Flask] target_data_dir:", target_data_dir)
        print("[Flask] PERM_FAISS_LLM_DIR:", PERM_FAISS_LLM_DIR)
        print("[Flask] PERM_FAISS_BGE_DIR:", PERM_FAISS_BGE_DIR)

        os.makedirs(target_data_dir, exist_ok=True)
        os.makedirs(PERM_FAISS_LLM_DIR, exist_ok=True)
        os.makedirs(PERM_FAISS_BGE_DIR, exist_ok=True)

        paths = []
        for f in files:
            filename = secure_filename(f.filename)
            filepath = os.path.join(target_data_dir, filename)
            print("[Flask] saving file:", filepath)
            f.save(filepath)
            print("[Flask] saved OK:", filepath, "exists=", os.path.exists(filepath))
            paths.append(filepath)

        print("[Flask] saved paths:", paths)

        # 1. Tạo Index LLM
        print("[Flask] Step 1: build LLM index options")
        opts_llm = gen_llm.IndexOptions(
            data_dir=target_data_dir,
            cache_dir=PERM_FAISS_LLM_DIR
        )
        print("[Flask] opts_llm created")

        print("[Flask] Step 2: load LLM embedding model")
        st_model_llm = retrieval_mod._get_embed_model_llm()
        print("[Flask] LLM embedding model loaded OK")

        print("[Flask] Step 3: build existing_map_llm")
        existing_map_llm = gen_llm.build_existing_cache_map(PERM_FAISS_LLM_DIR)
        print("[Flask] existing_map_llm size:", len(existing_map_llm) if existing_map_llm is not None else "None")

        for p in paths:
            print("[Flask] generate_index_for_file LLM:", p)
            gen_llm.generate_index_for_file(p, opts_llm, existing_map_llm, st_model_llm)
            print("[Flask] generate_index_for_file LLM OK:", p)

        # 2. Tạo Index BGE
        print("[Flask] Step 4: build BGE index options")
        opts_bge = gen_bge.IndexOptions(
            data_dir=target_data_dir,
            cache_dir=PERM_FAISS_BGE_DIR
        )
        print("[Flask] opts_bge created")

        print("[Flask] Step 5: load BGE embedding model")
        st_model_bge = retrieval_mod._get_embed_model_bge()
        print("[Flask] BGE embedding model loaded OK")

        print("[Flask] Step 6: build existing_map_bge")
        existing_map_bge = gen_bge.build_existing_cache_map(PERM_FAISS_BGE_DIR)
        print("[Flask] existing_map_bge size:", len(existing_map_bge) if existing_map_bge is not None else "None")

        for p in paths:
            print("[Flask] generate_index_for_file BGE:", p)
            gen_bge.generate_index_for_file(p, opts_bge, existing_map_bge, st_model_bge)
            print("[Flask] generate_index_for_file BGE OK:", p)

        # 3. Reload Index vào RAM
        print("[Flask] Step 7: reload FAISS indexes into RAM")
        load_all_faiss_LLM(force_reload=True)
        print("[Flask] load_all_faiss_LLM OK")
        load_all_faiss_BGE(force_reload=True)
        print("[Flask] load_all_faiss_BGE OK")

        print("[Flask] permanent_upload SUCCESS")
        print("========== [permanent_upload] END ==========\n")

        return jsonify({
            "message": "Upload và tạo Index thành công",
            "num_files": len(paths),
            "saved_dir": target_data_dir
        })

    except Exception as e:
        print("[Flask][ERROR] permanent_upload failed:", str(e))
        traceback.print_exc()
        print("========== [permanent_upload] END WITH ERROR ==========\n")
        return jsonify({
            "error": str(e),
            "trace": traceback.format_exc()
        }), 500


# =========================================================================

@app.route("/search", methods=["POST"])
def search():
    """
    XỬ LÝ TRUY VẤN NGỮ NGHĨA XUYÊN NGỮ
    """
    data = request.get_json(silent=True) or {}
    
    raw_text = (data.get("text") or "").strip()
    if not raw_text:
        return jsonify({"query_used": "", "results": []})

    lang_val = str(data.get("language") or "").strip().lower()
    if lang_val in ("en", "english"): language_choice = "en"
    elif lang_val in ("vi", "vietnamese", "tiếng việt"): language_choice = "vi"
    elif any(x in lang_val for x in ("cross", "xlingual", "x-lang", "xuyên ngữ")): language_choice = "cross"
    else: language_choice = "auto"

    chunk_embedding_model = map_embedding_model(data.get("chunk_embedding_model"))
    query_embedding_model = map_embedding_model(data.get("query_embedding_model"))
    vector_index = map_vector_index(data.get("vector_index"))
    retrieval_engine = map_retrieval_engine(data.get("retrieval_engine"))
    reranker = map_reranker(data.get("reranker"))
    ranking_method = map_ranking_method(data.get("ranking_method"))
    top_k = _clamp_topk(data.get("top_k", 5))
    
    # Lấy session_id nếu người dùng đang dùng tìm kiếm tạm thời
    session_id = data.get("session_id")
    if session_id:
        session_id = secure_filename(session_id)

    wants_llm = (ranking_method == "heuristic") or (reranker == "hybrid")
    faiss_threads = _set_faiss_threads_from_payload(vector_index, retrieval_engine)

    try:
        query_used = normalize_text(raw_text)
        detected_language = _detect_language_auto(query_used)

        lang_filter = None
        if language_choice in ("en", "vi"):
            lang_filter = language_choice
        elif language_choice == "cross":
            lang_filter = "en" if detected_language == "vi" else "vi"

        if wants_llm:
            q_norm = retrieval_mod.norm_text_llm(query_used)
        else:
            q_norm = retrieval_mod.norm_text_bge(query_used)
        
        keywords = list(dict.fromkeys(retrieval_mod.TOK_RE.findall(q_norm.lower())))

        t0 = time.perf_counter()

        # Truyền thêm biến session_id xuống lớp truy hồi
        if wants_llm:
            refined_query, results = smart_semantic_search_LLM(
                query=query_used,
                top_k=top_k,
                lang_filter=lang_filter,
                collection_filter=None,
                session_id=session_id
            )
            backend_label = "MiniLM-Multilingual (CPU/Heuristic)"
        else:
            refined_query, results = smart_semantic_search_BGE(
                query=query_used,
                top_k=top_k,
                lang_filter=lang_filter,
                collection_filter=None,
                session_id=session_id
            )
            backend_label = "BGE-M3 (GPU/Cross-Encoder)"

        latency = (time.perf_counter() - t0) * 1000.0

        payload_results = []
        for (raw_chunk, source_file, title, formatted, score) in results:
            payload_results.append({
                "title": title,
                "text": formatted,
                "raw_text": raw_chunk,
                "file": source_file,
                "score": float(score),
            })

        return jsonify({
            "query_used": refined_query,
            "detected_language": detected_language,
            "language_setting": language_choice,
            "method": "Zero-shot Cross-lingual Semantic Search",
            "backend_used": backend_label,
            "embedding_model": query_embedding_model,
            "reranker": reranker,
            "top_k": top_k,
            "faiss_threads": faiss_threads,
            "results": payload_results,
            "search_latency_ms": round(latency, 3),
            "keywords": keywords,
            "info": "Mô hình tự động ánh xạ ngôn ngữ trong không gian vector đa ngữ, không cần dịch máy."
        })

    except Exception as e:
        print(f"[ERROR] Search failed: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e), "results": []}), 500

@app.route("/<path:path>", methods=["GET"])
def spa_catch_all(path: str):
    return _serve_frontend(path)

if __name__ == "__main__":
    print("🚀 Khởi tạo hệ thống Tìm kiếm ngữ nghĩa xuyên ngữ...")
    try:
        load_all_faiss_LLM()
        load_all_faiss_BGE()
        print("✅ Toàn bộ chỉ mục FAISS đã sẵn sàng.")
    except Exception as e:
        print(f"⚠️ Cảnh báo khi nạp chỉ mục: {e}")

    port = int(os.getenv("PORT", "5000"))
    debug_mode = os.getenv("DEBUG", "0").strip().lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)