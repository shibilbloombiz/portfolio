import shutil
import os

os.makedirs("public", exist_ok=True)

# Copy fonts
if os.path.exists("reference_dump/fonts"):
    shutil.copytree("reference_dump/fonts", "public/fonts", dirs_exist_ok=True)
    print("Fonts copied to public/fonts")

# Copy images
if os.path.exists("reference_dump/images"):
    shutil.copytree("reference_dump/images", "public/images", dirs_exist_ok=True)
    print("Images copied to public/images")

# Copy root assets
for item in ["favicon.ico", "site.webmanifest"]:
    src = os.path.join("reference_dump", item)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join("public", item))
        print(f"Copied {item} to public/{item}")

print("Assets ready in public directory.")
