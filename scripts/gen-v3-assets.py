#!/usr/bin/env python3
"""Download real photos and create transparent PNGs preserving original colors."""
import os, subprocess, time, math
from PIL import Image, ImageFilter

ROOT = "/root/vox-explainer"
OUT_FG = f"{ROOT}/public/assets-editorial/foreground"
OUT_MID = f"{ROOT}/public/assets-editorial/midground"
os.makedirs(OUT_FG, exist_ok=True)
os.makedirs(OUT_MID, exist_ok=True)

UA = "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36"

def dl(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 20000:
        return True
    subprocess.run(["curl", "-sL", "-A", UA, "--max-time", "60", "-o", path, url], check=False)
    return os.path.exists(path) and os.path.getsize(path) > 5000

def remove_bg(src, dst, patch_size=40, color_tol=50, smooth_edges=True):
    """Remove background while preserving original subject colors.
    Samples only from corner patches to avoid subject contamination.
    """
    im = Image.open(src).convert("RGBA")
    if max(im.size) > 1400:
        im.thumbnail((1400, 1400), Image.LANCZOS)
    pixels = im.load()
    w, h = im.size

    # Sample only from corner patches
    bg_samples = []
    corners = [(0, 0), (w-patch_size, 0), (0, h-patch_size), (w-patch_size, h-patch_size)]
    for cx, cy in corners:
        for x in range(cx, min(cx+patch_size, w)):
            for y in range(cy, min(cy+patch_size, h)):
                bg_samples.append(pixels[x, y][:3])

    # Compute average background color
    r_avg = sum(s[0] for s in bg_samples) // len(bg_samples)
    g_avg = sum(s[1] for s in bg_samples) // len(bg_samples)
    b_avg = sum(s[2] for s in bg_samples) // len(bg_samples)

    # Compute adaptive threshold
    max_dist = max(math.sqrt((s[0]-r_avg)**2 + (s[1]-g_avg)**2 + (s[2]-b_avg)**2) for s in bg_samples)
    threshold = max(max_dist * 2.0, color_tol)

    print(f"    bg=({r_avg},{g_avg},{b_avg}) threshold={threshold:.0f}")

    # Create alpha mask
    alpha = Image.new("L", (w, h), 0)
    alpha_px = alpha.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 128:
                alpha_px[x, y] = 0
                continue
            d = math.sqrt((r-r_avg)**2 + (g-g_avg)**2 + (b-b_avg)**2)
            alpha_px[x, y] = 255 if d > threshold else 0

    # Clean up mask
    alpha = alpha.filter(ImageFilter.MedianFilter(5))
    alpha = alpha.filter(ImageFilter.MaxFilter(5))
    if smooth_edges:
        alpha = alpha.filter(ImageFilter.SMOOTH_MORE)

    # Composite: keep original RGB, use new alpha
    r_ch, g_ch, b_ch, _ = im.split()
    result = Image.merge("RGBA", (r_ch, g_ch, b_ch, alpha))
    result.save(dst, "PNG")
    opaque = sum(1 for y in range(0, h, 10) for x in range(0, w, 10) if alpha.getpixel((x, y)) > 128)
    total = (w//10) * (h//10)
    print(f"    -> {os.path.getsize(dst)//1024}KB ({opaque*100//total}% opaque)")

# ── Asset manifests ─────────────────────────────────────────────
# (name, url, output_dir, filename, bg_removal_mode)
# mode: "auto" = sample edges, "skyline" = remove light sky, "dark" = remove dark bg
ASSETS = [
    # Midground - people
    ("trump", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/1280px-Donald_Trump_official_portrait.jpg",
     OUT_MID, "trump-cutout.png"),
    ("khamenei", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Ali_Khamenei_Nowruz_message_official_portrait_1397_02_%283_x_4_cropped%29.jpg/1280px-Ali_Khamenei_Nowruz_message_official_portrait_1397_02_%283_x_4_cropped%29.jpg",
     OUT_MID, "khamenei-cutout.png"),
    # Foreground - buildings
    ("wh", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/White_House_north_and_south_sides.jpg/1280px-White_House_north_and_south_sides.jpg",
     OUT_FG, "white-house-photo.png"),
    ("cap", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Capitol_Building_Full_View.jpg/1280px-Capitol_Building_Full_View.jpg",
     OUT_FG, "capitol-photo.png"),
    # Foreground - objects
    ("tanker", "https://upload.wikimedia.org/wikipedia/commons/7/75/Supertanker_AbQaiq.jpg",
     OUT_FG, "tanker-photo.png"),
    ("eagle", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg/1280px-Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg",
     OUT_FG, "eagle-photo.png"),
]

print("=== DOWNLOADING & PROCESSING TRANSPARENT PNGs ===\n")
for name, url, outdir, outname in ASSETS:
    print(f"{name}:")
    tmp = f"/tmp/v3_{name}.jpg"
    if dl(url, tmp):
        remove_bg(tmp, f"{outdir}/{outname}")
    else:
        print(f"    FAILED to download")
    time.sleep(0.5)

print("\n=== Generating photorealistic charts/maps ===")
# For charts and maps, create photographic-style images with paper texture bg
# then remove the background
from PIL import ImageDraw, ImageFont

def try_font(size):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"]:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

# Inflation chart - photo of a real chart on paper
chart = Image.new("RGB", (1920, 1080), (239, 230, 210))
cd = ImageDraw.Draw(chart)
for y in range(200, 1000, 100):
    cd.line([(150, y), (1770, y)], fill=(210, 200, 180), width=1)
data = [(0,2.4),(1,1.8),(2,1.2),(3,4.7),(4,8.0),(5,3.4),(6,2.9),(7,3.1),(8,4.2)]
xs = lambda i: 150 + int(i * 1620/(len(data)-1))
ys = lambda v: 950 - int(v * 750/14)
pts = [(xs(i), ys(v)) for i, v in data]
for i in range(len(pts)-1):
    cd.line([pts[i], pts[i+1]], fill=(210,43,43), width=5)
    cd.polygon([pts[i], pts[i+1], (pts[i+1][0], 950), (pts[i][0], 950)], fill=(210,43,43))
for p in pts:
    cd.ellipse([(p[0]-7, p[1]-7), (p[0]+7, p[1]+7)], fill=(210,43,43), outline=(30,30,30), width=2)
chart.save(f"{OUT_FG}/inflation-chart.png", "PNG")
print("  inflation-chart.png")

# Oil price chart
oil = Image.new("RGB", (1920, 1080), (239, 230, 210))
od = ImageDraw.Draw(oil)
oil_data = [(0,60),(1,62),(2,65),(3,68),(4,72),(5,85),(6,95),(7,108),(8,116),(9,112),(10,105)]
xo = lambda i: 150 + int(i * 1620/(len(oil_data)-1))
yo = lambda v: 950 - int(v * 750/140)
oil_pts = [(xo(i), yo(v)) for i, v in oil_data]
for i in range(len(oil_pts)-1):
    od.line([oil_pts[i], oil_pts[i+1]], fill=(30,30,30), width=4)
for p in oil_pts:
    od.ellipse([(p[0]-6, p[1]-6), (p[0]+6, p[1]+6)], fill=(210,43,43), outline=(30,30,30), width=2)
od.text((oil_pts[8][0]-50, oil_pts[8][1]-50), "$116", fill=(210,43,43), font=try_font(28))
oil.save(f"{OUT_FG}/oil-chart.png", "PNG")
print("  oil-chart.png")

# Scale balance
scale = Image.new("RGB", (1920, 1080), (239, 230, 210))
sdd = ImageDraw.Draw(scale)
sdd.rectangle([(920, 300), (1000, 800)], fill=(30,30,30))
sdd.line([(350, 350), (1570, 280)], fill=(50,50,50), width=10)
sdd.polygon([(250, 420), (450, 420), (350, 540)], fill=(210,43,43), outline=(30,30,30), width=3)
sdd.polygon([(1470, 350), (1670, 350), (1570, 470)], fill=(30,30,30), outline=(30,30,30), width=3)
scale.save(f"{OUT_FG}/scale-photo.png", "PNG")
print("  scale-photo.png")

# Globe
globe = Image.new("RGB", (1920, 1080), (239, 230, 210))
gd = ImageDraw.Draw(globe)
gd.ellipse([(560, 240), (1360, 840)], fill=(80,130,170), outline=(30,30,30), width=3)
continents = [
    [(700,420),(750,380),(820,390),(840,460),(800,550),(760,570),(730,530),(690,480)],
    [(1000,420),(1060,390),(1120,420),(1140,500),(1100,680),(1060,710),(1030,670),(980,580)],
    [(1160,420),(1280,430),(1340,500),(1320,630),(1260,690),(1180,670),(1140,570)],
]
for cont in continents:
    gd.polygon(cont, fill=(40,80,110), outline=(30,30,30), width=2)
gd.text((1380, 250), "$", fill=(210,43,43), font=try_font(280))
globe.save(f"{OUT_FG}/globe-photo.png", "PNG")
print("  globe-photo.png")

# Comparison chart
comp = Image.new("RGB", (1920, 1080), (239, 230, 210))
cd_ = ImageDraw.Draw(comp)
cd_.rectangle([(300, 400), (800, 850)], fill=(30,30,30))
cd_.text((550, 500), "$880B", fill=(255,255,255), font=try_font(42), anchor="mm")
cd_.rectangle([(1120, 200), (1620, 850)], fill=(210,43,43))
cd_.text((1370, 450), "$1.2T", fill=(255,255,255), font=try_font(42), anchor="mm")
comp.save(f"{OUT_FG}/comparison-chart.png", "PNG")
print("  comparison-chart.png")

# Strait map
strait = Image.new("RGB", (1920, 1080), (239, 230, 210))
sd = ImageDraw.Draw(strait)
sd.rectangle([(0, 380), (1920, 1080)], fill=(200,195,185))
iran = [(0,380),(300,480),(550,460),(900,500),(1150,470),(1400,520),(1700,490),(1920,550),(1920,380)]
sd.polygon(iran, fill=(160,155,140), outline=(30,30,30), width=2)
arabia = [(0,1080),(200,920),(500,870),(800,920),(1000,820),(1500,800),(1800,850),(1920,900),(1920,1080)]
sd.polygon(arabia, fill=(180,175,160), outline=(30,30,30), width=2)
sd.line([(800, 490), (1050, 520)], fill=(210,43,43), width=6)
strait.save(f"{OUT_FG}/strait-map.png", "PNG")
print("  strait-map.png")

# US Map
us = Image.new("RGB", (1920, 1080), (239, 230, 210))
ud = ImageDraw.Draw(us)
us_shape = [(620,380),(700,350),(800,360),(900,340),(1000,350),(1100,380),(1200,410),(1260,450),
            (1230,510),(1160,540),(1110,570),(1060,550),(1010,610),(970,570),(910,550),
            (860,530),(760,550),(690,520),(630,490),(570,470),(550,430),(580,400)]
ud.polygon(us_shape, fill=(30,30,30), outline=(30,30,30), width=2)
ud.polygon([(1110,570),(1160,640),(1130,650),(1080,610)], fill=(30,30,30))
ud.polygon([(760,550),(790,610),(890,620),(860,570)], fill=(30,30,30))
us.save(f"{OUT_FG}/us-map.png", "PNG")
print("  us-map.png")

# Debt ticker
tick = Image.new("RGB", (1920, 1080), (239, 230, 210))
td = ImageDraw.Draw(tick)
td.text((960, 420), "$39T", fill=(210,43,43), font=try_font(300), anchor="mm")
td.text((960, 680), "NATIONAL DEBT", fill=(30,30,30), font=try_font(56), anchor="mm")
tick.save(f"{OUT_FG}/debt-ticker.png", "PNG")
print("  debt-ticker.png")

print("\n=== DONE ===")
