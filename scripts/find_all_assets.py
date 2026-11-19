import urllib.request
import ssl
import re
import os
import glob
import sys
from urllib.parse import urljoin

ctx = ssl._create_unverified_context()
base_url = "https://moisez.com"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

all_assets = set()

# Scan all HTML files
for hf in glob.glob("reference_dump/html/*.html"):
    with open(hf, 'r', encoding='utf-8') as f:
        html = f.read()
        for src in re.findall(r'src=[\'"]([^\'"]+)[\'"]', html):
            if any(src.lower().endswith(ext) for ext in ['.webp', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.ico']):
                all_assets.add(src)
        for srcset in re.findall(r'srcset=[\'"]([^\'"]+)[\'"]', html):
            for item in srcset.split(','):
                u = item.strip().split()[0]
                if u:
                    all_assets.add(u)
        for content in re.findall(r'content=[\'"]([^\'"]+\.(?:png|jpg|jpeg|webp|svg|ico))[\'"]', html):
            all_assets.add(content)
        for href in re.findall(r'href=[\'"]([^\'"]+\.(?:png|jpg|jpeg|webp|svg|ico|webmanifest))[\'"]', html):
            all_assets.add(href)
        # also find inline style url(...)
        for style_url in re.findall(r'url\([\'"]?([^\'")]+)[\'"]?\)', html):
            all_assets.add(style_url)

# Scan CSS
if os.path.exists("reference_dump/css/site.css"):
    with open("reference_dump/css/site.css", 'r', encoding='utf-8') as f:
        css = f.read()
        for u in re.findall(r'url\([\'"]?([^\'")]+)[\'"]?\)', css):
            clean = u.split('?')[0].split('#')[0]
            if any(clean.lower().endswith(ext) for ext in ['.webp', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.ico', '.woff2']):
                if clean.startswith('../'):
                    all_assets.add('/' + clean.replace('../', ''))
                elif not clean.startswith('http'):
                    all_assets.add('/' + clean.lstrip('/'))

# Scan JS for assets
for js_file in ["reference_dump/js/site.js", "reference_dump/js/vendor.js"]:
    if os.path.exists(js_file):
        with open(js_file, 'r', encoding='utf-8', errors='ignore') as f:
            js = f.read()
            for m in re.findall(r'[\'"](/images/[^\'"\s]+\.(?:webp|jpg|jpeg|png|svg))[\'"]', js):
                all_assets.add(m)

print(f"Total unique assets identified: {len(all_assets)}", flush=True)

success = 0
failed = 0
skipped = 0

for asset in sorted(all_assets):
    # sanitize
    asset_clean = asset.split('?')[0].split('#')[0]
    if asset_clean.startswith('http'):
        url = asset_clean
        rel_path = asset_clean.replace(base_url, '').replace('http://moisez.com/', '').lstrip('/')
    else:
        url = base_url + ('/' + asset_clean.lstrip('/') if not asset_clean.startswith('/') else asset_clean)
        rel_path = asset_clean.lstrip('/')
    
    target_path = os.path.join("reference_dump", rel_path)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        skipped += 1
        continue
    
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as res:
            data = res.read()
            with open(target_path, 'wb') as f:
                f.write(data)
            success += 1
            print(f"[OK] {rel_path} ({len(data)} B)", flush=True)
    except Exception as e:
        failed += 1
        print(f"[FAIL] {url} -> {e}", flush=True)

print(f"Asset fetch summary: {success} downloaded, {skipped} already existed, {failed} failed.", flush=True)
