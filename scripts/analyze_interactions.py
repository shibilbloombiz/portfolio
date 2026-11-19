with open("reference_dump/js/site.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

def search_sections(pattern, title, max_len=1500):
    print(f"\n==================== {title} ====================")
    matches = [m.start() for m in re.finditer(pattern, js, re.I)]
    for idx in matches[:3]:
        start = max(0, idx - 100)
        end = min(len(js), idx + max_len)
        print(f"--- Match at {idx} ---")
        print(js[start:end])

search_sections(r'data-kern', "KERNING INTERACTION")
search_sections(r'canvas-target|Matter', "MATTER.JS FOOTER")
search_sections(r'data-drag-card', "ABOUT DRAGGABLE CARDS")
search_sections(r'data-term|GAS', "GAS INTERACTION")
search_sections(r'view-switch|data-view-btn', "VIEW SWITCH / SYSTEM VIEW")
search_sections(r'data-copy-email', "COPY EMAIL")
search_sections(r'data-contact-form', "CONTACT FORM")
