#!/usr/bin/env python3
"""Generate production-quality SVG assets for Vox-style explainer."""
import os, math, random

OUT = "/root/vox-explainer/public/assets"
for d in ["background", "midground", "foreground"]:
    os.makedirs(f"{OUT}/{d}", exist_ok=True)

W, H = 1920, 1080

def svg_header(viewBox="0 0 1920 1080"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewBox}">\n<defs>\n'

def svg_footer():
    return "</defs>\n</svg>"

def paper_texture():
    """Warm paper with subtle grain pattern."""
    s = svg_header()
    s += '<filter id="noise">\n'
    s += '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise"/>\n'
    s += '<feColorMatrix type="matrix" values="0 0 0 0 0.94 0 0 0 0 0.90 0 0 0 0 0.82 0 0 0 0.15 0"/>\n'
    s += '</filter>\n'
    s += f'<rect width="{W}" height="{H}" fill="#efe6d2"/>\n'
    s += '<rect width="1920" height="1080" filter="url(#noise)" opacity="0.4"/>\n'
    # Vignette
    s += f'<radialGradient id="vig" cx="50%" cy="50%" r="70%">\n'
    s += '<stop offset="40%" stop-color="transparent"/>\n'
    s += '<stop offset="100%" stop-color="rgba(40,25,10,0.25)"/>\n'
    s += '</radialGradient>\n'
    s += f'<rect width="{W}" height="{H}" fill="url(#vig)"/>\n'
    s += svg_footer()
    return s

def halftone_mask():
    """Halftone dot pattern overlay."""
    s = svg_header()
    s += '<pattern id="dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">\n'
    s += '<circle cx="6" cy="6" r="2" fill="black" opacity="0.6"/>\n'
    s += '<circle cx="0" cy="0" r="1.5" fill="black" opacity="0.4"/>\n'
    s += '</pattern>\n'
    s += f'<rect width="{W}" height="{H}" fill="url(#dots)" opacity="0.3"/>\n'
    s += svg_footer()
    return s

def netflix_graphic():
    """Netflix 'N' logo mark + content spend number."""
    s = svg_header()
    # N shape
    s += '<g transform="translate(760,200)">\n'
    s += f'<rect x="0" y="0" width="400" height="500" rx="20" fill="#1a1a1a"/>\n'
    # Diagonal N
    s += '<polygon points="40,50 180,50 180,300 360,450 360,200 220,50 220,300 40,150" fill="#E50914"/>\n'
    s += '</g>\n'
    # Dollar amount
    s += '<text x="960" y="880" font-family="Georgia,serif" font-size="200" font-weight="800" fill="#E50914" text-anchor="middle" letter-spacing="2">$17B</text>\n'
    s += '<text x="960" y="960" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#1a1a1a" text-anchor="middle" letter-spacing="4">CONTENT SPEND 2023</text>\n'
    s += svg_footer()
    return s

def chart_bars():
    """Comparison bar chart: Netflix vs Disney vs Apple."""
    s = svg_header()
    s += '<g transform="translate(160,350)">\n'
    # Grid lines
    for i in range(5):
        y = 600 - i * 120
        s += f'<line x1="0" y1="{y}" x2="1600" y2="{y}" stroke="#d5c8b0" stroke-width="1"/>\n'
        s += f'<text x="-20" y="{y+8}" font-family="Georgia,serif" font-size="28" fill="#8a7a60" text-anchor="end">${i*5}B</text>\n'
    # Bars
    bars = [
        ("Netflix", 17, 200, "#E50914"),
        ("Disney+", 8, 480, "#1a1a1a"),
        ("Apple TV+", 6, 760, "#E50914"),
        ("Amazon Prime", 12, 1040, "#1a1a1a"),
        ("HBO Max", 4, 1320, "#E50914"),
    ]
    for name, val, x, color in bars:
        h = val * 24
        s += f'<rect x="{x}" y="{600-h}" width="200" height="{h}" fill="{color}" rx="4"/>\n'
        s += f'<text x="{x+100}" y="{580-h}" font-family="Georgia,serif" font-size="64" font-weight="700" fill="white" text-anchor="middle">${val}B</text>\n'
        s += f'<text x="{x+100}" y="660" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#1a1a1a" text-anchor="middle">{name}</text>\n'
    s += '</g>\n'
    s += '<text x="960" y="180" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#1a1a1a" text-anchor="middle" letter-spacing="3">ANNUAL CONTENT SPENDING</text>\n'
    s += svg_footer()
    return s

