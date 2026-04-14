import re
from pathlib import Path
from typing import Optional, Dict, Tuple


def _num(s: Optional[str]) -> Optional[float]:
    if s is None:
        return None
    s = s.strip()
    try:
        return float(s)
    except ValueError:
        return None


def _int(s: Optional[str]) -> Optional[int]:
    if s is None:
        return None
    s = s.strip()
    try:
        return int(float(s))
    except ValueError:
        return None


def find_first(text: str, patterns) -> Optional[str]:
    """
    Return group(1) if pattern has a capturing group.
    If pattern has NO capturing group, return the full match (group 0).
    """
    for pat in patterns:
        m = re.search(pat, text, flags=re.IGNORECASE | re.MULTILINE)
        if not m:
            continue
        # if there is at least one capturing group, use it
        if m.lastindex and m.lastindex >= 1:
            return m.group(1)
        # else use full match
        return m.group(0)
    return None


def extract_topk_block(text: str, k: int) -> str:
    block_re = re.compile(
        rf"Top-{k}\s*:\s*([\s\S]*?)(?=\n\s*Top-\d+\s*:|\n\s*Latency\s*\(ms\)\s*:|\n\s*Runtime\s*:|\n\s*Total wall time|\Z)",
        flags=re.IGNORECASE,
    )
    m = block_re.search(text)
    return m.group(1) if m else ""


def extract_accuracy_total(block: str) -> Optional[float]:
    v = find_first(block, [r"accuracy_total\s*:\s*([0-9.]+)"])
    return _num(v)


def extract_accuracy_title(block: str) -> Optional[float]:
    v = find_first(block, [r"accuracy_title\s*:\s*([0-9.]+)"])
    return _num(v)


def extract_accuracy_context(block: str) -> Optional[float]:
    v = find_first(block, [r"accuracy_context\s*:\s*([0-9.]+)"])
    return _num(v)


def extract_latency(text: str) -> Dict[str, Optional[float]]:
    # Grab latency section until runtime-ish lines or end
    lat_block = find_first(
        text,
        [
            r"Latency\s*\(ms\)\s*:\s*([\s\S]*?)(?=\n\s*(Total wall time|Runtime)\s*:|\Z)",
        ],
    )
    block = lat_block or ""

    avg = _num(find_first(block, [r"\bAvg\b\s*:\s*([0-9.]+)"]))
    p50 = _num(find_first(block, [r"\bP50\b\s*:\s*([0-9.]+)"]))
    p90 = _num(find_first(block, [r"\bP90\b\s*:\s*([0-9.]+)"]))
    p95 = _num(find_first(block, [r"\bP95\b\s*:\s*([0-9.]+)"]))

    return {"avg": avg, "p50": p50, "p90": p90, "p95": p95}


def extract_runtime(text: str) -> Dict[str, Optional[float]]:
    # Your logs have:
    # Total wall time : 26927.19 s
    # Avg per-query   : 5979.83 ms/query
    # Throughput      : 0.17 queries/s
    wall_s = _num(
        find_first(
            text,
            [
                r"Total wall time\s*:\s*([0-9.]+)\s*s",
                r"Total wall time\s*\(s\)\s*:\s*([0-9.]+)",
            ],
        )
    )
    avg_per_query_ms = _num(
        find_first(
            text,
            [
                r"Avg per-query\s*:\s*([0-9.]+)\s*ms/query",
                r"Avg per-query\s*\(ms\)\s*:\s*([0-9.]+)",
            ],
        )
    )
    qps = _num(
        find_first(
            text,
            [
                r"Throughput\s*:\s*([0-9.]+)\s*queries/s",
                r"Throughput\s*\(queries/s\)\s*:\s*([0-9.]+)",
            ],
        )
    )
    return {"wall_time_s": wall_s, "avg_per_query_ms": avg_per_query_ms, "throughput_qps": qps}


def fmt_num(v: Optional[float], digits: int = 4) -> str:
    if v is None:
        return "N/A"
    return f"{v:.{digits}f}"


def fmt_lat(v: Optional[float]) -> str:
    if v is None:
        return "N/A"
    return f"{v:.2f}"


