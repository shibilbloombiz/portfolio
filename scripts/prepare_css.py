import re
import os

os.makedirs("src/styles", exist_ok=True)

with open("reference_dump/css/site.css", "r", encoding="utf-8") as f:
    css = f.read()

# Replace font urls ../fonts/ -> /fonts/
css = re.sub(r'url\([\'"]?\.\./fonts/([^\'")]+)[\'"]?\)', r'url("/fonts/\1")', css)

# Replace image urls ../images/ -> /images/
css = re.sub(r'url\([\'"]?\.\./images/([^\'")]+)[\'"]?\)', r'url("/images/\1")', css)

# Write to src/styles/main.css
with open("src/styles/main.css", "w", encoding="utf-8") as f:
    f.write(css)

print("Created src/styles/main.css with corrected asset paths!")
