import os
import re
import time
import hashlib
import requests
import urllib3
from bs4 import BeautifulSoup
from pypdf import PdfReader
import logging

logging.getLogger("pypdf").setLevel(logging.ERROR)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# khcn, khxhvn, TC, TLH 

# ================== CONFIG ==================
BASE_URL = "https://vjol.info.vn"
JOURNAL = "TLH"
ARCHIVE_URL = f"{BASE_URL}/index.php/{JOURNAL}/issue/archive"

SAVE_DIR_1 = "articles_vi"
SAVE_DIR_2 = "articles_vi_2"

TARGET_COUNT = 500
MIN_PAGES = 3
SLEEP_TIME = 0.3
# ============================================

os.makedirs(SAVE_DIR_1, exist_ok=True)
os.makedirs(SAVE_DIR_2, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/pdf"
}

session = requests.Session()
session.headers.update(headers)

saved_titles = set()
saved_hashes = set()

# ================== UTILS ==================
def sanitize_filename(title: str) -> str:
    title = title.strip()
    title = re.sub(r'[\\/:*?"<>|]', '_', title)
    title = re.sub(r'[\s_]+', ' ', title)
    return title


def file_hash_fast(path: str) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        h.update(f.read(1024 * 1024))  # 1MB đầu
    return h.hexdigest()


def get_page_count_fast(pdf_path):
    try:
        reader = PdfReader(pdf_path, strict=False)
        return len(reader.pages)
    except Exception:
        return 0


# ================== LOAD EXISTING PDFs ==================
def load_existing_pdfs(folder):
    print(f"🔍 Scanning existing PDFs in {folder}...")
    for file in os.listdir(folder):
        if not file.lower().endswith(".pdf"):
            continue

        title = sanitize_filename(file[:-4])
        path = os.path.join(folder, file)

        try:
            h = file_hash_fast(path)
            saved_titles.add(title)
            saved_hashes.add(h)
        except Exception:
            continue

    print(f"   → Loaded {len(saved_titles)} titles")
    print(f"   → Loaded {len(saved_hashes)} hashes")


# ================== SCRAPING ==================
def get_issue_links():
    r = session.get(ARCHIVE_URL, verify=False)
    soup = BeautifulSoup(r.text, "html.parser")

    issues = set()
    for a in soup.find_all("a", href=True):
        if "/issue/view/" in a["href"]:
            issues.add(a["href"])
    return list(issues)


def get_article_links(issue_url):
    r = session.get(issue_url, verify=False)
    soup = BeautifulSoup(r.text, "html.parser")

    articles = []
    for article in soup.select("div.obj_article_summary"):
        a = article.select_one("div.title a")
        if a and a.get("href"):
            articles.append(a["href"])

    print(f"   🔹 Found {len(articles)} articles")
    return articles


def download_pdf(article_url):
    r = session.get(article_url, verify=False)
    soup = BeautifulSoup(r.text, "html.parser")

    h1 = soup.find("h1")
    if not h1:
        return False

    title = sanitize_filename(h1.get_text(strip=True))
    if title in saved_titles:
        return False

    pdf_link = None
    for a in soup.select("a.obj_galley_link.pdf"):
        href = a.get("href")
        if href:
            pdf_link = href.replace("/article/view/", "/article/download/")
            break

    if not pdf_link:
        return False

    tmp_path = os.path.join(SAVE_DIR_2, "__tmp__.pdf")
    final_path = os.path.join(SAVE_DIR_2, title + ".pdf")

    pdf_resp = session.get(pdf_link, verify=False)
    if (
        pdf_resp.status_code != 200
        or "application/pdf" not in pdf_resp.headers.get("Content-Type", "")
        or len(pdf_resp.content) < 50_000
    ):
        return False

    with open(tmp_path, "wb") as f:
        f.write(pdf_resp.content)

    pages = get_page_count_fast(tmp_path)
    if pages < MIN_PAGES:
        os.remove(tmp_path)
        return False

    h = file_hash_fast(tmp_path)
    if h in saved_hashes:
        os.remove(tmp_path)
        return False

    os.rename(tmp_path, final_path)
    saved_titles.add(title)
    saved_hashes.add(h)
    return True


# ================== MAIN ==================
load_existing_pdfs(SAVE_DIR_1)
load_existing_pdfs(SAVE_DIR_2)

issues = get_issue_links()
downloaded = 0
checked = 0

print(f"📦 Found {len(issues)} issues")

for issue_url in issues:
    if downloaded >= TARGET_COUNT:
        break

    print(f"\n📂 Issue: {issue_url}")
    articles = get_article_links(issue_url)

    for article_url in articles:
        if downloaded >= TARGET_COUNT:
            break

        checked += 1
        try:
            ok = download_pdf(article_url)
            if ok:
                downloaded += 1
                percent = (downloaded / TARGET_COUNT) * 100
                print(f"✅ Saved {downloaded}/{TARGET_COUNT} ({percent:.1f}%) | checked: {checked}")
            time.sleep(SLEEP_TIME)
        except Exception as e:
            print("⚠️ Error:", e)

print("\n🎉 DONE")
print(f"👉 PDF mới lưu vào articles_vi_2: {downloaded}")
print(f"👉 Tổng article đã duyệt: {checked}")
