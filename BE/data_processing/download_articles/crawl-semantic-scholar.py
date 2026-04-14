import requests
import time
from pathlib import Path

# ================= CONFIG =================
API_KEY = "fkjIl0SGJ47TzVgjhXwIUajBP4QO3C5w6TvdgGX2"
QUERY = "semantic search FAISS reranker embedding question answering"
MAX_RESULTS = 500
DATA_DIR = Path("data")

SEARCH_URL = "https://api.semanticscholar.org/graph/v1/paper/search"
FIELDS = "title,openAccessPdf"

# ================= SETUP =================
DATA_DIR.mkdir(exist_ok=True)

headers = {
    "x-api-key": API_KEY
}

params = {
    "query": QUERY,
    "limit": 100,   # max allowed per request
    "offset": 0,
    "fields": FIELDS
}

downloaded = 0

print("Starting download...\n")

while downloaded < MAX_RESULTS:
    response = requests.get(SEARCH_URL, params=params, headers=headers)
    
    if response.status_code != 200:
        print("Error:", response.text)
        break

    data = response.json()
    papers = data.get("data", [])

    if not papers:
        break

    for paper in papers:
        if downloaded >= MAX_RESULTS:
            break

        pdf_info = paper.get("openAccessPdf")
        if pdf_info and pdf_info.get("url"):
            pdf_url = pdf_info["url"]
            title = paper.get("title", f"paper_{downloaded}")

            # tạo tên file sạch
            filename = "".join(c for c in title if c.isalnum() or c in " _-")[:80]
            filepath = DATA_DIR / f"{filename}.pdf"

            try:
                pdf_response = requests.get(pdf_url, timeout=30)
                if pdf_response.status_code == 200:
                    with open(filepath, "wb") as f:
                        f.write(pdf_response.content)

                    downloaded += 1
                    print(f"[{downloaded}] Downloaded: {filename}")

                    time.sleep(1)  # đảm bảo 1 request/giây
            except:
                continue

    params["offset"] += 100
    time.sleep(1)  # rate limit cho search request

print(f"\nFinished. Total downloaded: {downloaded}")