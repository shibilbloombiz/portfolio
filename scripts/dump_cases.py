import re

def print_case_structure(filename, name):
    with open(f"reference_dump/html/{filename}", "r", encoding="utf-8") as f:
        html = f.read()
    print(f"\n==================== {name} ====================")
    # find tone
    tone = re.search(r'--case-tone:\s*([^;"\s]+)', html)
    print("Tone:", tone.group(1) if tone else "none")
    
    # find images and frames
    figs = re.findall(r'<div class="case-fig[^"]*"[^>]*data-frame="([^"]+)"[^>]*>.*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"', html, re.DOTALL)
    for frame, src, alt in figs:
        print(f"  [FIG] Frame: {frame} | Src: {src} | Alt: {alt[:40]}...")
    
    # check for video
    videos = re.findall(r'<video[^>]*data-case-film="([^"]+)"[^>]*poster="([^"]+)"', html)
    for v, p in videos:
        print(f"  [VIDEO] Film: {v} | Poster: {p}")

print_case_structure("work_tribu.html", "TRIBU")
print_case_structure("work_tsg-ferreteria.html", "TSG FERRETERIA")
print_case_structure("work_21-movement-reset.html", "21 MOVEMENT RESET")
print_case_structure("work_inzone.html", "INZONE")
print_case_structure("work_footy.html", "FOOTY")
