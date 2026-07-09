#!/usr/bin/env node
// ─── VOICEOVER GENERATOR (Gemini TTS) ────────────────────────────
// Generates one WAV per line in scripts/script.ts using the Gemini
// 2.5 Flash Preview TTS endpoint. Saves into public/audio. Also
// writes a single concatenated voiceover.wav. Prints exact durations
// per scene -> src/timeline.json consumed by Remotion timeline engine.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const AUDIO = path.join(ROOT, "public", "audio");
fs.mkdirSync(AUDIO, { recursive: true });

const API_KEY = process.env.GOOGLE_API_KEY
  || fs.readFileSync(path.join(process.env.HOME || "/root", ".config/opencode/.env"), "utf8")
      .split("\n").find((l) => l.startsWith("GOOGLE_API_KEY="))?.split("=")[1]?.trim();

if (!API_KEY) {
  console.error("No GOOGLE_API_KEY available. Aborting TTS.");
  process.exit(1);
}

// Read scenes from script.ts (regex rather than full TS parse, simpler)
const src = fs.readFileSync(path.join(__dirname, "script.ts"), "utf8");
const sceneRegex = /{\s*id:\s*"([^"]+)".*?line:\s*"((?:[^"\\]|\\.)*)".*?durationSec:\s*([\d.]+)/gs;
const scenes = [];
let m;
while ((m = sceneRegex.exec(src)) !== null) {
  scenes.push({ id: m[1], line: m[2].replace(/\\"/g, '"'), durationSec: parseFloat(m[3]) });
}
console.log("Parsed", scenes.length, "scenes from script.ts");

// Build a proper RIFF WAV from raw L16 PCM (24kHz mono s16le Gemini output).
const pcmToWav = (pcm, rate = 24000, channels = 1, sampwidth = 2) => {
  const dataLen = pcm.length;
  const buf = Buffer.alloc(44 + dataLen);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);              // PCM
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * channels * sampwidth, 28);
  buf.writeUInt16LE(channels * sampwidth, 32);
  buf.writeUInt16LE(sampwidth * 8, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataLen, 40);
  pcm.copy(buf, 44);
  return buf;
};

const tts = async (text, outWav) => {
  // Gemini TTS supports prosody instructions inline as text within double quotes.
  const expression = `Narrate in the style of a cinematic British documentary narrator with a calm, deliberate, serious tone and slight gravitas: "${text}"`;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: expression }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "kore" } },
      },
    },
  };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS HTTP ${res.status}: ${err}`);
  }
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) throw new Error("No audio in response");
  const pcm = Buffer.from(part.inlineData.data, "base64");
  const wav = pcmToWav(pcm);
  fs.writeFileSync(outWav, wav);
  const { stdout } = await import("node:child_process");
  return new Promise((resolve) => {
    execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outWav}" "${outWav}" >/dev/null 2>&1 || true`);
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outWav}"`).toString().trim();
    resolve(parseFloat(out));
  });
};

const main = async () => {
  const timeline = [];
  for (const s of scenes) {
    const p = path.join(AUDIO, `vo-${s.id}.wav`);
    let dur;
    let attempt = 0;
    while (attempt < 3) {
      try {
        console.log(`TTS [${s.id}] attempt ${attempt + 1}: "${s.line.slice(0, 50)}..."`);
        dur = await tts(s.line, p);
        console.log(`  -> ${dur.toFixed(2)}s`);
        break;
      } catch (e) {
        console.log(`  attempt ${attempt + 1} failed: ${e.message.slice(0, 200)}`);
        await new Promise((r) => setTimeout(r, 3500 * (attempt + 1)));
        attempt++;
      }
    }
    if (typeof dur !== "number") {
      console.error(`Scene ${s.id} TTS failed after retries. Fallback to est.`);
      dur = s.durationSec;
    }
    timeline.push({ id: s.id, durationSec: dur });
  }

  // Concatenate to one voiceover.wav using ffmpeg
  const fileList = path.join(AUDIO, "concat.txt");
  fs.writeFileSync(
    fileList,
    timeline.map((t) => `file 'vo-${t.id}.wav'`).join("\n"),
    "utf8",
  );
  const voOut = path.join(AUDIO, "voiceover.wav");
  execSync(`ffmpeg -y -f concat -safe 0 -i "${fileList}" -c copy "${voOut}"`, { stdio: "inherit" });
  const total = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${voOut}"`).toString().trim();
  console.log(`\nMaster voiceover -> ${voOut} (${total}s)`);

  // Per-scene cumulative startSec for sequencing on the master timeline
  let acc = 0;
  const out = timeline.map((t) => {
    const start = acc;
    acc += t.durationSec;
    return { ...t, startSec: start, endSec: acc };
  });
  fs.writeFileSync(
    path.join(__dirname, "..", "src", "timeline.json"),
    JSON.stringify({ fps: 30, scenes: out }, null, 2),
  );
  console.log("Wrote src/timeline.json with exact measured timings.");
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
