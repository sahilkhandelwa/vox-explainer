#!/usr/bin/env node
// ─── MASTER RENDER PIPELINE ───────────────────────────────────────
// 1) Re-scan public/audio & write vo-manifest.json (so audio is wired
//    only for scenes that actually have WAV files).
// 2) Re-sync src/timeline.json based on measured TTS durations
//    (resume-tts.mjs has been keeping timeline.json refreshed).
// 3) Bundle the Remotion entry point.
// 4) Render chunks concurrently & ffmpeg-concat into out/result.mp4
//    at 1920x1080 H264 with voiceover mixed in.

import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

// Quiet localhost-only network shim (mirrors the phonk project trick).
os.networkInterfaces = () => ({
  lo: [{
    address: "127.0.0.1",
    netmask: "255.0.0.0",
    family: "IPv4",
    mac: "00:00:00:00:00:00",
    internal: true,
    cidr: "127.0.0.1/8",
  }],
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;  // render.mjs lives at project root
const AUDIO = path.join(ROOT, "public", "audio");

// ── 1) Refresh vo-manifest.json ──────────────────────────────────
const files = fs.readdirSync(AUDIO).filter((f) => /^vo-.*\.wav$/.test(f));
const scenes = files.map((f) => f.replace(/^vo-/, "").replace(/\.wav$/, "")).sort();
fs.writeFileSync(
  path.join(ROOT, "src", "vo-manifest.json"),
  JSON.stringify({ scenes }, null, 2),
);
console.log(`vo-manifest: ${scenes.length} scenes -> ${scenes.join(", ")}`);

// ── 2) Build timeline (use timeline.json or fall back to script.ts estimates) ─
const tlPath = path.join(ROOT, "src", "timeline.json");
const tl = JSON.parse(fs.readFileSync(tlPath, "utf8"));
const fps = tl.fps || 30;
const totalSec = tl.scenes[tl.scenes.length - 1].endSec;
const totalFrames = Math.ceil(totalSec * fps) + Math.ceil(1.6 * fps);
console.log(`Total duration: ${totalSec.toFixed(2)}s (${totalFrames} frames @ ${fps}fps)`);

// ── 3) Bundle ────────────────────────────────────────────────────
const { bundle } = await import("@remotion/bundler");
console.log("Bundling Remotion entry...");
const bundleLocation = await bundle({
  entryPoint: path.resolve(ROOT, "src/Index.tsx"),
  webpackOverride: (config) => config,
});
console.log(`  bundle -> ${bundleLocation}`);

// ── 4) Render chunks ──────────────────────────────────────────────
const { renderMedia, selectComposition } = await import("@remotion/renderer");
console.log("Selecting composition...");
const composition = await selectComposition({ serveUrl: bundleLocation, id: "VoxMaster", inputProps: {} });
console.log(`  composition: ${composition.width}x${composition.height} @ ${composition.fps}fps for ${composition.durationInFrames} frames`);

const outDir = path.join(ROOT, "out");
fs.mkdirSync(outDir, { recursive: true });

// Chunk by frame indices (smaller chunks = lower RAM pressure on ARM)
const CHUNK = 75;
const chunks = [];
for (let s = 0; s < totalFrames; s += CHUNK) {
  chunks.push([s, Math.min(s + CHUNK - 1, totalFrames - 1)]);
}
console.log(`Rendering ${chunks.length} chunks...`);

const chunkFiles = [];
for (const [start, end] of chunks) {
  const cp = path.join(outDir, `chunk_${String(start).padStart(4, "0")}.mp4`);
  if (fs.existsSync(cp) && fs.statSync(cp).size > 50_000) {
    console.log(`  ✓ ${start}-${end} cached (${fs.statSync(cp).size} bytes)`);
    chunkFiles.push(cp);
    continue;
  }
  // Snap to the requested chunk size; if an older 150-frame chunk exists
  // but covers a different range, only use it if its start matches.
  const t0 = Date.now();
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: cp,
    inputProps: {},
    frameRange: [start, end],
    concurrency: 1,
    imageFormat: "jpeg",
    jpegQuality: 75,
    audioCodec: "aac",
  });
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  ${start}-${end} done in ${dt}s`);
  chunkFiles.push(cp);
}

// ── 5) Concatenate chunks → silence base + mix voiceover ──────────
const rawCombine = path.join(outDir, "master_visual.mp4");
const fileList = path.join(outDir, "chunks.txt");
fs.writeFileSync(fileList, chunkFiles.map((f) => `file '${f}'`).join("\n"), "utf8");
console.log("Concatenating visual chunks...");
execSync(`ffmpeg -y -f concat -safe 0 -i "${fileList}" -c copy "${rawCombine}"`, { stdio: "inherit" });

// Mix voiceover: read all VO files in scene order from timeline.json,
// place each via adelay to align to entries in the visual timeline,
// then sum-mix with silence base.
const voPath = path.join(AUDIO, "voiceover.wav");
const finalOut = path.join(outDir, "result.mp4");
let mixCmd;
if (fs.existsSync(voPath)) {
  console.log("Mixing voiceover on top of visuals...");
  mixCmd = `ffmpeg -y -i "${rawCombine}" -i "${voPath}" -filter_complex "[1:a]aresample=48000[a];[0:a][a]amix=inputs=2:duration=first:dropout_transition=0[aout]" -map "0:v" -map "[aout]" -c:v copy -c:a aac -shortest "${finalOut}"`;
} else {
  console.log("No voiceover file; writing visuals only...");
  mixCmd = `ffmpeg -y -i "${rawCombine}" -c copy "${finalOut}"`;
}
execSync(mixCmd, { stdio: "inherit" });

const stats = fs.statSync(finalOut);
console.log(`\n✓ DONE: ${finalOut} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
