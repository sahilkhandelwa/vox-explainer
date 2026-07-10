#!/usr/bin/env python3
"""Download real photographic assets and process into high-contrast B&W ink cutouts."""
import os, sys, shutil, subprocess, tempfile, random
from PIL import Image, ImageFilter, ImageOps, ImageEnhance

ROOT = "/root/vox-explainer"
OUT_BG = f"{ROOT}/public/assets-editorial/background"
OUT_MID = f"{ROOT}/public/assets-editorial/midground"
OUT_FG = f"{ROOT}/public/assets-editorial/foreground"
for d in [OUT_BG, OUT_MID, OUT_FG]:
    os.makedirs(d, exist_ok=True)

W, H = 1920, 1080
UA = "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def dl(url, path, force=False):
    if not force and os.path.exists(path) and os.path.getsize(path) > 10000:
        print(f"  cached {path}")
        return True
    if os.path.exists(path):
        os.remove(path)
    print(f"  downloading {url[:80]}...")
    r = subprocess.run(["curl", "-sL", "-A", UA, "--max-time", "30", "-o", path, url], capture_output=True)
    if r.returncode != 0 or not os.path.exists(path) or os.path.getsize(path) < 5000:
        print(f"  FAILED (got {os.path.getsize(path) if os.path.exists(path) else 0} bytes)")
        return False
    print(f"  got {os.path.getsize(path)} bytes")
    return True

def make_cutout(img_path, out_path, mode="subject", contrast=2.0):
    """Convert a photo to high-contrast B&W cutout with transparent background.
    
    mode: "subject" = isolate central subject from background (portraits)
          "skyline" = keep dark structures, remove sky (buildings)
          "invert" = keep bright subject on dark bg
    """
    im = Image.open(img_path).convert("RGB")
    if max(im.size) > 1400:
        im.thumbnail((1400, 1400), Image.LANCZOS)
    gray = im.convert("L")
    w, h = gray.size
    
    # ── Background removal ──────────────────────────────────────
    if mode == "subject":
        # Edge-aware background removal: find background color from corners
        corners = []
        for cx, cy in [(0,0), (w-1,0), (0,h-1), (w-1,h-1)]:
            for dx in range(-10, 11):
                for dy in range(-10, 11):
                    px, py = min(w-1, max(0, cx+dx)), min(h-1, max(0, cy+dy))
                    corners.append(gray.getpixel((px, py)))
        bg_val = sum(corners) // len(corners)
        # Create alpha mask - pixels far from bg_val are subject
        alpha = gray.point(lambda x: 255 if abs(x - bg_val) > 40 else 0, mode="L")
        # Clean up with morphology
        alpha = alpha.filter(ImageFilter.MaxFilter(5))
        alpha = alpha.filter(ImageFilter.MedianFilter(7))
        # Fill holes
        inv_alpha = alpha.point(lambda x: 255 - x, mode="L")
        # Flood fill from edges to fill background holes
        ImageDraw_floodfill(inv_alpha, (0, 0), 0, thresh=50)
        alpha = inv_alpha.point(lambda x: 255 - x, mode="L")
    elif mode == "invert":
        # Keep bright regions
        alpha = gray.point(lambda x: 255 if x > 100 else 0, mode="L")
        alpha = alpha.filter(ImageFilter.MaxFilter(3))
    else:  # "skyline" — keep dark structures
        alpha = gray.point(lambda x: 255 if x < 200 else 0, mode="L")
        alpha = alpha.filter(ImageFilter.MaxFilter(3))
        alpha = alpha.filter(ImageFilter.MedianFilter(5))
    
    # Feather alpha edges for soft cutout
    alpha = alpha.filter(ImageFilter.SMOOTH)
    
    # ── High contrast photographic tone (not pure threshold) ────
    enhancer = ImageEnhance.Contrast(gray)
    gray_high = enhancer.enhance(contrast)
    # Apply slight curve: crush shadows, lift highlights
    gray_high = gray_high.point(lambda x: min(255, max(0, 
        int((x / 255) ** 0.85 * 255)  # slight gamma
    )), mode="L")
    
    # Add photographic grain
    grain = Image.effect_noise((w, h), 15).convert("L")
    gray_grain = Image.blend(gray_high, grain, 0.08)
    
    # Composite with alpha
    result = Image.merge("RGBA", (gray_grain, gray_grain, gray_grain, alpha))
    result.save(out_path, "PNG")
    sz = os.path.getsize(out_path)
    print(f"  cutout ({sz/1024:.0f}KB) -> {out_path}")
    return sz

