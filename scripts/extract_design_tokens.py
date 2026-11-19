import re

with open("reference_dump/css/site.css", "r", encoding="utf-8") as f:
    css = f.read()

# Extract :root variables
root_match = re.findall(r':root\s*\{([^}]+)\}', css)
variables = {}
for block in root_match:
    for line in block.split(';'):
        if '--' in line:
            parts = line.split(':', 1)
            if len(parts) == 2:
                variables[parts[0].strip()] = parts[1].strip()

print("=== DESIGN TOKENS (--*) ===")
for k, v in sorted(variables.items()):
    print(f"{k}: {v}")

# Extract @font-face rules
font_faces = re.findall(r'@font-face\s*\{([^}]+)\}', css)
print("\n=== FONT FACES ===")
for ff in font_faces:
    family = re.search(r'font-family:\s*([^;]+)', ff)
    src = re.search(r'src:\s*([^;]+)', ff)
    weight = re.search(r'font-weight:\s*([^;]+)', ff)
    style = re.search(r'font-style:\s*([^;]+)', ff)
    print(f"Family: {family.group(1) if family else 'N/A'}, Weight: {weight.group(1) if weight else 'N/A'}, Style: {style.group(1) if style else 'N/A'}")

# Extract key breakpoints
media_queries = set(re.findall(r'@media\s*\([^\)]+\)', css))
print("\n=== MEDIA QUERIES ===")
for mq in sorted(media_queries):
    print(mq)
