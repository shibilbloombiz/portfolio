import urllib.request
import ssl
import re
import os
import json

ctx = ssl._create_unverified_context()

routes = [
    "",
    "work/",
    "about/",
    "contact/",
    "work/tribu/",
    "work/tsg-ferreteria/",
    "work/21-movement-reset/",
    "work/inzone/",
    "work/footy/"
]

base_url = "https://moisez.com/"

os.makedirs("reference_dump", exist_ok=True)
os.makedirs("reference_dump/html", exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

summary = {}

for r in routes:
    url = base_url + r
    print(f"Fetching {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as res:
            html = res.read().decode('utf-8')
            filename = r.replace('/', '_').strip('_') or 'home'
            filepath = os.path.join("reference_dump/html", f"{filename}.html")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(html)
            
            # Extract links, scripts, css, images
            css_links = re.findall(r'<link[^>]+rel=[\'"]stylesheet[\'"][^>]*href=[\'"]([^\'"]+)[\'"]', html, re.I)
            if not css_links:
                css_links = re.findall(r'<link[^>]+href=[\'"]([^\'"]+\.css[^\'"]*)[\'"]', html, re.I)
            js_links = re.findall(r'<script[^>]+src=[\'"]([^\'"]+)[\'"]', html, re.I)
            img_links = re.findall(r'<img[^>]+src=[\'"]([^\'"]+)[\'"]', html, re.I)
            srcset_links = re.findall(r'srcset=[\'"]([^\'"]+)[\'"]', html, re.I)
            
            summary[r] = {
                "status": res.status,
                "length": len(html),
                "css": css_links,
                "js": js_links,
                "images_count": len(img_links),
                "sample_images": img_links[:10]
            }
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        summary[r] = {"error": str(e)}

with open("reference_dump/summary.json", "w", encoding="utf-8") as f:
    json.dump(summary, f, indent=2)

print("Done! Summary saved to reference_dump/summary.json")
