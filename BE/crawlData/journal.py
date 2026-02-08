import requests
import urllib3
from bs4 import BeautifulSoup
from urllib.parse import urljoin

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://vjol.info.vn"
START_URL = f"{BASE_URL}/index.php/journal"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

session = requests.Session()
session.headers.update(headers)

journals = set()
page = 1

while True:
    url = f"{START_URL}?page={page}"
    print(f"🔍 Crawling: {url}")

    r = session.get(url, verify=False)
    if r.status_code != 200:
        break

    soup = BeautifulSoup(r.text, "html.parser")

    found_on_page = 0

    # 🔑 journal link thật sự có dạng /index.php/<journal>
    for a in soup.select("a[href^='/index.php/']"):
        href = a.get("href")

        parts = href.strip("/").split("/")
        if len(parts) == 2 and parts[0] == "index.php":
            journals.add(parts[1])
            found_on_page += 1

    if found_on_page == 0:
        break

    page += 1

print("\n📚 TỔNG KẾT")
print(f"👉 Tổng số journal tìm được: {len(journals)}\n")

for j in sorted(journals):
    print("-", j)
