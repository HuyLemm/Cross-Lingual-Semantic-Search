import requests
from bs4 import BeautifulSoup
import urllib3
import time

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://vjol.info.vn"
JOURNALS = ["khcn", "khxhvn"]
SLEEP = 0.2

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0"
})


def count_articles(journal_code):
    archive_url = f"{BASE_URL}/index.php/{journal_code}/issue/archive"
    r = session.get(archive_url, verify=False)
    if r.status_code != 200:
        print(f"❌ Cannot access {journal_code}")
        return 0

    soup = BeautifulSoup(r.text, "html.parser")

    # lấy tất cả issue
    issue_links = set()
    for a in soup.find_all("a", href=True):
        if "/issue/view/" in a["href"]:
            issue_links.add(a["href"])

    total = 0

    for issue in issue_links:
        r2 = session.get(issue, verify=False)
        soup2 = BeautifulSoup(r2.text, "html.parser")

        articles = soup2.select("div.obj_article_summary")
        total += len(articles)

        time.sleep(SLEEP)

    return total


# ================= MAIN =================
for j in JOURNALS:
    print(f"🔍 Đang đếm journal: {j}")
    total = count_articles(j)
    print(f"   ✅ Tổng số bài: {total}\n")
