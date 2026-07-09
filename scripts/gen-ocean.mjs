#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUB = path.join(ROOT, "public", "assets");
const W = 1920;
const svgWrap = (inner, h = "600") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}">\n${inner}\n</svg>`;

// Ocean strip — synthetic blue water with subtle wave ripples.
const ocean = () => svgWrap(`
  <defs>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a7ba0"/>
      <stop offset="100%" stop-color="#1d3a55"/>
    </linearGradient>
    <filter id="ripp">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.08" numOctaves="2" seed="3"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.15  0 0 0 0 0.25  0 0 0 0.25 0"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect width="${W}" height="600" fill="url(#sea)"/>
  <rect width="${W}" height="600" filter="url(#ripp)"/>`, "600");

fs.writeFileSync(path.join(PUB, "foreground", "ocean.svg"), ocean(), "utf8");
console.log("Wrote foreground/ocean.svg");
