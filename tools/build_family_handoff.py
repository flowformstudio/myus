#!/usr/bin/env python3
"""Build the MyUS Family handoff files from the demo page.

Source of truth: ../family.html (the demo page with site header/footer and the
visitor switch). This script extracts the marked CSS and HTML blocks and writes
three files into ../handoff/:

  myus-family.html          one file: <style> block on top, section markup below
                            (the format Karen pastes from)
  myus-family.css           the CSS block alone
  myus-family-section.html  the markup alone

Run after every edit to family.html:  python3 tools/build_family_handoff.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "family.html"
OUT = ROOT / "handoff"

# Where the images live for the pasted version. The demo deploy already serves
# them, so the pasted section renders immediately; swap for MyUS's CDN later with
# a single find & replace.
ASSET_BASE = "https://myus-demo.vercel.app/assets/family/"

# Demo links -> live-site links. Left as anchors until MyUS confirms the URLs.
LINKS = {
    "confirmation.html": "#signup",
    "MyUS%20Logged%20in/index.html?next=family": "#add-member",
    "MyUS%20Logged%20in/pages/myus-family.html": "#add-member",
}

HEADER = f"""<!--
  MyUS Family landing section
  ---------------------------
  Paste the <style> block and the <section>…</section> markup into the page.

  - Fonts: Poppins is expected from the site (no font import here).
  - No JavaScript. The FAQ uses the browser's native <details> element.
  - Every class is prefixed "mf-" and scoped under .myus-family, so site CSS
    does not bleed in and this CSS does not touch the rest of the page.
  - Images are loaded from {ASSET_BASE}
    Find & replace that prefix to move them to the MyUS CDN.
  - Links to set: #signup (Sign up for MyUS), #add-member (Add someone to your family),
    #mf-how is an in-page anchor and needs no change.
  - This file is generated from family.html by tools/build_family_handoff.py;
    edit the source, not this file.
-->
"""


def block(text, name):
    # CSS block uses /* */ markers (an HTML comment inside <style> breaks the CSS parser); HTML block uses <!-- -->.
    m = re.search(rf"(?:<!--|/\*) MF:{name}:START (?:-->|\*/)\n?(.*?)\n?\s*(?:<!--|/\*) MF:{name}:END (?:-->|\*/)", text, re.S)
    if not m:
        raise SystemExit(f"marker MF:{name} not found in {SRC}")
    return m.group(1)


def main():
    src = SRC.read_text()
    css = block(src, "CSS")
    html = block(src, "HTML")

    # Drop the signed-in CTA variants (demo-only; the live page has no auth state).
    html = re.sub(r"[ \t]*<a [^>]*mf-only-in[^>]*>.*?</a>\n", "", html)
    # Signed-out variants are the only ones left; the class is now meaningless.
    html = html.replace(" mf-only-out", "")

    html = html.replace("assets/family/", ASSET_BASE)
    for demo, live in LINKS.items():
        html = html.replace(f'href="{demo}"', f'href="{live}"')

    # Dedent the extracted blocks by their common leading whitespace.
    def dedent(s):
        lines = s.splitlines()
        pad = min((len(l) - len(l.lstrip()) for l in lines if l.strip()), default=0)
        return "\n".join(l[pad:] if l.strip() else "" for l in lines).strip("\n") + "\n"

    css, html = dedent(css), dedent(html)

    OUT.mkdir(exist_ok=True)
    (OUT / "myus-family.css").write_text(css)
    (OUT / "myus-family-section.html").write_text(html)
    (OUT / "myus-family.html").write_text(HEADER + "<style>\n" + css + "</style>\n\n" + html)

    leftovers = [l for l in html.splitlines() if '"assets/family/' in l or "confirmation.html" in l or "Logged%20in" in l]
    print(f"wrote {OUT}/myus-family.html ({len(css.encode())} B css, {len(html.encode())} B html)")
    if leftovers:
        print("WARNING demo paths left in handoff:\n  " + "\n  ".join(leftovers))


if __name__ == "__main__":
    main()
