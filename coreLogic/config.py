import os
import re
import time
import random
import requests

# ================== CONFIG ==================
OUT_DIR = "worldbank_pdfs"
os.makedirs(OUT_DIR, exist_ok=True)

SEMANTIC_SCHOLAR_SEARCH = "https://api.semanticscholar.org/graph/v1/paper/search"

API_KEY = "fkjIl0SGJ47TzVgjhXwIUajBP4QO3C5w6TvdgGX2"

# 1 request / second → để an toàn dùng 1.2s
REQUEST_SLEEP = 1.2

TARGET_TOTAL = 1000     # đổi thành 3000 nếu muốn
PAGE_SIZE = 20          # nhỏ để tránh lỗi

QUERIES = [
    "digital transformation",
    "digital government",
    "e-government",
    "digital public services",
    "information technology policy",
    "data governance",
    "open data policy",
    "artificial intelligence policy",
    "AI governance",
    "technology regulation",
    "digital economy policy",
    "ICT development",
    "digital infrastructure",
    "cybersecurity policy",
    "data privacy regulation",
    "digital innovation policy",
    "govtech",
    "smart government",
    "telemedicine",
    "digital health",
    "health system",
    "healthcare delivery",
    "primary healthcare",
    "public health policy",
    "health workforce",
    "health service delivery",
    "health financing",
    "universal health coverage",
    "health system strengthening",
    "health governance",
    "community health services",
    "energy policy",
    "renewable energy policy",
    "clean energy transition",
    "energy transition",
    "nuclear energy",
    "energy security",
    "power sector reform",
    "electricity market reform",
    "energy efficiency policy",
    "sustainable energy",
    "climate adaptation",
    "climate mitigation",
    "climate resilience",
    "climate change policy",
    "environmental governance",
    "carbon emissions policy",
    "low carbon development",
    "green growth policy",
    "climate finance",
    "environmental sustainability",
    "education policy",
    "education reform",
    "higher education reform",
    "skills development",
    "workforce development",
    "human capital development",
    "technical vocational education",
    "TVET policy",
    "education quality improvement",
    "education access",
    "teacher workforce",
    "education governance",
    "lifelong learning policy",
    "digital education",
    "public governance",
    "public sector reform",
    "institutional reform",
    "regulatory reform",
    "policy implementation",
    "government effectiveness",
    "public administration reform",
    "governance capacity",
    "anti corruption policy",
    "transparency and accountability",
    "public financial management",
    "civil service reform",
    "decentralization policy",
    "local government reform",
    "state capacity building",
    "rule of law reform",
    "administrative reform",
    "regulatory governance",
    "public policy evaluation",
    "economic development",
    "inclusive growth",
    "poverty reduction",
    "social protection",
    "social safety nets",
    "economic resilience",
    "development policy",
    "macroeconomic policy",
    "economic reform",
    "labor market policy",
    "employment generation",
    "income inequality",
    "financial inclusion",
    "private sector development",
    "SME development policy",
    "economic competitiveness",
    "regional development",
    "urban economy",
    "rural development",
    "infrastructure development",
    "transport policy",
    "urban transport",
    "public transport systems",
    "smart cities",
    "urban development",
    "urban planning policy",
    "housing policy",
    "infrastructure financing",
    "logistics development",
    "transport infrastructure",
    "sustainable transport",
    "mobility policy",
    "road safety policy",
    "urban infrastructure management",
    "agricultural policy",
    "food security",
    "sustainable agriculture",
    "climate smart agriculture",
    "agricultural productivity",
    "agricultural value chains",
    "food systems policy",
    "rural livelihoods",
    "water resource management",
    "water governance",
    "water supply and sanitation",
    "disaster risk management",
    "disaster risk reduction",
    "resilience building",
    "social inclusion",
    "gender equality policy",
    "youth employment",
    "migration policy",
    "aging population policy",
]


HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "x-api-key": API_KEY
}

# ================== HELPERS ==================
def safe_filename(title: str) -> str:
    title = title.strip()
    title = re.sub(r'[<>:"/\\|?*\x00-\x1F]', "", title)
    title = re.sub(r"\s+", " ", title)
    return title[:200]

def unique_path(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    path = os.path.join(OUT_DIR, filename)
    i = 1
    while os.path.exists(path):
        path = os.path.join(OUT_DIR, f"{name}_{i}{ext}")
        i += 1
    return path

def is_real_pdf(resp, first_bytes: bytes) -> bool:
    ctype = (resp.headers.get("Content-Type") or "").lower()
    if "pdf" in ctype:
        return True
    return first_bytes.startswith(b"%PDF-")

def download_pdf_if_valid(url: str, out_path: str) -> bool:
    with requests.get(url, stream=True, timeout=180, headers=HEADERS, allow_redirects=True) as r:
        if r.status_code != 200:
            return False

        it = r.iter_content(chunk_size=8192)
        first = next(it, b"")

        if not first or not is_real_pdf(r, first):
            return False

        with open(out_path, "wb") as f:
            f.write(first)
            for chunk in it:
                if chunk:
                    f.write(chunk)

    # loại file rác (HTML giả PDF ~ vài KB)
    if os.path.getsize(out_path) < 50_000:  # <50KB
        os.remove(out_path)
        return False

    return True

def semantic_search(query: str, offset: int):
    params = {
        "query": query,
        "limit": PAGE_SIZE,
        "offset": offset,
        "fields": "title,openAccessPdf"
    }
    r = requests.get(
        SEMANTIC_SCHOLAR_SEARCH,
        params=params,
        headers=HEADERS,
        timeout=60
    )
    r.raise_for_status()
    time.sleep(REQUEST_SLEEP)
    return r.json()

# ================== MAIN LOGIC ==================
def random_download():
    downloaded = 0
    seen_urls = set()

    while downloaded < TARGET_TOTAL:
        query = random.choice(QUERIES)
        offset = random.randrange(0, 400, PAGE_SIZE)

        print(f"\n▶ Query: {query} | offset={offset}")

        try:
            data = semantic_search(query, offset)
        except Exception as e:
            print("  ⚠ API error:", e)
            continue

        papers = data.get("data", [])
        random.shuffle(papers)

        for p in papers:
            if downloaded >= TARGET_TOTAL:
                break

            pdf = (p.get("openAccessPdf") or {}).get("url")
            title = p.get("title")

            if not pdf or not title or pdf in seen_urls:
                continue

            filename = safe_filename(title) + ".pdf"
            path = unique_path(filename)

            try:
                ok = download_pdf_if_valid(pdf, path)
            except Exception:
                ok = False

            if ok:
                seen_urls.add(pdf)
                downloaded += 1
                print(f"  ✔ {downloaded}/{TARGET_TOTAL}")
            else:
                if os.path.exists(path):
                    os.remove(path)

            time.sleep(REQUEST_SLEEP)

    print(f"\nDONE. Downloaded {downloaded} VALID PDFs into '{OUT_DIR}'")

if __name__ == "__main__":
    random_download()
