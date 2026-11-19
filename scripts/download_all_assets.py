import urllib.request
import ssl
import re
import os
import glob
from urllib.parse import urljoin

ctx = ssl._create_unverified_context()
base_url = "https://moisez.com/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# Download fonts
fonts = [
    "fonts/SaansVF.woff2",
    "fonts/SaansVFItalics.woff2",
    "fonts/officecodepro-regular.woff2"
]

for f in fonts:
    url = urljoin(base_url, f)
    target = os.path.join("reference_dump", f)
    os.makedirs(os.path.dirname(target), exist_ok=True)
    if not os.path.exists(target):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ctx) as res:
                data = res.read()
                with open(target, 'wb') as out:
                    out.write(data)
                print(f"Font downloaded: {f} ({len(data)} bytes)")
        except Exception as e:
            print(f"Font error {f}: {e}")

# Find all image URLs across all downloaded HTML files
all_images = set()
for html_file in glob.glob("reference_dump/html/*.html"):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        # Find src
        srcs = re.findall(r'<img[^>]+src=[\'"]([^\'"]+)[\'"]', content, re.I)
        all_images.update(srcs)
        # Find srcset
        srcsets = re.findall(r'srcset=[\'"]([^\'"]+)[\'"]', content, re.I)
        for s in srcsets:
            parts = s.split(',')
            for p in parts:
                url = p.strip().split()[0]
                if url:
                    all_images.update([url])
        # Find svg images / icons / video / audio
        svgs = re.findall(r'src=[\'"]([^\'"]+\.svg)[\'"]', content, re.I)
        all_images.update(svgs)
        # Find og:image or favicon
        meta_imgs = re.findall(r'content=[\'"]([^\'"]+\.(?:png|jpg|jpeg|webp|svg))[\'"]', content, re.I)
        all_images.update(meta_imgs)

# Also check CSS for background-image, cursor, etc.
if os.path.exists("reference_dump/css/site.css"):
    with open("reference_dump/css/site.css", 'r', encoding='utf-8') as f:
        css = f.read()
        css_urls = re.findall(r'url\([\'"]?([^\'")]+)[\'"]?\)', css)
        for u in css_urls:
            u_clean = u.split('?')[0].split('#')[0]
            if u_clean.endswith(('.svg', '.png', '.jpg', '.webp', '.gif')):
                if u_clean.startswith('../'):
                    all_images.add('/' + u_clean.replace('../', ''))
                elif not u_clean.startswith('http'):
                    all_images.add('/' + u_clean.lstrip('/'))

print(f"Found {len(all_images)} unique image/asset URLs.")

for img in sorted(all_images):
    # normalize path
    if img.startswith('http'):
        url = img
        rel_path = img.replace(base_url, '').replace('http://moisez.com/', '')
    else:
        url = urljoin(base_url, img.lstrip('/'))
        rel_path = img.lstrip('/')
    
    target = os.path.join("reference_dump", rel_path)
    os.makedirs(os.path.dirname(target), exist_ok=True)
    if not os.path.exists(target):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, context=ctx) as res:
                data = res.read()
                with open(target, 'wb') as out:
                    out.write(data)
                print(f"Downloaded asset: {rel_path} ({len(data)} bytes)")
        except Exception as e:
            print(f"Error downloading {url}: {e}")

print("Asset downloading complete!")
