// Render a still frame at multiple scene midpoints for inspection
import os from "node:os";
os.networkInterfaces = () => ({ lo: [{ address:"127.0.0.1", netmask:"255.0.0.0", family:"IPv4", mac:"00:00:00:00:00:00", internal:true, cidr:"127.0.0.1/8" }] });
import path from "node:path"; import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
console.log("Bundling...");
const b = await bundle({ entryPoint: path.resolve(ROOT, "src/Index.tsx"), webpackOverride: (c) => c });
const c = await selectComposition({ serveUrl: b, id: "VoxMaster", inputProps: {} });
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync(path.join(ROOT,"src/timeline.json"),"utf8"));
const fps = c.fps;
const markers = [];
for (const s of tl.scenes) {
  const mid = Math.round((s.startSec + 0.7 * (s.endSec - s.startSec)) * fps);
  markers.push({ id: s.id, mid });
}
fs.mkdirSync(path.join(ROOT, "out", "stills"), { recursive: true });
for (const a of markers) {
  console.log("still", a.id, "frame", a.mid);
  await renderStill({
    composition: c,
    serveUrl: b,
    frame: a.mid,
    imageFormat: "png",
    output: path.join(ROOT, "out", "stills", `${a.id}.png`),
    quality: 100,
  });
}
console.log("done");
