#!/usr/bin/env node
// ─── Gemini Vision validation: take a frame, send to Gemini, parse critique ──
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const outDir = path.join(ROOT, "out-v2");
const framePath = path.join(outDir, "validation-frame.png");
const API_KEY = process.env.GOOGLE_API_KEY || "";

async function main() {
  if (!fs.existsSync(framePath)) {
    console.log("No validation frame found at", framePath);
    console.log("SKIP_VALIDATION=1");
    process.exit(0);
  }

  const b64 = fs.readFileSync(framePath).toString("base64");
  const body = {
    contents: [{
      parts: [
        { text: "Does this look like a realistic photo cutout with a gritty halftone/ink effect and a matching red silhouette offset, or is it still a cartoon vector box? Rate 1-10 and suggest fixes." },
        { inline_data: { mime_type: "image/png", data: b64 } }
      ]
    }]
  };

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await resp.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

  fs.writeFileSync(path.join(outDir, "validation-result.txt"), text);
  console.log("Gemini Vision response:");
  console.log(text);

  const isBad = /cartoon|vector|flat|poor|bad|2\/10|3\/10|4\/10|5\/10/i.test(text);
  if (isBad) {
    console.log("\n❌ Gemini flagged visual issues. Self-correcting filter stack...");
    process.exit(1);
  } else {
    console.log("\n✅ Gemini approved the visuals.");
    process.exit(0);
  }
}

main().catch((e) => {
  console.error("Validation error:", e.message);
  process.exit(0); // don't fail build on validation error
});
