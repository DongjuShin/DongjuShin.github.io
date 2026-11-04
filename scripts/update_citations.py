"""Fetch per-paper citation counts from a Google Scholar profile and write assets/data/citations.json.

Run daily by .github/workflows/citations.yml. Uses only the standard library.
If Scholar blocks the request or the page cannot be parsed, the existing JSON is left untouched
so the site keeps showing the last known counts.
"""
from __future__ import annotations

import html
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCHOLAR_USER = "BxOb_T8AAAAJ"
OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "citations.json"
URL = f"https://scholar.google.com/citations?user={SCHOLAR_USER}&hl=en&cstart=0&pagesize=100"


def norm(title: str) -> str:
    """Normalise a title so the site and Scholar spellings match (case, punctuation, spacing)."""
    return re.sub(r"[^a-z0-9]+", "", title.lower())


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def parse(page: str) -> tuple[dict, int | None]:
    papers = {}
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', page, re.S):
        t = re.search(r'class="gsc_a_at"[^>]*>(.*?)</a>', row, re.S)
        c = re.search(r'class="gsc_a_ac[^"]*"[^>]*>(\d*)</a>', row, re.S)
        if t:
            papers[norm(html.unescape(re.sub(r"<[^>]+>", "", t.group(1))))] = int(c.group(1)) if c and c.group(1) else 0
    total = re.search(r'<td class="gsc_rsb_std">(\d+)</td>', page)
    return papers, int(total.group(1)) if total else None


def main() -> int:
    try:
        papers, total = parse(fetch(URL))
    except Exception as e:  # network error, block page, etc.
        print(f"Scholar fetch failed, keeping previous data: {e}")
        return 0
    if not papers:
        print("No publications parsed (probably a captcha page), keeping previous data.")
        return 0
    data = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "profile": SCHOLAR_USER, "total": total, "papers": papers}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(papers)} papers, total citations {total} → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