def cord_cutting():
    """Declining line chart for traditional TV."""
    s = svg_header()
    s += '<g transform="translate(160,300)">\n'
    # Grid
    for i in range(6):
        y = 700 - i * 110
        s += f'<line x1="0" y1="{y}" x2="1600" y2="{y}" stroke="#d5c8b0" stroke-width="1"/>\n'
        lab = 120 - i * 20
        s += f'<text x="-20" y="{y+8}" font-family="Georgia,serif" font-size="24" fill="#8a7a60" text-anchor="end">{lab}M</text>\n'
    # Line data: 2018->120M, 2020->95M, 2022->70M, 2024->45M
    pts = [(150, 700-0), (550, 700-25*5), (950, 700-50*5), (1350, 700-75*5)]
    # Area fill
    area = f'<path d="M{pts[0][0]},{pts[0][1]}'
    for x,y in pts[1:]:
        area += f' L{x},{y}'
    area += f' L{pts[-1][0]},700 L{pts[0][0]},700 Z" fill="#E50914" opacity="0.15"/>'
    s += area
    # Line
    s += f'<polyline points="{" ".join(f"{x},{y}" for x,y in pts)}" fill="none" stroke="#E50914" stroke-width="6"/>'
    # Dots
    for x,y in pts:
        s += f'<circle cx="{x}" cy="{y}" r="8" fill="#E50914" stroke="white" stroke-width="3"/>'
    # Labels
    for lab, (x,y) in zip(["2018", "2020", "2022", "2024"], pts):
        s += f'<text x="{x}" y="730" font-family="Georgia,serif" font-size="28" fill="#1a1a1a" text-anchor="middle">{lab}</text>\n'
        s += f'<text x="{x+60}" y="{y-12}" font-family="Georgia,serif" font-size="32" font-weight="700" fill="#E50914"></text>\n'
    s += '</g>\n'
    s += '<text x="960" y="160" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#1a1a1a" text-anchor="middle" letter-spacing="3">TRADITIONAL TV SUBSCRIBERS (US)</text>\n'
    s += '<text x="960" y="990" font-family="Georgia,serif" font-size="36" font-weight="700" fill="#E50914" text-anchor="middle" letter-spacing="2">CORD-CUTTING ACCELERATING</text>\n'
    s += svg_footer()
    return s

def streaming_bubble():
    """Bubble chart showing market cap vs subscribers."""
    s = svg_header()
    # Big number
    s += '<text x="960" y="460" font-family="Georgia,serif" font-size="280" font-weight="800" fill="#E50914" text-anchor="middle" letter-spacing="4">$200B+</text>\n'
    s += '<text x="960" y="560" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#1a1a1a" text-anchor="middle" letter-spacing="3">COMBINED STREAMING DEBT</text>\n'
    # Bubble circles
    bubbles = [("Netflix", -300, -80, 140), ("Disney", 200, -40, 100), ("Apple", -150, 180, 80), ("Amazon", 250, 160, 120)]
    s += '<g transform="translate(960,780)">\n'
    for name, dx, dy, r in bubbles:
        s += f'<circle cx="{dx}" cy="{dy}" r="{r}" fill="#1a1a1a" opacity="0.9"/>\n'
        s += f'<text x="{dx}" y="{dy+6}" font-family="Georgia,serif" font-size="28" font-weight="700" fill="white" text-anchor="middle">{name}</text>\n'
    s += '</g>\n'
    s += svg_footer()
    return s

