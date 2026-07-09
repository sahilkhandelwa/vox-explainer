#!/usr/bin/env node
// Smart background poller: one TTS-call per ~75 seconds (below the
// free-tier per-minute quota observed empirically). Rings a file as
// each scene TTS lands. Updates vo-manifest.json + timeline.json
// + voiceover.wav continuously so the master render can pick them up.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = "/root/vox-explainer";
const AUDIO = path.join(ROOT, "public", "audio");
const API_KEY = fs.readFileSync("/root/.config/opencode/.env","utf8").split("\n").find(l=>l.startsWith("GOOGLE_API_KEY=")).split("=")[1].trim();
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;

// Parse script.ts for scene ids and lines in order
const src = fs.readFileSync(path.join(ROOT, "scripts", "script.ts"), "utf8");
const rx = /{\s*id:\s*"([^"]+)".*?line:\s*"((?:[^"\\]|\\.)*)".*?durationSec:\s*([\d.]+)/gs;
const scenes = [];
let m;
while ((m = rx.exec(src)) !== null) scenes.push({ id: m[1], line: m[2].replace(/\\"/g,'"'), durationSec: parseFloat(m[3]) });

const pcmToWav = (pcm, rate=24000, ch=1, sw=2) => {
  const l = pcm.length;
  const b = Buffer.alloc(44+l);
  b.write("RIFF",0); b.writeUInt32LE(36+l,4); b.write("WAVE",8); b.write("fmt ",12);
  b.writeUInt32LE(16,16); b.writeUInt16LE(1,20); b.writeUInt16LE(ch,22);
  b.writeUInt32LE(rate,24); b.writeUInt32LE(rate*ch*sw,28); b.writeUInt16LE(ch*sw,32);
  b.writeUInt16LE(sw*8,34); b.write("data",36); b.writeUInt32LE(l,40); pcm.copy(b,44); return b;
};

const refreshTimelineAndConcat = () => {
  let acc = 0;
  const out = scenes.map((s) => {
    let dur = s.durationSec;
    const p = path.join(AUDIO, `vo-${s.id}.wav`);
    if (fs.existsSync(p)) dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim());
    const start = acc;
    acc += dur;
    return { id: s.id, durationSec: dur, startSec: start, endSec: acc };
  });
  fs.writeFileSync(path.join(ROOT, "src", "timeline.json"), JSON.stringify({ fps: 30, scenes: out }, null, 2));

  const avail = scenes.filter((s) => fs.existsSync(path.join(AUDIO, `vo-${s.id}.wav`))).map((s) => s.id);
  fs.writeFileSync(path.join(ROOT, "src", "vo-manifest.json"), JSON.stringify({ scenes: avail }, null, 2));

  if (avail.length > 0) {
    const cat = path.join(AUDIO, "concat.txt");
    fs.writeFileSync(cat, avail.map((id) => `file 'vo-${id}.wav'`).join("\n"));
    const voOut = path.join(AUDIO, "voiceover.wav");
    try {
      execSync(`ffmpeg -y -f concat -safe 0 -i "${cat}" -c copy "${voOut}" 2>/dev/null`, { stdio: "ignore" });
      console.log(`  timeline + vo concat refreshed (${avail.length}/${scenes.length})`);
    } catch (e) { console.log("  timeline refreshed; concat skipped:", e.message.slice(0,100)); }
  }
};

const tts = async (line, outFile) => {
  const body = {
    contents: [{ parts: [{ text: `In a calm, serious cinematic British documentary narrator voice, narrate: "${line}"` }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "kore" } } },
    },
  };
  const r = await fetch(URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (r.status === 429) return { retry: true };
  if (!r.ok) {
    const t = await r.text();
    return { error: `HTTP ${r.status}: ${t.slice(0,150)}` };
  }
  const d = await r.json();
  const part = d.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) return { retry: true };
  fs.writeFileSync(outFile, pcmToWav(Buffer.from(part.inlineData.data, "base64")));
  return { ok: true };
};

const main = async () => {
  console.log("Smart TTS poller: one call per 75 seconds until all scenes filled.");
  for (let i = 0; i < 200; i++) {
    const missing = scenes.filter((s) => !fs.existsSync(path.join(AUDIO, `vo-${s.id}.wav`)));
    if (missing.length === 0) {
      console.log("\n*** ALL TTS SCENES COMPLETE ***");
      break;
    }
    const t = missing[0];
    const p = path.join(AUDIO, `vo-${t.id}.wav`);
    console.log(`\n[${new Date().toISOString()}] try ${t.id}: "${t.line.slice(0, 60)}..."`);
    const r = await tts(t.line, p);
    if (r.ok) console.log(`  ✓ ${t.id} ready`);
    else if (r.retry) console.log("  ⏳ quota-held, will retry");
    else console.log("  ✗ " + r.error);
    refreshTimelineAndConcat();
    await new Promise((res) => setTimeout(res, 75_000));
  }
  refreshTimelineAndConcat();
  console.log("Poller finished.");
};

main().catch((e) => { console.error(e); process.exit(1); });
