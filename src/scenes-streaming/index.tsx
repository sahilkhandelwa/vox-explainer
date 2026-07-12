// ── Streaming Wars — flash edit style ──────────────────────────────
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, AbsoluteFill, Sequence } from "remotion";

// ── animation helpers ──────────────────────────────────────────────

/** Slam in from direction with overshoot spring — flash edit style */
const Slam: React.FC<{
  from?: "left" | "right" | "top" | "bottom" | "zoom";
  delay?: number;
  stiffness?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ from = "zoom", delay = 0, stiffness = 200, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - delay, fps, config: { damping: 8, mass: 0.6, stiffness } });
  const op = interpolate(f, [delay, delay + 3], [0, 1], { extrapolateLeft: "clamp" });

  let transform = "";
  const d = 800;
  switch (from) {
    case "left":
      transform = `translateX(${interpolate(pop, [0, 1], [-d, 0])}px)`;
      break;
    case "right":
      transform = `translateX(${interpolate(pop, [0, 1], [d, 0])}px)`;
      break;
    case "top":
      transform = `translateY(${interpolate(pop, [0, 1], [-d, 0])}px)`;
      break;
    case "bottom":
      transform = `translateY(${interpolate(pop, [0, 1], [d, 0])}px)`;
      break;
    default: // zoom
      transform = `scale(${interpolate(pop, [0, 1], [2.2, 1])})`;
  }
  return <div style={{ opacity: op, transform, ...style }}>{children}</div>;
};

