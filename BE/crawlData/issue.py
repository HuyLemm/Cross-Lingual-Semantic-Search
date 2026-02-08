import requests
import urllib3
from bs4 import BeautifulSoup
from urllib.parse import urljoin

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://vjol.info.vn"
JOURNAL = "khcn"
ARCHIVE_URL = f"{BASE_URL}/index.php/{JOURNAL}/issue/archive"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

session = requests.Session()
session.headers.update(headers)

# 1. Lấy danh sách issue
r = session.get(ARCHIVE_URL, verify=False)
soup = BeautifulSoup(r.text, "html.parser")

issue_links = set()
for a in soup.find_all("a", href=True):
    if "/issue/view/" in a["href"]:
        issue_links.add(urljoin(BASE_URL, a["href"]))

print(f"📦 Tổng issue: {len(issue_links)}")

# 2. Đếm article trong từng issue
total_articles = 0

for issue_url in issue_links:
    r = session.get(issue_url, verify=False)
    soup = BeautifulSoup(r.text, "html.parser")

    articles = set()
    for a in soup.find_all("a", href=True):
        if "/article/view/" in a["href"]:
            articles.add(a["href"])

    total_articles += len(articles)
    print(f"Issue {issue_url.split('/')[-1]}: {len(articles)} bài")

print("\n📊 TỔNG KẾT")
print(f"👉 Tổng số bài (article): {total_articles}")
