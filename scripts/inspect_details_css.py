import re

with open('reference_dump/css/site.css', 'r', encoding='utf-8') as f:
    css = f.read()

for m in re.finditer(r'\[data-surface=[^\]]*\][^{]*\{[^}]+\}', css):
    print(m.group(0))

for m in re.finditer(r'\.home-details[^{]*\{[^}]+\}', css):
    print(m.group(0))

for m in re.finditer(r'#details[^{]*\{[^}]+\}', css):
    print(m.group(0))
