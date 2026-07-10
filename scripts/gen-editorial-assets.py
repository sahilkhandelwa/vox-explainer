#!/usr/bin/env python3
"""Generate gritty, editorial-style photo assets for Vox-style explainer."""
import os, random, math, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = "/root/vox-explainer"
OUT_BG = f"{ROOT}/public/assets-editorial/background"
OUT_MID = f"{ROOT}/public/assets-editorial/midground"
OUT_FG = f"{ROOT}/public/assets-editorial/foreground"
for d in [OUT_BG, OUT_MID, OUT_FG]:
    os.makedirs(d, exist_ok=True)

W, H = 1920, 1080

def try_font(size, name="Georgia"):
    for p in [f"/usr/share/fonts/truetype/msttcorefonts/{name}.ttf",
              f"/usr/share/fonts/truetype/{name.lower()}/{name}.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

FONT_LG = try_font(280)
FONT_MD = try_font(60)
FONT_SM = try_font(32)

# ── PAPER TEXTURE ──────────────────────────────────────────────
print("Generating paper texture...")
bg = Image.new("RGB", (W, H), (239, 230, 210))
draw = ImageDraw.Draw(bg)
for _ in range(800):
    x, y = int(random.random()*W), int(random.random()*H)
    draw.line([(x, y), (x+int(random.random()*60), y+int(random.random()*8))],
              fill=(190+int(random.random()*40), 175+int(random.random()*40), 142+int(random.random()*40)), width=1)
vign = Image.new("RGB", (W, H), (0,0,0))
vdraw = ImageDraw.Draw(vign)
vdraw.rectangle([(0,0),(W,H)], fill=(80,50,20))
vign = vign.filter(ImageFilter.GaussianBlur(radius=500))
bg = Image.blend(bg, vign, 0.20)
bg.save(f"{OUT_BG}/paper-texture.png", "PNG")
# Grain overlay
noise = Image.new("RGBA", (W, H), (0,0,0,0))
for _ in range(5000):
    x, y = int(random.random()*W), int(random.random()*H)
    noise.putpixel((x, y), (0,0,0,int(random.random()*30)))
noise = noise.filter(ImageFilter.GaussianBlur(radius=0.8))
noise.save(f"{OUT_BG}/grain-overlay.png", "PNG")
print("  paper + grain done")

# ── TRUMP CUTOUT ───────────────────────────────────────────────
print("Generating Trump cutout...")
trump = Image.new("RGBA", (600, 800), (0,0,0,0))
td = ImageDraw.Draw(trump)
td.ellipse([(200, 50), (400, 300)], fill=(240, 220, 190))
td.ellipse([(175, 100), (225, 180)], fill=(240, 220, 190))
td.ellipse([(375, 100), (425, 180)], fill=(240, 220, 190))
td.ellipse([(195, 30), (405, 120)], fill=(210, 185, 140))
td.ellipse([(180, 45), (220, 95)], fill=(210, 185, 140))
td.ellipse([(255, 170), (285, 200)], fill=(80, 70, 60))
td.ellipse([(315, 170), (345, 200)], fill=(80, 70, 60))
td.ellipse([(290, 200), (310, 250)], fill=(210, 190, 165))
td.line([(260, 270), (340, 270)], fill=(180, 100, 100), width=4)
td.line([(250, 155), (290, 160)], fill=(80, 70, 60), width=5)
td.line([(310, 160), (350, 155)], fill=(80, 70, 60), width=5)
suit = [(250,300),(350,300),(420,500),(460,700),(400,750),(350,700),(300,700),(250,750),(190,700),(230,500)]
td.polygon(suit, fill=(30,30,30))
td.polygon([(290,320),(310,320),(305,480),(300,500),(295,480)], fill=(180,20,20))
_, _, _, a = trump.split()
trump_bw = trump.convert("L").point(lambda x: 0 if x < 140 else 255)
for _ in range(2000):
    x, y = int(random.random()*600), int(random.random()*800)
    if a.getpixel((x, y)) > 0:
        trump_bw.putpixel((x, y), min(255, trump_bw.getpixel((x, y)) + int(random.random()*60)))
trump_rgba = Image.merge("RGBA", (trump_bw, trump_bw, trump_bw, a))
trump_rgba.save(f"{OUT_MID}/trump-cutout.png", "PNG")
print("  trump done")

# ── KHAMENEI CUTOUT ────────────────────────────────────────────
print("Generating Khamenei cutout...")
kham = Image.new("RGBA", (500, 700), (0,0,0,0))
kd = ImageDraw.Draw(kham)
kd.ellipse([(150, 80), (350, 400)], fill=(220,200,180))
kd.ellipse([(150, 280), (350, 500)], fill=(100,100,100))
kd.ellipse([(130, 20), (370, 100)], fill=(30,30,30))
kd.ellipse([(165, 60), (335, 90)], fill=(220,200,180))
kd.ellipse([(210, 190), (240, 220)], fill=(60,50,40))
kd.ellipse([(260, 190), (290, 220)], fill=(60,50,40))
kd.ellipse([(235, 230), (265, 290)], fill=(190,170,150))
kd.ellipse([(190, 170), (260, 250)], fill=None, outline=(50,50,50), width=4)
kd.ellipse([(240, 170), (310, 250)], fill=None, outline=(50,50,50), width=4)
kd.line([(260, 200), (240, 200)], fill=(50,50,50), width=4)
kd.polygon([(170,400),(330,400),(380,650),(300,700),(250,670),(200,700),(120,650)], fill=(30,30,30))
_, _, _, a2 = kham.split()
kham_bw = kham.convert("L").point(lambda x: 0 if x < 130 else 255)
kham_rgba = Image.merge("RGBA", (kham_bw, kham_bw, kham_bw, a2))
kham_rgba.save(f"{OUT_MID}/khamenei-cutout.png", "PNG")
print("  khamenei done")

# ── WHITE HOUSE ─────────────────────────────────────────────────
print("Generating White House...")
wh = Image.new("RGB", (W, H), (239, 230, 210))
wd = ImageDraw.Draw(wh)
wd.rectangle([(700, 500), (1220, 800)], fill=(200,195,185))
wd.rectangle([(860, 450), (1060, 800)], fill=(210,205,195))
for x in range(870, 1060, 38):
    wd.rectangle([(x, 480), (x+18, 780)], fill=(180,175,165))
wd.polygon([(820, 450), (960, 350), (1100, 450)], fill=(200,195,185))
wd.polygon([(830, 450), (960, 360), (1090, 450)], fill=(190,185,175))
for x in range(710, 1220, 50):
    wd.rectangle([(x, 520), (x+20, 790)], fill=(190,185,175))
for x in range(730, 1200, 60):
    for y in [550, 650]:
        wd.rectangle([(x, y), (x+30, y+45)], fill=(100,120,140))
wd.rectangle([(680, 470), (1240, 500)], fill=(180,175,165))
wd.rectangle([(550, 550), (700, 800)], fill=(195,190,180))
wd.rectangle([(1220, 550), (1370, 800)], fill=(195,190,180))
wh_gray = wh.convert("L").point(lambda x: 0 if x < 160 else 255)
wh_rgba = Image.merge("RGBA", (wh_gray, wh_gray, wh_gray, wh_gray))
wh_rgba.save(f"{OUT_FG}/white-house-photo.png", "PNG")
print("  white house done")

# ── CAPITOL ─────────────────────────────────────────────────────
print("Generating Capitol...")
cap = Image.new("RGB", (W, H), (239, 230, 210))
cd = ImageDraw.Draw(cap)
cd.ellipse([(700, 300), (1220, 700)], fill=(200,195,185))
cd.ellipse([(780, 350), (1140, 550)], fill=(190,185,175))
cd.ellipse([(840, 380), (1080, 480)], fill=(180,175,165))
cd.rectangle([(920, 200), (1000, 350)], fill=(180,175,165))
cd.polygon([(920, 200), (960, 140), (1000, 200)], fill=(180,175,165))
cd.rectangle([(550, 550), (1370, 800)], fill=(200,195,185))
for x in range(570, 1360, 40):
    cd.rectangle([(x, 580), (x+15, 790)], fill=(180,175,165))
for i in range(5):
    cd.rectangle([(550-i*25, 800+i*15), (1370+i*25, 815+i*15)], fill=(170+i*8, 165+i*8, 155+i*8))
cd.rectangle([(200, 600), (550, 780)], fill=(195,190,180))
cd.rectangle([(1370, 600), (1720, 780)], fill=(195,190,180))
for x in range(220, 540, 30):
    cd.rectangle([(x, 630), (x+12, 770)], fill=(180,175,165))
for x in range(1380, 1700, 30):
    cd.rectangle([(x, 630), (x+12, 770)], fill=(180,175,165))
cap_gray = cap.convert("L").point(lambda x: 0 if x < 170 else 255)
cap_rgba = Image.merge("RGBA", (cap_gray, cap_gray, cap_gray, cap_gray))
cap_rgba.save(f"{OUT_FG}/capitol-photo.png", "PNG")
print("  capitol done")

# ── OIL TANKER ──────────────────────────────────────────────────
print("Generating oil tanker...")
tanker = Image.new("RGB", (W, 400), (239, 230, 210))
tkd = ImageDraw.Draw(tanker)
tkd.rectangle([(100, 120), (1820, 260)], fill=(40,40,40))
tkd.rectangle([(100, 100), (1820, 120)], fill=(60,60,60))
tkd.polygon([(100, 120), (40, 200), (60, 240), (100, 260)], fill=(40,40,40))
tkd.rectangle([(300, 30), (750, 100)], fill=(50,50,50))
tkd.rectangle([(380, 0), (500, 30)], fill=(50,50,50))
tkd.rectangle([(1500, 50), (1780, 100)], fill=(50,50,50))
for x in [400, 440, 480]:
    tkd.rectangle([(x, 55), (x+20, 80)], fill=(180,200,220))
for x in range(800, 1500, 70):
    tkd.rectangle([(x, 95), (x+50, 115)], fill=(70,70,70))
tkd.rectangle([(0, 240), (1920, 400)], fill=(239,230,210))
tkd.rectangle([(450, -40), (480, 0)], fill=(50,50,50))
for _ in range(30):
    sx, sy = 460+int(random.random()*80-40), -60-int(random.random()*80)
    sr = 10+int(random.random()*30)
    tkd.ellipse([(sx-sr, sy-sr), (sx+sr, sy+sr)], fill=(180,180,180))
tanker_gray = tanker.convert("L").point(lambda x: 0 if x < 180 else 255)
tanker_rgba = Image.merge("RGBA", (tanker_gray, tanker_gray, tanker_gray, tanker_gray))
tanker_rgba.save(f"{OUT_FG}/tanker-photo.png", "PNG")
print("  tanker done")

# ── FALLING EAGLE ───────────────────────────────────────────────
print("Generating falling eagle...")
eagle = Image.new("RGB", (W, H), (239, 230, 210))
ed = ImageDraw.Draw(eagle)
ed.ellipse([(830, 380), (1090, 650)], fill=(30,30,30))
ed.ellipse([(890, 310), (1030, 420)], fill=(30,30,30))
ed.polygon([(985, 330), (1100, 340), (1000, 370)], fill=(220,180,40))
ed.polygon([(980, 370), (1080, 360), (1000, 380)], fill=(200,160,20))
ed.ellipse([(940, 340), (970, 365)], fill=(255,255,200))
ed.ellipse([(950, 348), (962, 360)], fill=(20,20,20))
wing_l = [(830,420),(580,330),(450,280),(420,300),(500,380),(620,470),(780,480)]
ed.polygon(wing_l, fill=(30,30,30))
for i in range(5):
    fx, fy = 500+i*50, 320+i*30
    ed.line([(fx, fy), (fx-60, fy+40)], fill=(50,50,50), width=3)
wing_r = [(1090,420),(1340,330),(1470,280),(1500,300),(1420,380),(1300,470),(1140,480)]
ed.polygon(wing_r, fill=(30,30,30))
ed.polygon([(890,620),(1030,630),(980,740),(920,730)], fill=(30,30,30))
ed.line([(860,640),(840,680)], fill=(200,180,40), width=5)
ed.line([(880,645),(870,685)], fill=(200,180,40), width=5)
ed.line([(1040,640),(1060,680)], fill=(200,180,40), width=5)
ed.line([(1020,645),(1030,685)], fill=(200,180,40), width=5)
eagle_gray = eagle.convert("L")
for _ in range(3000):
    x, y = int(random.random()*W), int(random.random()*H)
    p = eagle_gray.getpixel((x, y))
    if p < 200:
        eagle_gray.putpixel((x, y), max(0, p - int(random.random()*40)))
    else:
        eagle_gray.putpixel((x, y), min(255, p + int(random.random()*30)))
eagle_bw = eagle_gray.point(lambda x: 0 if x < 150 else 255)
eagle_a = Image.new("L", (W, H), 255)
eagle_rgba = Image.merge("RGBA", (eagle_bw, eagle_bw, eagle_bw, eagle_a))
eagle_rgba.save(f"{OUT_FG}/eagle-photo.png", "PNG")
print("  eagle done")

# ── GLOBE ────────────────────────────────────────────────────────
print("Generating globe...")
globe = Image.new("RGB", (W, H), (239, 230, 210))
gd = ImageDraw.Draw(globe)
gd.ellipse([(560, 240), (1360, 840)], fill=(80,130,170), outline=(30,30,30), width=3)
for r in range(200, 0, -20):
    gd.ellipse([(960-r, 540-r), (960+r, 540+r)], fill=None, outline=(60,100,140), width=2)
continents = [
    [(700,420),(750,380),(820,390),(840,460),(800,550),(760,570),(730,530),(690,480)],
    [(1000,420),(1060,390),(1120,420),(1140,500),(1100,680),(1060,710),(1030,670),(980,580)],
    [(1160,420),(1280,430),(1340,500),(1320,630),(1260,690),(1180,670),(1140,570)],
]
for cont in continents:
    gd.polygon(cont, fill=(40,80,110), outline=(30,30,30), width=2)
for i in range(1, 4):
    gd.ellipse([(560+i*100, 280+i*60), (1360-i*100, 700+i*60)], fill=None, outline=(100,150,190), width=1)
gd.text((1380, 250), "$", fill=(210,43,43), font=try_font(280))
gd.line([(1330, 320), (1420, 275)], fill=(210,43,43), width=6)
gd.polygon([(1420, 275), (1400, 290), (1430, 295)], fill=(210,43,43))
globe_gray = globe.convert("L").point(lambda x: 0 if x < 160 else 255)
globe_rgba = Image.merge("RGBA", (globe_gray, globe_gray, globe_gray, Image.new("L", (W, H), 255)))
globe_rgba.save(f"{OUT_FG}/globe-photo.png", "PNG")
print("  globe done")

# ── STRAIT MAP ───────────────────────────────────────────────────
print("Generating strait map...")
strait = Image.new("RGB", (W, H), (239, 230, 210))
sd = ImageDraw.Draw(strait)
sd.rectangle([(0, 380), (1920, 1080)], fill=(220,215,200))
iran = [(0,380),(300,480),(550,460),(900,500),(1150,470),(1400,520),(1700,490),(1920,550),(1920,380)]
sd.polygon(iran, fill=(160,155,140), outline=(30,30,30), width=2)
arabia = [(0,1080),(200,920),(500,870),(800,920),(1000,820),(1500,800),(1800,850),(1920,900),(1920,1080)]
sd.polygon(arabia, fill=(180,175,160), outline=(30,30,30), width=2)
sd.line([(800, 490), (1050, 520)], fill=(210,43,43), width=6)
sd.text((870, 470), "HORMUZ", fill=(210,43,43), font=try_font(28))
sd.text((200, 420), "IRAN", fill=(30,30,30), font=try_font(36))
sd.text((200, 840), "ARABIA", fill=(30,30,30), font=try_font(36))
sd.polygon([(950, 450), (970, 410), (990, 450)], fill=(210,43,43))
sd.ellipse([(1650, 780), (1750, 880)], fill=None, outline=(30,30,30), width=2)
sd.polygon([(1700, 785), (1695, 810), (1705, 810)], fill=(210,43,43))
sd.polygon([(1700, 875), (1695, 850), (1705, 850)], fill=(30,30,30))
strait_gray = strait.convert("L").point(lambda x: 0 if x < 175 else 255)
strait_rgba = Image.merge("RGBA", (strait_gray, strait_gray, strait_gray, Image.new("L", (W, H), 255)))
strait_rgba.save(f"{OUT_FG}/strait-map.png", "PNG")
print("  strait map done")

# ── SCALE BALANCE ───────────────────────────────────────────────
print("Generating scale balance...")
scale = Image.new("RGB", (W, H), (239, 230, 210))
sdd = ImageDraw.Draw(scale)
sdd.rectangle([(920, 300), (1000, 800)], fill=(30,30,30))
sdd.rectangle([(800, 780), (1120, 820)], fill=(30,30,30))
sdd.line([(350, 350), (1570, 280)], fill=(50,50,50), width=10)
sdd.polygon([(250, 420), (450, 420), (350, 540)], fill=(210,43,43), outline=(30,30,30), width=3)
sdd.text((350, 580), "DEBT", fill=(210,43,43), font=try_font(48), anchor="mt")
sdd.text((350, 640), "$39T", fill=(30,30,30), font=try_font(40), anchor="mt")
sdd.polygon([(1470, 350), (1670, 350), (1570, 470)], fill=(30,30,30), outline=(30,30,30), width=3)
sdd.text((1570, 510), "GDP", fill=(30,30,30), font=try_font(48), anchor="mt")
sdd.text((1570, 570), "$28T", fill=(30,30,30), font=try_font(40), anchor="mt")
for cx, cy in [(300, 350), (400, 350), (1500, 280), (1640, 280)]:
    sdd.line([(cx, cy), (cx, cy+70)], fill=(100,100,100), width=3)
scale_gray = scale.convert("L").point(lambda x: 0 if x < 170 else 255)
scale_rgba = Image.merge("RGBA", (scale_gray, scale_gray, scale_gray, Image.new("L", (W, H), 255)))
scale_rgba.save(f"{OUT_FG}/scale-photo.png", "PNG")
print("  scale done")

# ── CHARTS ─────────────────────────────────────────────────────
print("Generating charts...")
def make_chart():
    return Image.new("RGB", (W, H), (239, 230, 210))

# Inflation
inf = make_chart()
id_ = ImageDraw.Draw(inf)
for y in range(200, 1000, 100):
    id_.line([(150, y), (1770, y)], fill=(210,200,180), width=1)
data = [(0,2.4),(1,1.8),(2,1.2),(3,4.7),(4,8.0),(5,3.4),(6,2.9),(7,3.1),(8,4.2)]
xs = lambda i: 150 + int(i * (1620/(len(data)-1)))
ys = lambda v: 950 - int(v * (750/14))
pts = [(xs(i), ys(v)) for i, v in data]
for i in range(len(pts)-1):
    id_.polygon([pts[i], pts[i+1], (pts[i+1][0], 950), (pts[i][0], 950)], fill=(210,43,43))
    id_.line([pts[i], pts[i+1]], fill=(210,43,43), width=4)
for p in pts:
    id_.ellipse([(p[0]-7, p[1]-7), (p[0]+7, p[1]+7)], fill=(210,43,43), outline=(30,30,30), width=2)
id_.text((150, 140), "INFLATION (CPI %)", fill=(30,30,30), font=try_font(36))
id_.text((pts[4][0]-60, pts[4][1]-50), "8.0%", fill=(210,43,43), font=try_font(28))
inf.save(f"{OUT_FG}/inflation-chart.png", "PNG")

# Oil
oil = make_chart()
od = ImageDraw.Draw(oil)
oil_data = [(0,60),(1,62),(2,65),(3,68),(4,72),(5,85),(6,95),(7,108),(8,116),(9,112),(10,105)]
xo = lambda i: 150 + int(i * (1620/(len(oil_data)-1)))
yo = lambda v: 950 - int(v * (750/140))
oil_pts = [(xo(i), yo(v)) for i, v in oil_data]
for i in range(len(oil_pts)-1):
    od.line([oil_pts[i], oil_pts[i+1]], fill=(30,30,30), width=4)
for p in oil_pts:
    od.ellipse([(p[0]-6, p[1]-6), (p[0]+6, p[1]+6)], fill=(210,43,43), outline=(30,30,30), width=2)
od.text((oil_pts[8][0]-50, oil_pts[8][1]-50), "$116", fill=(210,43,43), font=try_font(28))
od.text((150, 140), "OIL PRICE ($/bbl)", fill=(30,30,30), font=try_font(36))
oil.save(f"{OUT_FG}/oil-chart.png", "PNG")

# Comparison bars
comp = make_chart()
cd = ImageDraw.Draw(comp)
cd.rectangle([(300, 400), (800, 850)], fill=(30,30,30), outline=(30,30,30), width=3)
cd.text((550, 870), "MILITARY", fill=(30,30,30), font=try_font(28), anchor="mt")
cd.text((550, 500), "$880B", fill=(255,255,255), font=try_font(42), anchor="mm")
cd.rectangle([(1120, 200), (1620, 850)], fill=(210,43,43), outline=(30,30,30), width=3)
cd.text((1370, 870), "DEBT INTEREST", fill=(30,30,30), font=try_font(28), anchor="mt")
cd.text((1370, 450), "$1.2T", fill=(255,255,255), font=try_font(42), anchor="mm")
cd.text((960, 120), "ANNUAL FEDERAL SPENDING", fill=(30,30,30), font=try_font(34), anchor="mt")
comp.save(f"{OUT_FG}/comparison-chart.png", "PNG")

# Debt ticker
tick = make_chart()
td_ = ImageDraw.Draw(tick)
td_.text((960, 420), "$39T", fill=(210,43,43), font=try_font(300), anchor="mm")
td_.text((960, 680), "NATIONAL DEBT", fill=(30,30,30), font=try_font(56), anchor="mm")
td_.text((960, 740), "(and rising)", fill=(100,100,100), font=try_font(32), anchor="mm")
tick.save(f"{OUT_FG}/debt-ticker.png", "PNG")

# US map
us = make_chart()
ud = ImageDraw.Draw(us)
us_shape = [(620,380),(700,350),(800,360),(900,340),(1000,350),(1100,380),(1200,410),(1260,450),
            (1230,510),(1160,540),(1110,570),(1060,550),(1010,610),(970,570),(910,550),
            (860,530),(760,550),(690,520),(630,490),(570,470),(550,430),(580,400)]
ud.polygon(us_shape, fill=(30,30,30), outline=(30,30,30), width=2)
ud.polygon([(1110,570),(1160,640),(1130,650),(1080,610)], fill=(30,30,30))
ud.polygon([(760,550),(790,610),(890,620),(860,570)], fill=(30,30,30))
ud.text((960, 920), "UNITED STATES", fill=(30,30,30), font=try_font(36), anchor="mm")
us.save(f"{OUT_FG}/us-map.png", "PNG")
print("  charts done")

print("\n== ALL EDITORIAL ASSETS GENERATED ==")
