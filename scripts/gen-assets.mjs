#!/usr/bin/env node
// ─── ASSET GENERATOR ────────────────────────────────────────────
// Synthesizes every Vox-style asset as scalable SVG. Reproducible &
// dependent only on Node fs. Vox brand system:
//   • Shared papery background (fibrinous grain + vignette)
//   • Midground: high-contrast B&W silhouettes + halftone dot overlay
//   • Foreground: crisp clean SVG (line/fill art) for depth
//   • The signature crimson offset stroke is applied at RUNTIME by
//     Remotion (dup layer + crimson fill offset on X/Y). Not baked
//     into these statics.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUB = path.join(ROOT, "public", "assets");
const W = 1920;
const H = 1080;

for (const d of ["background", "midground", "foreground"]) {
  fs.mkdirSync(path.join(PUB, d), { recursive: true });
}

const writeSvg = (relPath, svg) => {
  const full = path.join(PUB, relPath);
  fs.writeFileSync(full, svg, "utf8");
  console.log(`  svg -> ${path.relative(ROOT, full)} (${(svg.length / 1024).toFixed(1)}KB)`);
};

const svgWrap = (inner, vb = `0 0 ${W} ${H}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}">\n${inner}\n</svg>`;

// ── Shared papery background ─────────────────────────────────────
const paper = () => {
  const base = "#efe6d2";
  return svgWrap(`
  <defs>
    <filter id="paperNoise" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.35 0.16"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="fiberNoise">
      <feTurbulence type="turbulence" baseFrequency="0.02 0.55" numOctaves="2" seed="11"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0.07 0"/>
    </filter>
    <radialGradient id="vign" cx="50%" cy="48%" r="78%">
      <stop offset="55%" stop-color="${base}" stop-opacity="0"/>
      <stop offset="100%" stop-color="#6b5638" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${base}"/>
  <rect width="${W}" height="${H}" filter="url(#fiberNoise)" opacity="0.55"/>
  <rect width="${W}" height="${H}" fill="url(#vign)"/>
  <rect width="${W}" height="${H}" filter="url(#paperNoise)" opacity="0.45"/>`);
};
writeSvg("background/paper-warm.svg", paper());

// ── Halftone dot texture (silhouette-clipped at runtime) ─────────
const halftone = (dot = 8, gap = 5) => svgWrap(`
  <defs>
    <pattern id="dots" x="0" y="0" width="${dot + gap}" height="${dot + gap}" patternUnits="userSpaceOnUse">
      <circle cx="${(dot + gap) / 2}" cy="${(dot + gap) / 2}" r="${dot / 2}" fill="#000"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>`);
writeSvg("midground/halftone-mask.svg", halftone(8, 5));

// ── Midground cutouts: stylized head-silhouettes ──────────────────
// Trump: long comb-over, jacket collar, long tie.
const trumpHead = () => {
  // x/y in a 600x800 viewBox for easy placement via transform
  const vb = "0 0 600 800";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="600" height="800">
  <g fill="#000">
    <!-- shoulder / suit -->
    <path d="M70 720 Q300 580 530 720 L530 800 L70 800 Z"/>
    <!-- shirt V -->
    <path d="M250 600 L300 720 L350 600 Z" fill="#fff"/>
    <!-- tie -->
    <path d="M285 600 L300 720 L315 600 Z" fill="#d22b2b"/>
    <!-- neck/jaw -->
    <path d="M230 460 Q230 540 300 600 Q370 540 370 460 Z"/>
    <!-- hair comb-over -->
    <path d="M150 220 Q140 110 320 95 Q510 110 470 230 Q460 290 410 275 Q330 250 270 285 Q230 320 200 290 Q170 270 162 240 Z"/>
    <!-- forehead+face -->
    <path d="M195 220 Q190 360 245 430 Q300 480 360 430 Q410 360 408 230 Q400 175 300 168 Q210 170 195 220 Z" fill="#fff"/>
    <!-- eyes -->
    <ellipse cx="252" cy="305" rx="14" ry="8"/>
    <ellipse cx="352" cy="305" rx="14" ry="8"/>
    <!-- eyebrows (chunky) -->
    <rect x="232" y="280" width="42" height="9" rx="3" transform="rotate(-5 253 285)"/>
    <rect x="332" y="280" width="42" height="9" rx="3" transform="rotate(5 353 285)"/>
    <!-- nose -->
    <path d="M300 320 Q288 380 305 405 L325 405 Z"/>
    <!-- mouth (pucker) -->
    <ellipse cx="300" cy="450" rx="42" ry="11"/>
  </g>
</svg>`;
};
writeSvg("midground/trump.svg", trumpHead());

// Khamenei/Ayatollah: turban + full beard, robe.
const khameneiHead = () => {
  const vb = "0 0 600 800";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="600" height="800">
  <g fill="#000">
    <!-- robe -->
    <path d="M60 720 Q300 560 540 720 L540 800 L60 800 Z"/>
    <!-- neck -->
    <path d="M250 530 Q300 580 350 530 L350 600 L250 600 Z" fill="#fff"/>
    <!-- beard (full, rounded) -->
    <path d="M195 360 Q180 510 300 560 Q420 510 405 360 Q400 320 300 312 Q200 320 195 360 Z"/>
    <!-- face (just upper, beard covers lower) -->
    <path d="M205 240 Q200 350 300 345 Q400 350 395 240 Q380 180 300 175 Q220 180 205 240 Z" fill="#fff"/>
    <!-- turban (large rounded black band around crown) -->
    <path d="M150 215 Q150 110 300 95 Q450 110 450 215 Q450 240 300 245 Q150 240 150 215 Z"/>
    <!-- eyes (smaller, intense) -->
    <ellipse cx="265" cy="280" rx="11" ry="6"/>
    <ellipse cx="345" cy="280" rx="11" ry="6"/>
    <!-- eyebrows -->
    <rect x="246" y="262" width="36" height="6" rx="2"/>
    <rect x="328" y="262" width="36" height="6" rx="2"/>
    <!-- nose -->
    <path d="M305 300 Q293 345 308 358 L320 358 Z"/>
  </g>
</svg>`;
};
writeSvg("midground/khamenei.svg", khameneiHead());

// Generic suited official silhouette (side figure facing left).
const officialFigure = () => {
  const vb = "0 0 500 800";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="500" height="800">
  <g fill="#000">
    <path d="M40 800 L40 620 Q60 540 140 510 Q180 500 200 470 L220 320 Q230 240 250 220 Q300 200 320 250 Q330 320 320 470 Q340 500 380 510 Q430 540 460 620 L460 800 Z"/>
    <path d="M250 510 L280 620 L300 510 Z" fill="#fff"/>
    <path d="M263 510 L280 620 L297 510 Z" fill="#0a0a0a"/>
  </g>
</svg>`;
};
writeSvg("midground/official-figure.svg", officialFigure());

// ── Foreground structures ────────────────────────────────────────
// White House — symbol of US executive power (recognizable portico).
const whiteHouse = () => svgWrap(`
  <g fill="#1a1a1a" stroke="#1a1a1a" stroke-width="3">
    <!-- wings -->
    <rect x="450" y="640" width="1020" height="190"/>
    <!-- main block -->
    <rect x="730" y="520" width="460" height="310"/>
    <!-- roof -->
    <polygon points="730,520 960,400 1190,520"/>
    <!-- pediment -->
    <polygon points="780,520 960,440 1140,520"/>
    <!-- central portico columns -->
    <rect x="720" y="520" width="22" height="220"/>
    <rect x="770" y="520" width="22" height="220"/>
    <rect x="820" y="520" width="22" height="220"/>
    <rect x="870" y="520" width="22" height="220"/>
    <rect x="920" y="520" width="22" height="220"/>
    <rect x="972" y="520" width="22" height="220"/>
    <rect x="1020" y="520" width="22" height="220"/>
    <rect x="1070" y="520" width="22" height="220"/>
    <rect x="1120" y="520" width="22" height="220"/>
    <!-- roof of main block (top circle pediment) -->
    <ellipse cx="960" cy="440" rx="34" ry="20"/>
    <!-- windows on wings -->
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${480 + i * 80}" y="685" width="40" height="60" fill="#efe6d2"/>`).join("\n    ")}
    <!-- flag -->
    <line x1="960" y1="400" x2="960" y2="320" stroke-width="3"/>
    <path d="M960 320 Q1010 330 1000 350 Q960 360 960 350 Z"/>
  </g>`);
writeSvg("foreground/white-house.svg", whiteHouse());

// US Capitol dome
const capitol = () => svgWrap(`
  <g fill="#1a1a1a">
    <rect x="200" y="640" width="1520" height="220"/>
    <rect x="500" y="540" width="920" height="100"/>
    <ellipse cx="960" cy="450" rx="220" ry="160"/>
    <rect x="500" y="540" width="920" height="40"/>
    <!-- column hints -->
    ${Array.from({ length: 20 }, (_, i) => `<rect x="${550 + i * 44}" y="580" width="12" height="60"/>`).join("\n    ")}
    <line x1="960" y1="290" x2="960" y2="200" stroke="#1a1a1a" stroke-width="6"/>
    <circle cx="960" cy="198" r="22"/>
  </g>`);
writeSvg("foreground/capitol.svg", capitol());

// Oil tanker silhouette
const oilTanker = () => {
  // 1920 x 320 — long thin strip just above "ocean"
  const vb = "0 0 1920 320";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="1920" height="320">
  <g fill="#1a1a1a">
    <path d="M40 250 L1800 250 L1880 200 L1880 175 L40 175 Z"/>
    <rect x="110" y="120" width="380" height="55"/>
    <rect x="280" y="60" width="100" height="60"/>
    <rect x="540" y="150" width="1200" height="20"/>
    <rect x="1750" y="120" width="80" height="55"/>
    <!-- smokestack -->
    <rect x="300" y="20" width="20" height="40"/>
    <path d="M313 10 Q330 0 320 35" fill="rgba(40,40,40,0.45)"/>
  </g>
</svg>`;
};
writeSvg("foreground/oil-tanker.svg", oilTanker());

// Strait of Hormuz map — abstract gulf shape + tanker route line
const straitMap = () => svgWrap(`
  <g fill="none" stroke="#1a1a1a" stroke-width="6">
    <!-- water -->
    <path d="M200 500 Q700 380 1200 460 Q1600 520 1750 400 L1750 1080 L200 1080 Z" fill="#4a7ba0" stroke="none"/>
    <!-- tongue (gulf) -->
    <path d="M500 1080 Q700 720 950 520 Q1100 460 1150 460 Q980 540 850 720 Q700 900 540 1080 Z" fill="#efe6d2" stroke="#1a1a1a" stroke-width="3"/>
    <!-- strait pinch -->
    <line x1="900" y1="600" x2="1180" y2="540" stroke="#d22b2b" stroke-width="9"/>
    <!-- label dot -->
    <circle cx="1040" cy="570" r="14" fill="#d22b2b" stroke="none"/>
    <!-- IR head marker -->
    <circle cx="700" cy="760" r="28" fill="#000" stroke="none"/>
    <!-- US fleet marker -->
    <path d="M1500 700 L1540 740 L1500 780 L1460 740 Z" fill="#d22b2b" stroke="none"/>
  </g>`);
writeSvg("foreground/strait-map.svg", straitMap());

// Oil barrel foreground
const barrel = () => {
  const vb = "0 0 600 800";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="600" height="800">
  <g fill="#d22b2b" stroke="#1a1a1a" stroke-width="5">
    <ellipse cx="300" cy="640" rx="220" ry="60"/>
    <rect x="80" y="200" width="440" height="440"/>
    <ellipse cx="300" cy="200" rx="220" ry="60"/>
    <rect x="80" y="280" width="440" height="12" fill="#1a1a1a"/>
    <rect x="80" y="430" width="440" height="12" fill="#1a1a1a"/>
    <rect x="80" y="580" width="440" height="12" fill="#1a1a1a"/>
    <text x="300" y="360" text-anchor="middle" font-family="Georgia,serif" font-size="120" fill="#1a1a1a" font-weight="700">OIL</text>
  </g>
</svg>`;
};
writeSvg("foreground/barrel.svg", barrel());

// US Map silhouette (foreground charter map)
const usMap = () => svgWrap(`
  <g fill="#1a1a1a">
    <path d="M250 360 Q400 320 600 340 Q900 320 1100 360 Q1300 380 1550 410 Q1700 440 1700 540 L1650 720 Q1500 800 1300 780 Q900 800 600 760 Q420 720 320 700 Q240 660 220 580 Q200 470 250 360 Z"/>
    <!-- Florida tassel -->
    <path d="M1180 760 Q1200 840 1180 900 L1150 900 Q1160 820 1140 760 Z"/>
    <!-- Texas nib -->
    <path d="M560 700 Q500 760 460 800 L430 800 Q470 740 510 700 Z"/>
  </g>`);
writeSvg("foreground/us-map.svg", usMap());

// Inflation line chart (line racing up)
const inflationChart = () => svgWrap(`
  <g fill="none" stroke="#1a1a1a" stroke-width="5">
    <rect x="240" y="220" width="1440" height="700" fill="#fefbf3" stroke="#1a1a1a"/>
    <line x1="240" y1="920" x2="1680" y2="920"/>
    <line x1="240" y1="220" x2="240" y2="920"/>
    <!-- bars -->
    ${Array.from({ length: 11 }, (_, i) => {
      const h = 80 + i * 8 + (i > 7 ? (i - 7) * 60 : 0);
      return `<rect x="${300 + i * 124}" y="${920 - h}" width="80" height="${h}" fill="${i < 8 ? "#1a1a1a" : "#d22b2b"}" stroke="none"/>`;
    }).join("\n    ")}
    <!-- spike marker -->
    <circle cx="1600" cy="280" r="18" fill="#d22b2b" stroke="none"/>
    <line x1="1600" y1="280" x2="1600" y2="200" stroke="#d22b2b" stroke-width="5"/>
  </g>`);
writeSvg("foreground/inflation-chart.svg", inflationChart());

// US map silhouette + bar chart overlay (debt scene)
const debtBagVsGDP = () => svgWrap(`
  <g>
    <!-- balance scale -->
    <line x1="960" y1="160" x2="960" y2="640" stroke="#1a1a1a" stroke-width="6"/>
    <line x1="540" y1="240" x2="1380" y2="240" stroke="#1a1a1a" stroke-width="6"/>
    <!-- left pan (DEBT) heavier -->
    <path d="M380 320 L700 320 L540 440 Z" fill="#d22b2b" stroke="#1a1a1a" stroke-width="4"/>
    <text x="540" y="520" text-anchor="middle" font-family="Georgia,serif" font-size="80" font-weight="700" fill="#1a1a1a">DEBT</text>
    <!-- right pan (GDP) lighter -->
    <path d="M1220 280 L1540 280 L1380 360 Z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="4"/>
    <text x="1380" y="520" text-anchor="middle" font-family="Georgia,serif" font-size="80" font-weight="700" fill="#1a1a1a">GDP</text>
    <!-- tilted balance bar to show imbalance -->
    <line x1="540" y1="240" x2="1380" y2="240" stroke="#d22b2b" stroke-width="6" transform="rotate(-12 960 240)"/>
  </g>`);
writeSvg("foreground/scale-balance.svg", debtBagVsGDP());

// Comparison bars: interest vs military
const comparisonBars = () => svgWrap(`
  <g>
    <rect x="280" y="240" width="600" height="540" fill="#1a1a1a"/>
    <text x="580" y="850" text-anchor="middle" font-family="Georgia,serif" font-size="60" font-weight="700" fill="#1a1a1a">MILITARY</text>
    <rect x="1040" y="180" width="600" height="600" fill="#d22b2b"/>
    <text x="1340" y="850" text-anchor="middle" font-family="Georgia,serif" font-size="60" font-weight="700" fill="#d22b2b">INTEREST</text>
    <text x="1340" y="540" text-anchor="middle" font-family="Georgia,serif" font-size="160" font-weight="700" fill="#fff">TALLER</text>
    <text x="580" y="540" text-anchor="middle" font-family="Georgia,serif" font-size="120" font-weight="700" fill="#fff">~$880B</text>
  </g>`);
writeSvg("foreground/comparison-bars.svg", comparisonBars());

// Globe with $ leaving — "world leaving dollar behind"
const globeDollar = () => svgWrap(`
  <g>
    <circle cx="960" cy="540" r="320" fill="#4a7ba0" stroke="#1a1a1a" stroke-width="6"/>
    <!-- continents (abstract blobs) -->
    <path d="M700 420 Q760 380 820 410 Q840 470 780 490 Q720 500 700 460 Z" fill="#1a1a1a"/>
    <path d="M980 520 Q1080 470 1150 520 Q1170 580 1090 600 Q1020 590 980 540 Z" fill="#1a1a1a"/>
    <path d="M880 700 Q980 680 1080 720 Q1080 770 1000 780 Q900 760 880 720 Z" fill="#1a1a1a"/>
    <!-- lat/long lines -->
    <ellipse cx="960" cy="540" rx="320" ry="100" fill="none" stroke="#1a1a1a" stroke-width="3" opacity="0.4"/>
    <ellipse cx="960" cy="540" rx="320" ry="60" fill="none" stroke="#1a1a1a" stroke-width="3" opacity="0.4"/>
    <ellipse cx="960" cy="540" rx="100" ry="320" fill="none" stroke="#1a1a1a" stroke-width="3" opacity="0.4"/>
    <!-- dollar sign flying off -->
    <text x="1500" y="320" text-anchor="middle" font-family="Georgia,serif" font-size="240" font-weight="700" fill="#d22b2b">$</text>
    <path d="M1280 380 L1480 320" stroke="#d22b2b" stroke-width="6" stroke-dasharray="20,15"/>
  </g>`);
writeSvg("foreground/globe-dollar.svg", globeDollar());

// Falling eagle (for "downfall" scene)
const fallingEagle = () => {
  const vb = "0 0 600 600";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="600" height="600">
  <g fill="#1a1a1a">
    <!-- body -->
    <ellipse cx="300" cy="300" rx="60" ry="80"/>
    <!-- head -->
    <circle cx="300" cy="200" r="40"/>
    <!-- beak -->
    <path d="M340 200 L390 195 L340 215 Z" fill="#f0c000"/>
    <!-- wings drooping -->
    <path d="M240 280 Q120 320 80 460 Q150 440 240 380 Z"/>
    <path d="M360 280 Q480 320 520 460 Q450 440 360 380 Z"/>
    <!-- tail feathers -->
    <path d="M270 360 L330 360 L300 480 Z"/>
  </g>
</svg>`;
};
writeSvg("foreground/falling-eagle.svg", fallingEagle());

// Quote card generator — handled inline in React component
// (kept in code, not in asset files)

// Outro card — handled inline in React component
console.log("\nAll SVG assets generated.");
