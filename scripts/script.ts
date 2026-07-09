// ─── AUDIO-FIRST SCRIPT & TIMELINE ──────────────────────────────
// Each beat of the Vox-style voiceover maps to a visual scene.
// Durations are estimated narration seconds (will be re-synced to
// measured TTS timing during post). FRAME numbers below assume
// 30 fps (Remotion default for cinematic motion graphics).

export const FPS = 30;

export interface SceneSpec {
  id: string;            // scene slug
  index: number;         // order
  line: string;          // exact voiceover text fed to TTS
  durationSec: number;   // estimated narration length (sec)
  anim: {
    background: { kind: string; args: Record<string, unknown> };
    foreground: { kind: string; args: Record<string, unknown> };
    midground: Array<{ kind: string; args: Record<string, unknown> }>;
  };
}

// Each scene: a single sentence/beat of the voiceover. Visual assets
// are programmatic SVG to keep render self-contained & reproducible.
export const SCENES: SceneSpec[] = [
  {
    id: "peace-deal",
    index: 0,
    line: "The US and Iran are signing a peace deal.",
    durationSec: 5.0,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "white-house", args: { scale: 1.8 } },
      midground: [
        { kind: "head-trump", args: { scale: 1.4, x: -180 } },
        { kind: "head-khamenei", args: { scale: 1.4, x: 180 } },
      ],
    },
  },
  {
    id: "empire-downfall",
    index: 1,
    line: "But the downfall of the American Empire has already begun.",
    durationSec: 5.2,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "eagle-falling", args: {} },
      midground: [{ kind: "head-trump", args: { scale: 1.6, x: -120 } }],
    },
  },
  {
    id: "strait-hostage",
    index: 2,
    line: "And it started when a far weaker nation held the Strait of Hormuz hostage.",
    durationSec: 6.4,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "strait-map", args: {} },
      midground: [{ kind: "oil-tanker", args: { scale: 1.1, x: 0 } }],
    },
  },
  {
    id: "oil-prices",
    index: 3,
    line: "Oil prices skyrocketed to $116 a barrel,",
    durationSec: 4.8,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "barrel", args: { scale: 1.4 } },
      midground: [{ kind: "number-ticker", args: { from: 60, to: 116, prefix: "$" } }],
    },
  },
  {
    id: "inflation-high",
    index: 4,
    line: "pushing American inflation to a three-year high,",
    durationSec: 4.0,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "inflation-chart", args: {} },
      midground: [{ kind: "us-map", args: { scale: 1.0 } }],
    },
  },
  {
    id: "debt-39-trillion",
    index: 5,
    line: "and it hit a nation already owing nearly $39 trillion in debt,",
    durationSec: 5.8,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "debt-ticker", args: { from: 5, to: 39, prefix: "$", suffix: "T", size: 220 } },
      midground: [{ kind: "capitol", args: { scale: 1.5 } }],
    },
  },
  {
    id: "debt-bigger-than-economy",
    index: 6,
    line: "a debt now bigger than its entire economy.",
    durationSec: 4.4,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "scale-balance", args: {} },
      midground: [],
    },
  },
  {
    id: "interest-military",
    index: 7,
    line: "where the interest alone costs more than its entire military.",
    durationSec: 5.4,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "comparison-bars", args: {} },
      midground: [{ kind: "tanks", args: { scale: 1.0 } }],
    },
  },
  {
    id: "world-leaving-dollar",
    index: 8,
    line: "And the world is quietly leaving the dollar behind.",
    durationSec: 5.0,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "globe-dollar", args: {} },
      midground: [{ kind: "head-trump", args: { scale: 1.3, x: 240 } }],
    },
  },
  {
    id: "empires-end-with-bill",
    index: 9,
    line: "Empires don't end with a war.",
    durationSec: 3.2,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "quote-card", args: { text: "EMPIRES DON'T END WITH A WAR.", kicker: "PART 1" } },
      midground: [],
    },
  },
  {
    id: "empires-end-bill",
    index: 10,
    line: "They end with a bill they can no longer pay.",
    durationSec: 4.6,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "quote-card", args: { text: "THEY END WITH A BILL THEY CAN NO LONGER PAY.", kicker: "PART 2", red: true } },
      midground: [],
    },
  },
  {
    id: "outro",
    index: 11,
    line: "This is how the American era quietly closes.",
    durationSec: 4.2,
    anim: {
      background: { kind: "paper", args: { tone: "warm" } },
      foreground: { kind: "outro-card", args: {} },
      midground: [],
    },
  },
];

// TOTAL: estimated ~58 seconds of narration (after exact TTS timing
// measured in scripts/measure-tts.mjs, this gets re-synced).
