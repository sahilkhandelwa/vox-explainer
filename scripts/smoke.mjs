#!/usr/bin/env node
// Smoke test: bundle + render only first 30 frames to detect errors fast.
import os from "node:os";
os.networkInterfaces = () => ({ lo: [{ address: "127.0.0.1", netmask: "255.0.0.0", family: "IPv4", mac: "00:00:00:00:00:00", internal: true, cidr: "127.0.0.1/8" }] });

import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const { bundle } = await import("@remotion/bundler");
const { renderMedia, selectComposition } = await import("@remotion/renderer");

console.log("Bundling...");
const bundleLocation = await bundle({
  entryPoint: path.resolve(ROOT, "src/Index.tsx"),
  webpackOverride: (c) => c,
});
console.log(`bundle -> ${bundleLocation}`);
const composition = await selectComposition({ serveUrl: bundleLocation, id: "VoxMaster", inputProps: {} });
console.log(`composition: ${composition.width}x${composition.height} @ ${composition.fps}fps, total frames=${composition.durationInFrames}`);
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: path.join(ROOT, "out", "smoke.mp4"),
  inputProps: {},
  frameRange: [0, Math.min(29, composition.durationInFrames - 1)],
  concurrency: 1,
  imageFormat: "jpeg",
  jpegQuality: 60,
  audioCodec: "aac",
});
console.log("✓ smoke render ok");
