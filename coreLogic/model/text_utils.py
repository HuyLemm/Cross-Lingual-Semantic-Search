from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import List, Tuple, Optional, Dict

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None



_WS_RE = re.compile(r"\s+")
_PUNCT_RE = re.compile(r"[^\w\s/%\-\.:,]")  


def normalize_text(text: str) -> str:
    """
    Light normalization:
    - unicode normalize
    - collapse whitespace
    - keep useful punctuation for facts (/, -, ., :, %, ,)
    """
    if not text:
        return ""
    t = unicodedata.normalize("NFKC", text)
    t = t.strip()
    t = _WS_RE.sub(" ", t)
    return t


def normalize_number_tokens(text: str) -> str:
    """
    Normalize common number formats:
    - 1.200 -> 1200 (VN thousands separator)
    - 1,200 -> 1200
    Keep decimals: 3.14 remains 3.14 (best-effort).
    """
    if not text:
        return ""
    t = text

    t = re.sub(r"\b(\d{1,3})(?:\.(\d{3}))+\b", lambda m: m.group(0).replace(".", ""), t)
    t = re.sub(r"\b(\d{1,3})(?:,(\d{3}))+\b", lambda m: m.group(0).replace(",", ""), t)

    return t



@dataclass
class Facts:
    years: List[str]
    dates: List[str]
    numbers: List[str]
    percents: List[str]
    ids: List[str]
    caps: List[str]  

    def as_tokens(self) -> List[str]:
        toks: List[str] = []
        toks += [f"[YEAR:{y}]" for y in self.years]
        toks += [f"[DATE:{d}]" for d in self.dates]
        toks += [f"[NUM:{n}]" for n in self.numbers]
        toks += [f"[PCT:{p}]" for p in self.percents]
        toks += [f"[ID:{i}]" for i in self.ids]
        toks += [f"[CAP:{c.replace(' ', '_')}]" for c in self.caps]
        seen = set()
        out = []
        for x in toks:
            if x not in seen:
                out.append(x)
                seen.add(x)
        return out


_YEAR_RE = re.compile(r"\b(18\d{2}|19\d{2}|20\d{2}|21\d{2})\b")
_DATE_RE = re.compile(
    r"\b(?:"
    r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"
    r"|"
    r"(\d{4}[/-]\d{1,2}[/-]\d{1,2})"
    r")\b"
)
_PERCENT_RE = re.compile(r"\b\d+(?:\.\d+)?\s?%\b")

_NUMBER_RE = re.compile(r"\b\d+(?:\.\d+)?\b")

_ID_RE = re.compile(
    r"\b(?:Điều\s+\d+|Khoản\s+\d+|Chương\s+\d+|Mục\s+\d+|Nghị\s*định\s+\d+/\d{4}"
    r"|Thông\s*tư\s+\d+/\d{4}|Chapter\s+\d+|Act\s+No\.?\s*\d+)\b",
    flags=re.IGNORECASE
)

_CAPS_RE = re.compile(r"\b(?:[A-ZĐ][\wÀ-ỹĐđ]+(?:\s+[A-ZĐ][\wÀ-ỹĐđ]+){0,4})\b")


def extract_facts(query: str) -> Facts:
    q = normalize_text(query)
    qn = normalize_number_tokens(q)

    years = _YEAR_RE.findall(qn)

    dates_raw = []
    for m in _DATE_RE.finditer(qn):
        d = m.group(1) or m.group(2)
        if d:
            dates_raw.append(d)
    dates = [d.replace("-", "/") for d in dates_raw]

    percents = [p.replace(" ", "") for p in _PERCENT_RE.findall(qn)]

    ids = [m.group(0) for m in _ID_RE.finditer(q)]

    nums = _NUMBER_RE.findall(qn)
    nums_filtered = []
    years_set = set(years)
    pct_nums = set([re.sub(r"%$", "", p) for p in percents])
    for n in nums:
        if n in years_set:
            continue
        if n in pct_nums:
            continue
        nums_filtered.append(n)

    caps = []
    for c in _CAPS_RE.findall(q):
        if len(c) <= 1:
            continue
        caps.append(c)

    return Facts(
        years=years[:6],
        dates=dates[:6],
        numbers=nums_filtered[:10],
        percents=percents[:6],
        ids=ids[:6],
        caps=caps[:8],
    )


_STOPWORDS_VI = set("""
là và của cho với từ một những các cái này đó ở tại trong ngoài trên dưới khi như vì do
tôi bạn em anh chị chúng ta họ nó mà để đã đang sẽ
""".split())


def extract_keywords(query: str, max_keywords: int = 8) -> List[str]:
    """
    Simple keyword selection:
    - split by space
    - drop stopwords
    - prefer longer tokens (your current logic likely does this too)
    """
    q = normalize_text(query)
    tokens = [t for t in re.split(r"\s+", q) if t]
    tokens = [t for t in tokens if t.lower() not in _STOPWORDS_VI]
    tokens = [t for t in tokens if not _PUNCT_RE.sub("", t) == ""]
    tokens.sort(key=lambda x: len(x), reverse=True)
    out = []
    seen = set()
    for t in tokens:
        tl = t.lower()
        if tl in seen:
            continue
        out.append(t)
        seen.add(tl)
        if len(out) >= max_keywords:
            break
    return out



def _l2_normalize(v: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(v)
    if n == 0:
        return v
    return v / n


def embed_text(model: "SentenceTransformer", text: str) -> np.ndarray:
    vec = model.encode([text], normalize_embeddings=False, show_progress_bar=False)
    v = np.asarray(vec[0], dtype=np.float32)
    return v


def keyword_weighted_embedding(
    model: "SentenceTransformer",
    query: str,
    *,
    w_semantic: float = 0.60,
    w_facts: float = 0.30,
    w_keywords: float = 0.10,
    max_keywords: int = 8,
) -> np.ndarray:
    """
    Fact-aware weighted embedding.

    - semantic embedding: full query
    - facts embedding: FACT tokens extracted from query
    - keywords embedding: concatenated keywords (prefers longer tokens)

    Returns L2-normalized vector.
    """
    q = normalize_text(query)
    q = normalize_number_tokens(q)

    v_sem = embed_text(model, q)

    facts = extract_facts(q)
    fact_tokens = facts.as_tokens()
    if fact_tokens:
        facts_str = "FACTS: " + " ".join(fact_tokens)
        v_fact = embed_text(model, facts_str)
    else:
        v_fact = np.zeros_like(v_sem)

    kws = extract_keywords(q, max_keywords=max_keywords)
    if kws:
        kw_str = "KEYWORDS: " + " ".join(kws)
        v_kw = embed_text(model, kw_str)
    else:
        v_kw = np.zeros_like(v_sem)

    v = (w_semantic * v_sem) + (w_facts * v_fact) + (w_keywords * v_kw)
    v = _l2_normalize(v.astype(np.float32))
    return v


def build_augmented_query(query: str) -> str:
    """
    Optional: if you want to log/inspect what is being emphasized.
    """
    q = normalize_number_tokens(normalize_text(query))
    facts = extract_facts(q).as_tokens()
    if facts:
        return f"{q} | " + " ".join(facts)
    return q
