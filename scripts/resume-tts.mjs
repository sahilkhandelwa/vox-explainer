#!/usr/bin/env node
// ─── RESUME TTS FOR FAILED SCENES ────────────────────────────────
// Polls the Gemini TTS endpoint with exponential backoff up to ~70min,
// filling only the missing scene audio files. Updates src/timeline.json
// at the end so all scenes line back up.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const AUDIO = path.join(ROOT, "public", "audio");

const API_KEY = process.env.GOOGLE_API_KEY
  || (fs.readFileSync(`/root/.config/opencode/.env`, "utf8").split("\n").find((l) => l.startsWith("GOOGLE_API_KEY="))?.split("=")[1] || "").trim();

const scenesUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;

// Parse script.ts for ALL scenes; we'll fill what's missing
const src = fs.readFileSync(path.join(__dirname, "script.ts"), "utf8");
const sceneRx = /{\s*id:\s*"([^"]+)".*?line:\s*"((?:[^"\\]|\\.)*)".*?durationSec:\s*([\d.]+)/gs;
const scenes = [];
let m;
while ((m = sceneRx.exec(src)) !== null) {
  scenes.push({ id: m[1], line: m[2].replace(/\\"/g, '"'), durationSec: parseFloat(m[3]) });
}

const pcmToWav = (pcm, rate = 24000, channels = 1, sampwidth = 2) => {
  const len = pcm.length;
  const buf = Buffer.alloc(44 + len);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + len, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * channels * sampwidth, 28);
  buf.writeUInt16LE(channels * sampwidth, 32);
  buf.writeUInt16LE(sampwidth * 8, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(len, 40);
  pcm.copy(buf, 44);
  return buf;
};

const doTTS = async (text, outWav) => {
  const expression = `In a calm, serious cinematic British documentary narrator voice, narrate: "${text}"`;
  const body = {
    contents: [{ parts: [{ text: expression }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "kore" } } },
    },
  };
  const res = await fetch(scenesUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) {
    return { retry: true };
  }
  if (!res.ok) {
    return { error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
  }
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) return { retry: true }; // no audio = try again
  const pcm = Buffer.from(part.inlineData.data, "base64");
  fs.writeFileSync(outWav, pcmToWav(pcm));
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outWav}"`).toString().trim());
  return { dur };
};

const buildTimeline = () => {
  let acc = 0;
  const out = scenes.map((s) => {
    const p = path.join(AUDIO, `vo-${s.id}.wav`);
    let dur = s.durationSec;
    if (fs.existsSync(p)) {
      dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim());
    }
    const start = acc;
    acc += dur;
    return { id: s.id, durationSec: dur, startSec: start, endSec: acc };
  });
  fs.writeFileSync(path.join(ROOT, "src", "timeline.json"), JSON.stringify({ fps: 30, scenes: out }, null, 2));
  return out;
};

const concatVO = (timeline) => {
  const fileList = path.join(AUDIO, "concat.txt");
  const files = timeline.filter((t) => fs.existsSync(path.join(AUDIO, `vo-${t.id}.wav`)));
  if (files.length === 0) {
    console.log("No audio files yet, skipping concat.");
    return;
  }
  fs.writeFileSync(fileList, files.map((t) => `file 'vo-${t.id}.wav'`).join("\n"), "utf8");
  const voOut = path.join(AUDIO, "voiceover.wav");
  execSync(`ffmpeg -y -f concat -safe 0 -i "${fileList}" -c copy "${voOut}" 2>&1`, { stdio: "inherit" });
  console.log(`Voiceover concat done: ${files.length}/${scenes.length} scenes.`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  console.log("Resume TTS for failed scenes. Polling up to 70 minutes.");
  const MAX_DURATION_MS = 70 * 60 * 1000;
  const start = Date.now();
  let backoff = 60_000; // start: 60s between polls
  const MAX_BACKOFF = 5 * 60_000;

  while (Date.now() - start < MAX_DURATION_MS) {
    // Identify still-missing scenes
    const missing = scenes.filter((s) => !fs.existsSync(path.join(AUDIO, `vo-${s.id}.wav`)));
    if (missing.length === 0) {
      console.log("\n*** ALL SCENES HAVE AUDIO ***\n");
      break;
    }
    console.log(`\n[${new Date().toISOString()}] ${missing.length} missing: ${missing.map((s) => s.id).join(", ")}. Backoff=${(backoff / 1000).toFixed(0)}s`);
    // Try ONE missing scene per poll cycle (so we don't blow quota all at once)
    const target = missing[0];
    const p = path.join(AUDIO, `vo-${target.id}.wav`);
    const r = await doTTS(target.line, p);
    if (r.dur) {
      console.log(`  ✓ ${target.id} -> ${r.dur.toFixed(2)}s`);
      backoff = 60_000;
    } else if (r.retry) {
      console.log(`  ⏳ ${target.id} quota-held`);
      backoff = Math.min(backoff * 1.5, MAX_BACKOFF);
    } else {
      console.log(`  ✗ ${target.id} ${r.error}`);
      backoff = Math.min(backoff * 1.5, MAX_BACKOFF);
    }
    await sleep(backoff);
  }

  // Build timeline + concat regardless of completion state
  const timeline = buildTimeline();
  concatVO(timeline);
  const total = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path.join(AUDIO, "voiceover.wav")}" 2>/dev/null || echo 0`).toString().trim();
  console.log(`\nTimeline (${timeline.length} scenes). Voiceover = ${total}s`);
  const missing = scenes.filter((s) => !fs.existsSync(path.join(AUDIO, `vo-${s.id}.wav`)));
  if (missing.length > 0) {
    console.log(`\n!!! STILL MISSING: ${missing.map((s) => s.id).join(", ")} — pipeline will synthesize silent placeholders so rendering is unblocked.`);
  }
};

main().catch((e) => {
  console.error("Resume TTS failed:", e);
  process.exit(1);
});
