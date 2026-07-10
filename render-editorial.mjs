#!/usr/bin/env node
// ─── EDITORIAL VERSION RENDER ─────────────────────────────────────
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

os.networkInterfaces = () => ({
  lo: [{ address: "127.0.0.1", netmask: "255.0.0.0", family: "IPv4", mac: "00:00:00:00:00:00", internal: true, cidr: "127.0.0.1/8" }],
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const AUDIO = path.join(ROOT, "public", "audio");

const files = fs.readdirSync(AUDIO).filter((f) => /^vo-.*\.wav$/.test(f));
const scenes = files.map((f) => f.replace(/^vo-/, "").replace(/\.wav$/, "")).sort();
fs.writeFileSync(path.join(ROOT, "src", "vo-manifest.json"), JSON.stringify({ scenes }, null, 2));
console.log(`vo-manifest: ${scenes.length} scenes`);

const tlPath = path.join(ROOT, "src", "timeline.json");
const tl = JSON.parse(fs.readFileSync(tlPath, "utf8"));
const fps = tl.fps || 30;
const totalSec = tl.scenes[tl.scenes.length - 1].endSec;
const totalFrames = Math.ceil(totalSec * fps) + Math.ceil(1.6 * fps);
console.log(`Total: ${totalSec.toFixed(2)}s (${totalFrames} frames @ ${fps}fps)`);

const { bundle } = await import("@remotion/bundler");
console.log("Bundling editorial entry...");
const bundleLocation = await bundle({ entryPoint: path.resolve(ROOT, "src/IndexEditorial.tsx"), webpackOverride: (c) => c });
console.log(`  bundle -> ${bundleLocation}`);

const { renderMedia, selectComposition } = await import("@remotion/renderer");
const composition = await selectComposition({ serveUrl: bundleLocation, id: "VoxEditorialMaster", inputProps: {} });
console.log(`  composition: ${composition.width}x${composition.height} @ ${composition.fps}fps for ${composition.durationInFrames} frames`);

const outDir = path.join(ROOT, "out-v2");
fs.mkdirSync(outDir, { recursive: true });

const CHUNK = 75;
const chunks = [];
for (let s = 0; s < totalFrames; s += CHUNK) chunks.push([s, Math.min(s + CHUNK - 1, totalFrames - 1)]);
console.log(`Rendering ${chunks.length} chunks...`);

const chunkFiles = [];
for (const [start, end] of chunks) {
  const cp = path.join(outDir, `chunk_${String(start).padStart(4, "0")}.mp4`);
  if (fs.existsSync(cp) && fs.statSync(cp).size > 50_000) {
    console.log(`  ✓ ${start}-${end} cached`); chunkFiles.push(cp); continue;
  }
  const t0 = Date.now();
  await renderMedia({ composition, serveUrl: bundleLocation, codec: "h264", outputLocation: cp, inputProps: {}, frameRange: [start, end], concurrency: 1, imageFormat: "jpeg", jpegQuality: 75, audioCodec: "aac" });
  console.log(`  ${start}-${end} done in ${((Date.now()-t0)/1000).toFixed(1)}s`);
  chunkFiles.push(cp);
}

const rawCombine = path.join(outDir, "master_visual.mp4");
const fileList = path.join(outDir, "chunks.txt");
fs.writeFileSync(fileList, chunkFiles.map((f) => `file '${f}'`).join("\n"), "utf8");
execSync(`ffmpeg -y -f concat -safe 0 -i "${fileList}" -c copy "${rawCombine}"`, { stdio: "inherit" });

const voPath = path.join(AUDIO, "voiceover.wav");
const finalOut = path.join(outDir, "result_v2.mp4");
let mixCmd;
if (fs.existsSync(voPath)) {
  mixCmd = `ffmpeg -y -i "${rawCombine}" -i "${voPath}" -filter_complex "[1:a]aresample=48000[a];[0:a][a]amix=inputs=2:duration=first:dropout_transition=0[aout]" -map "0:v" -map "[aout]" -c:v copy -c:a aac -shortest "${finalOut}"`;
} else {
  mixCmd = `ffmpeg -y -i "${rawCombine}" -c copy "${finalOut}"`;
}
execSync(mixCmd, { stdio: "inherit" });

const stats = fs.statSync(finalOut);
console.log(`\n✓ DONE: ${finalOut} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