def normalize_one(text: str) -> str:
    header_line = find_first(
        text,
        [
            r"^=====.*RETRIEVAL.*=====$",
            r"^=====.*=====$",
        ],
    )
    header_line = (header_line or "===== RETRIEVAL EVALUATION =====").strip()

    mode = find_first(
        text,
        [
            r"RETRIEVAL EVALUATION\s*\((.*?)\)",
            r"Mode\s*:\s*(.+)",
        ],
    )

    dataset_total = _int(find_first(text, [r"Total items in dataset\s*:\s*(\d+)", r"dataset_total\s*:\s*(\d+)"]))
    evaluated = _int(find_first(text, [r"Evaluated queries\s*:\s*(\d+)", r"evaluated_queries\s*:\s*(\d+)"]))
    skipped = _int(
        find_first(
            text,
            [
                r"Skipped\s*\(missing fields\)\s*:\s*(\d+)",
                r"Skipped missing fields\s*:\s*(\d+)",
                r"skipped_missing\s*:\s*(\d+)",
            ],
        )
    )

    topk = {}
    for k in (1, 3, 5, 10):
        block = extract_topk_block(text, k)
        topk[k] = {
            "title": extract_accuracy_title(block),
            "context": extract_accuracy_context(block),
            "total": extract_accuracy_total(block),
        }

    latency = extract_latency(text)
    runtime = extract_runtime(text)

    out = []
    out.append(header_line)
    if mode:
        out.append("")
        out.append(f"Mode                : {mode.strip()}")

    out.append("")
    out.append(f"Total items in dataset : {dataset_total if dataset_total is not None else 'N/A'}")
    out.append(f"Evaluated queries      : {evaluated if evaluated is not None else 'N/A'}")
    out.append(f"Skipped missing fields : {skipped if skipped is not None else 'N/A'}")
    out.append("")

    for k in (1, 3, 5, 10):
        out.append(f"Top-{k}:")
        out.append(f"  accuracy_title   : {fmt_num(topk[k]['title'], 4)}")
        out.append(f"  accuracy_context : {fmt_num(topk[k]['context'], 4)}")
        out.append(f"  accuracy_total   : {fmt_num(topk[k]['total'], 4)}")
        out.append("")

    out.append("Latency (ms):")
    out.append(f"  Avg : {fmt_lat(latency['avg'])}")
    out.append(f"  P50 : {fmt_lat(latency['p50'])}")
    out.append(f"  P90 : {fmt_lat(latency['p90'])}")
    out.append(f"  P95 : {fmt_lat(latency['p95'])}")
    out.append("")

    out.append("Runtime:")
    out.append(f"  Total wall time (s)    : {fmt_lat(runtime['wall_time_s']) if runtime['wall_time_s'] is not None else 'N/A'}")
    out.append(f"  Avg per-query (ms)     : {fmt_lat(runtime['avg_per_query_ms']) if runtime['avg_per_query_ms'] is not None else 'N/A'}")
    out.append(f"  Throughput (queries/s) : {fmt_num(runtime['throughput_qps'], 2) if runtime['throughput_qps'] is not None else 'N/A'}")
    out.append("")

    return "\n".join(out).rstrip() + "\n"


def normalize_folder(input_dir: str, output_dir: str, overwrite: bool = True) -> Tuple[int, int]:
    in_dir = Path(input_dir)
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    total = 0
    ok = 0

    for p in sorted(in_dir.glob("*.txt")):
        total += 1
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
            norm = normalize_one(text)

            out_path = out_dir / p.name
            if out_path.exists() and (not overwrite):
                continue
            out_path.write_text(norm, encoding="utf-8")
            ok += 1
        except Exception as e:
            print(f"[ERR] {p.name}: {e}")

    return total, ok


if __name__ == "__main__":
    # ✅ chỉnh 2 dòng này theo project của bạn
    INPUT_DIR = "./BGE"
    OUTPUT_DIR = "./BGE_normalized"

    total, ok = normalize_folder(INPUT_DIR, OUTPUT_DIR, overwrite=True)
    print(f"Done. normalized {ok}/{total} files.")