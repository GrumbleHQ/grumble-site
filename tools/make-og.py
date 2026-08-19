#!/usr/bin/env python3
"""Render tools/og.html to public/assets/og.png (1200x630).

Run this on a machine with internet access — the layout depends on Bricolage
Grotesque and Spline Sans Mono loading from Google Fonts. Rendering it offline
silently falls back to a different typeface and bakes the wrong wordmark into
the share image, which is why this isn't generated in CI.

    pip install playwright && playwright install chromium
    python3 tools/make-og.py

Then uncomment the og:image and twitter:card lines in public/index.html.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools" / "og.html"
OUT = ROOT / "public" / "assets" / "og.png"


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright is not installed:\n"
              "  pip install playwright && playwright install chromium", file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630})
        failed: list[str] = []
        page.on("requestfailed", lambda r: failed.append(r.url))
        page.goto(SOURCE.as_uri())
        page.wait_for_timeout(2500)  # let the webfonts land
        page.screenshot(path=str(OUT))
        browser.close()

    if any("fonts.g" in url for url in failed):
        OUT.unlink(missing_ok=True)
        print("Google Fonts failed to load — the wordmark would render in the "
              "wrong typeface, so nothing was written. Check your connection "
              "and try again.", file=sys.stderr)
        return 1

    print(f"Wrote {OUT.relative_to(ROOT)} (1200x630)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