def ImageDraw_floodfill(im, xy, value, thresh=0):
    """Flood fill for PIL images."""
    from PIL import ImageDraw
    ImageDraw.floodfill(im, xy, value, thresh=thresh)

print("=== DOWNLOADING REAL PHOTO ASSETS ===\n")

# ── 1. TRUMP ─────────────────────────────────────────────────────
trump_src = "/tmp/trump_photo.jpg"
dl("https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/1280px-Donald_Trump_official_portrait.jpg", trump_src)
make_cutout(trump_src, f"{OUT_MID}/trump-cutout.png", mode="subject")

# ── 2. KHAMENEI ──────────────────────────────────────────────────
kham_src = "/tmp/khamenei_photo.jpg"
urls = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Ali_Khamenei_2024.jpg/1280px-Ali_Khamenei_2024.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Ali_Khamenei_%28cropped%29.jpg/1280px-Ali_Khamenei_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Ali_Khamenei_-_March_2019_%28cropped%29.jpg/1280px-Ali_Khamenei_-_March_2019_%28cropped%29.jpg",
]
for u in urls:
    if dl(u, kham_src, force=True):
        break
make_cutout(kham_src, f"{OUT_MID}/khamenei-cutout.png", mode="subject")

# ── 3. WHITE HOUSE ───────────────────────────────────────────────
wh_src = "/tmp/whitehouse_photo.jpg"
dl("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/White_House_west_side_2015.jpg/1280px-White_House_west_side_2015.jpg", wh_src)
make_cutout(wh_src, f"{OUT_FG}/white-house-photo.png", mode="skyline")

# ── 4. CAPITOL ───────────────────────────────────────────────────
cap_src = "/tmp/capitol_photo.jpg"
dl("https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/United_States_Capitol_-_aerial_view.jpg/1280px-United_States_Capitol_-_aerial_view.jpg", cap_src)
make_cutout(cap_src, f"{OUT_FG}/capitol-photo.png", mode="skyline")

# ── 5. OIL TANKER ────────────────────────────────────────────────
tanker_src = "/tmp/tanker_photo.jpg"
dl("https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Oil_tanker_MT_%27Navig8_Ace%27.jpg/1280px-Oil_tanker_MT_%27Navig8_Ace%27.jpg", tanker_src)
make_cutout(tanker_src, f"{OUT_FG}/tanker-photo.png", mode="skyline")

# ── 6. BALD EAGLE ───────────────────────────────────────────────
eagle_src = "/tmp/eagle_photo.jpg"
dl("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bald_Eagle_%28Haliaeetus_leucocephalus%29_in_flight_%284%29.jpg/1280px-Bald_Eagle_%28Haliaeetus_leucocephalus%29_in_flight_%284%29.jpg", eagle_src)
make_cutout(eagle_src, f"{OUT_FG}/eagle-photo.png", mode="invert")

# ── 7. GLOBE ─────────────────────────────────────────────────────
globe_src = "/tmp/globe_photo.jpg"
dl("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Globe_icon_%28black_and_white%29.jpg/1280px-Globe_icon_%28black_and_white%29.jpg", globe_src)
make_cutout(globe_src, f"{OUT_FG}/globe-photo.png", mode="skyline")

print("\n=== PROCESSING COMPLETE ===")
