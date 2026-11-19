import urllib.request
import ssl
import re
import os

ctx = ssl._create_unverified_context()
base_url = "https://moisez.com"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def download_file(rel_path, target_path):
    url = base_url + rel_path if rel_path.startswith('/') else base_url + '/' + rel_path
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as res:
            data = res.read()
            with open(target_path, 'wb') as f:
                f.write(data)
            print(f"Downloaded {url} -> {target_path} ({len(data)} bytes)")
            return data
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return None

# Download css and js
css_data = download_file('/css/site.d409eb25.css', 'reference_dump/css/site.css')
js_vendor = download_file('/js/vendor.d0cb7418.js', 'reference_dump/js/vendor.js')
js_site = download_file('/js/site.2d80a806.js', 'reference_dump/js/site.js')

# Check fonts in css
if css_data:
    css_text = css_data.decode('utf-8', errors='ignore')
    font_urls = re.findall(r'url\([\'"]?([^\'")]+(?:\.woff2?|\.ttf|\.otf)[^\'") ]*)[\'"]?\)', css_text)
    print("Found font URLs in CSS:", set(font_urls))
    for font_url in set(font_urls):
        font_path = font_url.split('?')[0].split('#')[0]
        download_file(font_path, os.path.join('reference_dump', font_path.lstrip('/')))

print("Core assets downloaded.")
