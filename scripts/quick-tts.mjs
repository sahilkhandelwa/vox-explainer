import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const AUDIO = path.join(process.cwd(), "public", "audio");
const API_KEY = fs.readFileSync("/root/.config/opencode/.env","utf8").split("\n").find(l=>l.startsWith("GOOGLE_API_KEY=")).split("=")[1].trim();
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`;
const pcmToWav = (pcm,rate=24000,ch=1,sw=2)=>{const l=pcm.length;const b=Buffer.alloc(44+l);b.write("RIFF",0);b.writeUInt32LE(36+l,4);b.write("WAVE",8);b.write("fmt ",12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(ch,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*ch*sw,28);b.writeUInt16LE(ch*sw,32);b.writeUInt16LE(sw*8,34);b.write("data",36);b.writeUInt32LE(l,40);pcm.copy(b,44);return b;};
const missing = [
  ["oil-prices", "Oil prices skyrocketed to $116 a barrel."],
  ["debt-39-trillion", "and it hit a nation already owing nearly thirty-nine trillion in debt"],
  ["interest-military", "where the interest alone costs more than its entire military."],
  ["world-leaving-dollar", "And the world is quietly leaving the dollar behind."],
  ["empires-end-with-bill", "Empires don't end with a war."],
  ["empires-end-bill", "They end with a bill they can no longer pay."],
  ["outro", "This is how the American era quietly closes."],
];
for (const [id,line] of missing) {
  const p = path.join(AUDIO, `vo-${id}.wav`);
  if (fs.existsSync(p)) { console.log(`exists ${id}`); continue; }
  let attempt=0;
  while (attempt<3) {
    attempt++;
    try {
      const body = { contents:[{parts:[{text:`In a calm, serious cinematic British documentary narrator voice, narrate: "${line}"`}]}], generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:"kore"}}}} };
      const r = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if (r.status===429){console.log(`⏳ ${id} quota-held`);await new Promise(res=>setTimeout(res,8000));continue;}
      const d = await r.json();
      const part = d.candidates?.[0]?.content?.parts?.[0];
      if (!part?.inlineData?.data){console.log(`✗ ${id} no audio`);await new Promise(res=>setTimeout(res,4000));continue;}
      fs.writeFileSync(p, pcmToWav(Buffer.from(part.inlineData.data,"base64")));
      const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${p}"`).toString().trim());
      console.log(`✓ ${id} -> ${dur.toFixed(2)}s`);
      break;
    } catch(e){console.log(`✗ ${id} ${e.message.slice(0,200)}`);await new Promise(res=>setTimeout(res,5000));}
  }
  await new Promise(res=>setTimeout(res,1200));
}
console.log("DONE. Files:");
console.log(fs.readdirSync(AUDIO).filter(f=>/^vo-/.test(f)).join("\n"));