def pie_chart():
    """Who's winning: market share comparison."""
    s = svg_header()
    slices = [
        (0, 120, "#1a1a1a", "Netflix 38%"),
        (120, 80, "#E50914", "Amazon 22%"),
        (200, 60, "#333333", "Disney+ 15%"),
        (260, 45, "#E50914", "Apple TV+ 12%"),
        (305, 55, "#555555", "Others 13%"),
    ]
    cx, cy, r = 600, 540, 320
    s += f'<g transform="translate({cx-r},{cy-r})">\n'
    s += f'<circle cx="{r}" cy="{r}" r="{r}" fill="none" stroke="#d5c8b0" stroke-width="2"/>\n'
    for start_angle, sweep, color, _ in slices:
        # Convert to SVG arc
        x1 = r + r * math.cos(math.radians(-start_angle))
        y1 = r + r * math.sin(math.radians(-start_angle))
        x2 = r + r * math.cos(math.radians(-start_angle - sweep))
        y2 = r + r * math.sin(math.radians(-start_angle - sweep))
        large = 1 if sweep > 180 else 0
        s += f'<path d="M{r},{r} L{x1},{y1} A{r},{r} 0 {large},0 {x2},{y2} Z" fill="{color}"/>\n'
    s += '</g>\n'
    # Legend
    for i, (_, _, color, label) in enumerate(slices):
        s += f'<rect x="1050" y="{300+i*60}" width="30" height="30" fill="{color}" rx="4"/>\n'
        s += f'<text x="1100" y="{322+i*60}" font-family="Georgia,serif" font-size="28" fill="#1a1a1a">{label}</text>\n'
    s += '<text x="960" y="140" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#1a1a1a" text-anchor="middle" letter-spacing="3">STREAMING MARKET SHARE</text>\n'
    s += svg_footer()
    return s

def debt_spiral():
    """Netflix debt spiral - big number + visual."""
    s = svg_header()
    s += '<text x="960" y="380" font-family="Georgia,serif" font-size="300" font-weight="800" fill="#E50914" text-anchor="middle" letter-spacing="2">$14B</text>\n'
    s += '<text x="960" y="480" font-family="Georgia,serif" font-size="48" font-weight="700" fill="#1a1a1a" text-anchor="middle" letter-spacing="3">NETFLIX LONG-TERM DEBT</text>\n'
    # Arrow pointing down
    s += f'<line x1="960" y1="580" x2="960" y2="740" stroke="#E50914" stroke-width="8" stroke-linecap="round"/>\n'
    s += f'<polygon points="960,760 935,710 985,710" fill="#E50914"/>\n'
    s += '<text x="960" y="840" font-family="Georgia,serif" font-size="40" fill="#1a1a1a" text-anchor="middle" letter-spacing="1">Content debt is growing faster than revenue</text>\n'
    s += svg_footer()
    return s

def outro():
    """Final scene."""
    s = svg_header()
    s += '<text x="960" y="400" font-family="Georgia,serif" font-size="120" font-weight="800" fill="#1a1a1a" text-anchor="middle" letter-spacing="4">THE STREAMING</text>\n'
    s += '<text x="960" y="540" font-family="Georgia,serif" font-size="140" font-weight="800" fill="#E50914" text-anchor="middle" letter-spacing="6">BUBBLE</text>\n>
    s += '<text x="960" y="680" font-family="Georgia,serif" font-size="48" font-weight="400" fill="#666" text-anchor="middle" letter-spacing="2">How long until it bursts?</text>\n'
    s += svg_footer()
    return s

# Generate all assets
assets = {
    "background/paper-warm.svg": paper_texture,
    "midground/halftone-mask.svg": halftone_mask,
    "foreground/netflix-spend.svg": netflix_graphic,
    "foreground/content-chart.svg": chart_bars,
    "foreground/cord-cutting.svg": cord_cutting,
    "foreground/streaming-debt.svg": streaming_bubble,
    "foreground/market-share.svg": pie_chart,
    "foreground/debt-spiral.svg": debt_spiral,
    "foreground/outro-title.svg": outro,
}

for path, gen in assets.items():
    content = gen()
    with open(f"{OUT}/{path}", "w") as f:
        f.write(content)
    print(f"  ✓ {path} ({os.path.getsize(f'{OUT}/{path}')//1024}KB)")

print("\nDONE")