/** Single char pop-in (for kinetic typography effect) */
const CharPop: React.FC<{ text: string; delay?: number; style?: React.CSSProperties }> = ({ text, delay = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", ...style }}>
      {text.split("").map((ch, i) => {
        const pop = spring({ frame: f - delay - i * 2, fps, config: { damping: 7, mass: 0.7, stiffness: 250 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(f, [delay + i * 2, delay + i * 2 + 2], [0, 1], { extrapolateLeft: "clamp" }),
              transform: `scale(${pop}) translateY(${interpolate(pop, [0, 1], [-80, 0])}px)`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </div>
  );
};

/** Camera push — subtle zoom in over the scene duration */
const CameraPush: React.FC<{ children: React.ReactNode; amount?: number }> = ({ children, amount = 0.04 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(f, [0, durationInFrames], [1, 1 + amount], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ width: "100%", height: "100%", transform: `scale(${s})` }}>{children}</div>;
};

/** Quick flash overlay at end of scene (use in master) */
export const FlashOverlay: React.FC<{ since: number }> = ({ since }) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [since, since + 2, since + 4], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "white", opacity: op, pointerEvents: "none", zIndex: 999 }} />;
};

// ── asset helper ───────────────────────────────────────────────────
const A = (p: string) => staticFile(`/assets/foreground/${p}`);

const NetflixLogo = (w = 400) => <Img src={A("netflix-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const AmazonLogo = (w = 350) => <Img src={A("amazon-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const DisneyLogo = (w = 320) => <Img src={A("disney-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const TvImg = (h = 300) => <Img src={A("tv.png")} style={{ height: h, objectFit: "contain" }} />;
const SofaImg = (h = 250) => <Img src={A("sofa.png")} style={{ height: h, objectFit: "contain" }} />;

// ── Scene 1: INTRO (2.5s / 75f) ────────────────────────────────────
const S1_LEN = 75;
export const SceneIntro: React.FC = () => (
  <CameraPush amount={0.05}>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Slam from="top" delay={0} stiffness={300}>
        <TvImg(340) />
      </Slam>
      <Slam from="left" delay={8} stiffness={260}>
        <div style={{ fontSize: 90, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 12 }}>THE</div>
      </Slam>
      <Slam from="right" delay={16} stiffness={280}>
        <div style={{ fontSize: 130, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 14, textShadow: "6px 6px 0 #1a1a1a" }}>STREAMING</div>
      </Slam>
      <Slam from="top" delay={24} stiffness={350}>
        <div style={{ fontSize: 140, fontFamily: "Georgia,serif", fontWeight: 900, color: "#1a1a1a", letterSpacing: 14 }}>WARS</div>
      </Slam>
      <Slam from="bottom" delay={36} stiffness={200}>
        <div style={{ fontSize: 26, fontFamily: "Georgia,serif", color: "#999", letterSpacing: 6 }}>↓ SCROLL TO WIN ↓</div>
      </Slam>
    </AbsoluteFill>
  </CameraPush>
);

// ── Scene 2: NETFLIX SPEND (2.5s / 75f) ────────────────────────────
const S2_LEN = 75;
export const SceneNetflix: React.FC = () => (
  <CameraPush amount={0.04}>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Slam from="zoom" delay={0} stiffness={400}>
        {NetflixLogo(520)}
      </Slam>
      <Slam from="left" delay={12} stiffness={300}>
        <div style={{ fontSize: 52, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 4 }}>ANNUAL CONTENT SPEND</div>
      </Slam>
      <Slam from="right" delay={18} stiffness={350}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <CharPop text="$17" delay={24} style={{ fontSize: 260, fontFamily: "Georgia,serif", fontWeight: 900, color: "#E50914" }} />
          <Slam from="zoom" delay={34} stiffness={400}>
            <span style={{ fontSize: 80, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", marginLeft: 12 }}>BILLION</span>
          </Slam>
        </div>
      </Slam>
      <Slam from="bottom" delay={44} stiffness={200}>
        <div style={{ fontSize: 26, fontFamily: "Georgia,serif", color: "#1a1a1a", letterSpacing: 2 }}>More than any other streamer</div>
      </Slam>
    </AbsoluteFill>
  </CameraPush>
);

// ── Scene 3: CONTENT SPENDING BARS (2.5s / 75f) ────────────────────
const S3_LEN = 75;
export const SceneBars: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [
    { name: "Netflix", val: 17, d: 2 },
    { name: "Amazon", val: 12, d: 6 },
    { name: "Disney+", val: 8, d: 10 },
    { name: "Apple TV+", val: 5, d: 14 },
    { name: "HBO Max", val: 4, d: 18 },
  ];
  return (
    <CameraPush amount={0.04}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Slam from="top" delay={0} stiffness={250}>
          <div style={{ fontSize: 40, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 4, marginBottom: 30 }}>WHO SPENDS THE MOST?</div>
        </Slam>
        <div style={{ display: "flex", gap: 25, alignItems: "flex-end", height: 480 }}>
          {bars.map((b) => {
            const h = spring({ frame: f - b.d, fps, config: { damping: 6, mass: 0.8, stiffness: 300 } }) * (b.val / 17 * 400);
            return (
              <div key={b.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 130 }}>
                <div style={{ fontSize: 40, fontFamily: "Georgia,serif", fontWeight: 700, color: "#E50914", position: "relative", top: -32 }}>${b.val}B</div>
                <div style={{ width: "100%", height: h, background: "#E50914", borderRadius: "4px 4px 0 0", opacity: 0.9, transform: `scaleX(${interpolate(f, [b.d, b.d + 6], [0, 1])})` }} />
                <div style={{ fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", marginTop: 12 }}>{b.name}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </CameraPush>
  );
};

// ── Scene 4: CORD CUTTING (2.5s / 75f) ─────────────────────────────
const S4_LEN = 75;
export const SceneCordCut: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(interpolate(f, [20, 60], [0, 180]));
  return (
    <CameraPush amount={0.05}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 50, alignItems: "center", marginBottom: 30 }}>
          <Slam from="left" delay={0} stiffness={350}>
            <TvImg(280) />
          </Slam>
          <Slam from="top" delay={6} stiffness={500}>
            <div style={{ fontSize: 100, fontFamily: "Georgia,serif", color: "#E50914", fontWeight: 900 }}>✕</div>
          </Slam>
          <Slam from="right" delay={0} stiffness={350}>
            <SofaImg(230) />
          </Slam>
        </div>
        <Slam from="bottom" delay={12} stiffness={300}>
          <div style={{ fontSize: 36, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 3 }}>CORD-CUTTING</div>
        </Slam>
        <Slam from="zoom" delay={20} stiffness={400}>
          <div style={{ fontSize: 100, fontFamily: "Georgia,serif", fontWeight: 900, color: "#E50914" }}>
            {n}M+
          </div>
        </Slam>
        <Slam from="right" delay={36} stiffness={200}>
          <div style={{ fontSize: 24, fontFamily: "Georgia,serif", color: "#1a1a1a", letterSpacing: 2 }}>US streaming subscribers</div>
        </Slam>
      </AbsoluteFill>
    </CameraPush>
  );
};

// ── Scene 5: STREAMING DEBT (2s / 60f) ──────────────────────────────
const S5_LEN = 60;
export const SceneDebt: React.FC = () => (
  <CameraPush amount={0.04}>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Slam from="left" delay={0} stiffness={300}>{NetflixLogo(200)}</Slam>
        <Slam from="top" delay={4} stiffness={300}>{AmazonLogo(180)}</Slam>
        <Slam from="right" delay={8} stiffness={300}>{DisneyLogo(170)}</Slam>
      </div>
      <Slam from="zoom" delay={14} stiffness={350}>
        <div style={{ fontSize: 220, fontFamily: "Georgia,serif", fontWeight: 900, color: "#E50914", textShadow: "8px 8px 0 #1a1a1a" }}>$200B+</div>
      </Slam>
      <Slam from="bottom" delay={28} stiffness={200}>
        <div style={{ fontSize: 24, fontFamily: "Georgia,serif", color: "#1a1a1a", letterSpacing: 2, textAlign: "center", maxWidth: 600 }}>
          Combined industry content debt
        </div>
      </Slam>
      <Slam from="bottom" delay={38} stiffness={150}>
        <div style={{ fontSize: 30, fontFamily: "Georgia,serif", color: "#E50914", letterSpacing: 1, marginTop: 8 }}>
          Revenue ≠ Spending
        </div>
      </Slam>
    </AbsoluteFill>
  </CameraPush>
);

// ── Scene 6: MARKET SHARE (2.5s / 75f) ─────────────────────────────
const S6_LEN = 75;
export const SceneShare: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { label: "Netflix", val: 38, d: 2 },
    { label: "Amazon Prime", val: 22, d: 8 },
    { label: "Disney+", val: 15, d: 14 },
    { label: "Apple TV+", val: 12, d: 20 },
    { label: "Others", val: 13, d: 26 },
  ];
  return (
    <CameraPush amount={0.04}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Slam from="top" delay={0} stiffness={250}>
          <div style={{ fontSize: 40, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 4, marginBottom: 30 }}>MARKET SHARE</div>
        </Slam>
        <div style={{ width: 880 }}>
          {items.map((item) => {
            const w = spring({ frame: f - item.d, fps, config: { damping: 7, mass: 0.7, stiffness: 350 } }) * (item.val * 9);
            const op = interpolate(f, [item.d, item.d + 4], [0, 1], { extrapolateLeft: "clamp" });
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, opacity: op }}>
                <div style={{ width: 150, fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", textAlign: "right" }}>{item.label}</div>
                <div style={{ height: 32, width: w, background: "#E50914", borderRadius: 4, minWidth: 4 }} />
                <div style={{ fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", width: 50 }}>{item.val}%</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </CameraPush>
  );
};

// ── Scene 7: DEBT SPIRAL (2s / 60f) ────────────────────────────────
const S7_LEN = 60;
export const SceneDebtSpiral: React.FC = () => (
  <CameraPush amount={0.05}>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Slam from="top" delay={0} stiffness={250}>
        <div style={{ fontSize: 36, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 4, marginBottom: 20 }}>NETFLIX DEBT</div>
      </Slam>
      <div style={{ position: "relative", width: 600, height: 360 }}>
        <Slam from="left" delay={4} stiffness={250}>
          <div style={{ position: "absolute", left: 0, top: 20 }}>{NetflixLogo(280)}</div>
        </Slam>
        <Slam from="right" delay={14} stiffness={250}>
          <div style={{ position: "absolute", right: 0, top: 160 }}>{NetflixLogo(200)}</div>
        </Slam>
        <Slam from="zoom" delay={24} stiffness={400}>
          <div style={{ position: "absolute", left: 150, top: 70, fontSize: 160, fontFamily: "Georgia,serif", fontWeight: 900, color: "#E50914", textShadow: "6px 6px 0 #1a1a1a" }}>
            $14B
          </div>
        </Slam>
      </div>
      <Slam from="bottom" delay={38} stiffness={200}>
        <div style={{ fontSize: 26, fontFamily: "Georgia,serif", color: "#1a1a1a", letterSpacing: 2 }}>Content debt growing faster than revenue</div>
      </Slam>
    </AbsoluteFill>
  </CameraPush>
);

// ── Scene 8: OUTRO (2s / 60f) ──────────────────────────────────────
const S8_LEN = 60;
export const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [40, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <CameraPush amount={0.06}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Slam from="zoom" delay={0} stiffness={300}>
            <TvImg(320) />
          </Slam>
          <Slam from="left" delay={8} stiffness={280}>
            <div style={{ fontSize: 80, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 10 }}>THE</div>
          </Slam>
          <Slam from="right" delay={14} stiffness={300}>
            <div style={{ fontSize: 120, fontFamily: "Georgia,serif", fontWeight: 900, color: "#E50914", letterSpacing: 14, textShadow: "6px 6px 0 #1a1a1a" }}>STREAMING</div>
          </Slam>
          <Slam from="top" delay={22} stiffness={400}>
            <div style={{ fontSize: 130, fontFamily: "Georgia,serif", fontWeight: 900, color: "#1a1a1a", letterSpacing: 14 }}>BUBBLE</div>
          </Slam>
          <Slam from="bottom" delay={34} stiffness={200}>
            <div style={{ fontSize: 34, fontFamily: "Georgia,serif", fontStyle: "italic", color: "#999", letterSpacing: 4 }}>How long until it bursts?</div>
          </Slam>
        </AbsoluteFill>
      </CameraPush>
    </AbsoluteFill>
  );
};

export const SCENE_LENGTHS: Record<string, number> = {
  intro: S1_LEN,
  "netflix-spend": S2_LEN,
  "content-chart": S3_LEN,
  "cord-cutting": S4_LEN,
  "streaming-debt": S5_LEN,
  "market-share": S6_LEN,
  "debt-spiral": S7_LEN,
  outro: S8_LEN,
};

export const STREAMING_SCENES: Record<string, React.FC> = {
  intro: SceneIntro,
  "netflix-spend": SceneNetflix,
  "content-chart": SceneBars,
  "cord-cutting": SceneCordCut,
  "streaming-debt": SceneDebt,
  "market-share": SceneShare,
  "debt-spiral": SceneDebtSpiral,
  outro: SceneOutro,
};
