import re

def extract_main_content(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    # find <main ...> ... </main>
    m = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    if m:
        return m.group(1)
    return ""

for name, path in [
    ("Home", "reference_dump/html/home.html"),
    ("Work", "reference_dump/html/work.html"),
    ("About", "reference_dump/html/about.html"),
    ("Contact", "reference_dump/html/contact.html"),
    ("Tribu", "reference_dump/html/work_tribu.html"),
    ("TSG", "reference_dump/html/work_tsg-ferreteria.html"),
    ("21 Movement", "reference_dump/html/work_21-movement-reset.html"),
    ("Inzone", "reference_dump/html/work_inzone.html"),
    ("Footy", "reference_dump/html/work_footy.html")
]:
    content = extract_main_content(path)
    sections = re.findall(r'<section[^>]*class=[\'"]([^\'"]+)[\'"][^>]*id=[\'"]?([^\'">\s]*)', content)
    headings = re.findall(r'<h[1-4][^>]*>(.*?)</h[1-4]>', content, re.DOTALL)
    clean_headings = [re.sub(r'<[^>]+>', '', h).strip() for h in headings]
    print(f"=== {name} ({len(content)} chars) ===")
    print(f"Sections: {sections}")
    print(f"Headings: {clean_headings[:6]}")
