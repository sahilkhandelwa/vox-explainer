// ── Streaming Wars — TikTok flash edit style ───────────────────────
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, AbsoluteFill } from "remotion";

// ── helpers ────────────────────────────────────────────────────────

/** Fast zoom-in from massive scale — core flash edit trick */
const ZoomIn: React.FC<{
  delay?: number;
  fromScale?: number;
  stiffness?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ delay = 0, fromScale = 3, stiffness = 300, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - delay, fps, config: { damping: 6, mass: 0.5, stiffness } });
  const s = interpolate(pop, [0, 1], [fromScale, 1]);
  const op = interpolate(f, [delay, delay + 2], [0, 1], { extrapolateLeft: "clamp" });
  return <div style={{ opacity: op, transform: `scale(${s.toFixed(4)})`, ...style }}>{children}</div>;
};

/** Fly in from direction with speed */
const FlyIn: React.FC<{
  from?: "left" | "right" | "top" | "bottom";
  delay?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ from = "bottom", delay = 0, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - delay, fps, config: { damping: 7, mass: 0.6, stiffness: 280 } });
  const op = interpolate(f, [delay, delay + 2], [0, 1], { extrapolateLeft: "clamp" });
  const dist = 600;
  let dx = 0, dy = 0;
  if (from === "left") dx = interpolate(pop, [0, 1], [-dist, 0]);
  if (from === "right") dx = interpolate(pop, [0, 1], [dist, 0]);
  if (from === "top") dy = interpolate(pop, [0, 1], [-dist, 0]);
  if (from === "bottom") dy = interpolate(pop, [0, 1], [dist, 0]);
  return <div style={{ opacity: op, transform: `translate(${dx.toFixed(0)}px,${dy.toFixed(0)}px)`, ...style }}>{children}</div>;
};

/** Pop text — each character bounces in */
const KineticText: React.FC<{
  text: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...style }}>
      {text.split("").map((ch, i) => {
        const pop = spring({ frame: f - delay - i * 1.5, fps, config: { damping: 5, mass: 0.5, stiffness: 400 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(f, [delay + i * 1.5, delay + i * 1.5 + 1], [0, 1], { extrapolateLeft: "clamp" }),
              transform: `scale(${pop}) translateY(${interpolate(pop, [0, 1], [-120, 0])}px)`,
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </div>
  );
};

/** Count-up number */
const CountUp: React.FC<{ to: number; delay?: number; suffix?: string; style?: React.CSSProperties }> = ({
  to, delay = 0, suffix = "", style
}) => {
  const f = useCurrentFrame();
  const val = Math.round(interpolate(f, [delay, delay + 20], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pop = spring({ frame: f - delay, fps: 30, config: { damping: 6, mass: 0.5, stiffness: 300 } });
  return (
    <div style={{ transform: `scale(${pop})`, ...style }}>
      {val}{suffix}
    </div>
  );
};

const A = (p: string) => staticFile(`/assets/foreground/${p}`);
const NetflixLogo = (w = 400) => <Img src={A("netflix-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const AmazonLogo = (w = 350) => <Img src={A("amazon-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const DisneyLogo = (w = 320) => <Img src={A("disney-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const TvImg = (h = 300) => <Img src={A("tv.png")} style={{ height: h, objectFit: "contain" }} />;
const SofaImg = (h = 250) => <Img src={A("sofa.png")} style={{ height: h, objectFit: "contain" }} />;

const Bg = () => <AbsoluteFill style={{ background: "#0d0d0d" }} />;

const RED = "#E50914";

// ── Scene 1: INTRO (60f / 2s) ──────────────────────────────────────
export const SceneIntro: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0d0d" }}>
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ZoomIn delay={0} fromScale={4} stiffness={350}>
        {TvImg(420)}
      </ZoomIn>
      <ZoomIn delay={8} fromScale={5} stiffness={400}>
        <KineticText text="THE" delay={0} style={{ fontSize: 80, fontFamily: "Georgia,serif", fontWeight: 700, color: "#fff", letterSpacing: 16 }} />
      </ZoomIn>
      <ZoomIn delay={18} fromScale={4} stiffness={350}>
        <div style={{ fontSize: 140, fontFamily: "Georgia,serif", fontWeight: 900, color: RED, letterSpacing: 16, textShadow: "0 0 40px rgba(229,9,20,0.6)" }}>
          STREAMING
        </div>
      </ZoomIn>
      <ZoomIn delay={30} fromScale={5} stiffness={400}>
        <div style={{ fontSize: 160, fontFamily: "Georgia,serif", fontWeight: 900, color: "#fff", letterSpacing: 18 }}>
          WARS
        </div>
      </ZoomIn>
      <FlyIn from="bottom" delay={44} style={{ marginTop: 40 }}>
        <div style={{ fontSize: 20, fontFamily: "Georgia,serif", color: "#666", letterSpacing: 8 }}>WHO WILL WIN?</div>
      </FlyIn>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ── Scene 2: NETFLIX SPEND (55f / ~1.8s) ───────────────────────────
export const SceneNetflix: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0d0d" }}>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <ZoomIn delay={0} fromScale={5} stiffness={400}>
        {NetflixLogo(580)}
      </ZoomIn>
      <ZoomIn delay={10} fromScale={6} stiffness={450}>
        <div style={{ fontSize: 60, fontFamily: "Georgia,serif", fontWeight: 700, color: "#666", letterSpacing: 4, marginTop: 20 }}>
          CONTENT SPEND 2023
        </div>
      </ZoomIn>
      <FlyIn from="left" delay={20}>
        <div style={{ display: "flex", alignItems: "baseline", marginTop: 20 }}>
          <KineticText text="$17" delay={0} style={{ fontSize: 280, fontFamily: "Georgia,serif", fontWeight: 900, color: RED, textShadow: "0 0 60px rgba(229,9,20,0.5)" }} />
          <FlyIn from="bottom" delay={34}>
            <span style={{ fontSize: 80, fontFamily: "Georgia,serif", fontWeight: 700, color: "#fff", marginLeft: 16 }}>BILLION</span>
          </FlyIn>
        </div>
      </FlyIn>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ── Scene 3: CONTENT BARS (60f / 2s) ──────────────────────────────
export const SceneBars: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [
    { name: "Netflix", val: 17, d: 2, c: RED },
    { name: "Amazon", val: 12, d: 8, c: "#FF9900" },
    { name: "Disney+", val: 8, d: 14, c: "#113CCF" },
    { name: "Apple TV+", val: 5, d: 20, c: "#fff" },
  ];
  return (
    <AbsoluteFill style={{ background: "#0d0d0d" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <ZoomIn delay={0} fromScale={3} stiffness={300}>
          <div style={{ fontSize: 44, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 6, marginBottom: 40 }}>
            WHO SPENDS THE MOST?
          </div>
        </ZoomIn>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end", height: 460 }}>
          {bars.map((b) => {
            const h = spring({ frame: f - b.d, fps, config: { damping: 5, mass: 0.5, stiffness: 400 } }) * (b.val / 17 * 400);
            return (
              <div key={b.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 140 }}>
                <div style={{ fontSize: 50, fontFamily: "Georgia,serif", fontWeight: 900, color: RED, position: "relative", top: -40 }}>
                  ${b.val}B
                </div>
                <div style={{ width: "100%", height: h, background: b.c, borderRadius: "6px 6px 0 0", boxShadow: `0 0 30px ${b.c}40` }} />
                <div style={{ fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#ccc", marginTop: 14 }}>
                  {b.name}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 4: CORD CUTTING (55f / ~1.8s) ────────────────────────────
export const SceneCordCut: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(interpolate(f, [16, 44], [0, 180]));
  return (
    <AbsoluteFill style={{ background: "#0d0d0d" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 60, alignItems: "center", marginBottom: 20 }}>
          <FlyIn from="left" delay={0}>
            <div style={{ opacity: 0.4 }}>{TvImg(260)}</div>
            <div style={{ textAlign: "center", fontSize: 24, fontFamily: "Georgia,serif", color: "#666", marginTop: 8, letterSpacing: 3 }}>TV</div>
          </FlyIn>
          <ZoomIn delay={6} fromScale={8} stiffness={500}>
            <div style={{ fontSize: 120, fontFamily: "Georgia,serif", color: RED, fontWeight: 900, textShadow: "0 0 40px rgba(229,9,20,0.8)" }}>→</div>
          </ZoomIn>
          <FlyIn from="right" delay={0}>
            <div style={{ opacity: 0.4 }}>{SofaImg(210)}</div>
            <div style={{ textAlign: "center", fontSize: 24, fontFamily: "Georgia,serif", color: "#666", marginTop: 8, letterSpacing: 3 }}>STREAMING</div>
          </FlyIn>
        </div>
        <ZoomIn delay={14} fromScale={4} stiffness={350}>
          <div style={{ fontSize: 60, fontFamily: "Georgia,serif", fontWeight: 900, color: "#fff", letterSpacing: 8, marginTop: 10 }}>
            CORD-CUTTING
          </div>
        </ZoomIn>
        <CountUp to={180} delay={22} suffix="M+" style={{ fontSize: 160, fontFamily: "Georgia,serif", fontWeight: 900, color: RED, textShadow: "0 0 60px rgba(229,9,20,0.5)", marginTop: 10 }} />
        <FlyIn from="bottom" delay={38}>
          <div style={{ fontSize: 22, fontFamily: "Georgia,serif", color: "#888", letterSpacing: 3 }}>US streaming subscribers</div>
        </FlyIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 5: STREAMING DEBT (45f / 1.5s) ──────────────────────────
export const SceneDebt: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0d0d" }}>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
        <FlyIn from="left" delay={0}>{NetflixLogo(180)}</FlyIn>
        <FlyIn from="top" delay={4}>{AmazonLogo(160)}</FlyIn>
        <FlyIn from="right" delay={8}>{DisneyLogo(150)}</FlyIn>
      </div>
      <ZoomIn delay={12} fromScale={5} stiffness={400}>
        <div style={{ fontSize: 240, fontFamily: "Georgia,serif", fontWeight: 900, color: RED, textShadow: "0 0 80px rgba(229,9,20,0.6), 8px 8px 0 #000" }}>
          $200B+
        </div>
      </ZoomIn>
      <FlyIn from="bottom" delay={26}>
        <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#888", letterSpacing: 4, marginTop: 10 }}>
          COMBINED CONTENT DEBT
        </div>
      </FlyIn>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ── Scene 6: MARKET SHARE (45f / 1.5s) ─────────────────────────────
export const SceneShare: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    { label: "Netflix", val: 38, d: 2 },
    { label: "Amazon", val: 22, d: 6 },
    { label: "Disney+", val: 15, d: 10 },
    { label: "Apple TV+", val: 12, d: 14 },
    { label: "Others", val: 13, d: 18 },
  ];
  return (
    <AbsoluteFill style={{ background: "#0d0d0d" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <ZoomIn delay={0} fromScale={3} stiffness={300}>
          <div style={{ fontSize: 40, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 6, marginBottom: 30 }}>
            MARKET SHARE
          </div>
        </ZoomIn>
        <div style={{ width: 800 }}>
          {items.map((item) => {
            const w = spring({ frame: f - item.d, fps, config: { damping: 5, mass: 0.5, stiffness: 400 } }) * (item.val * 10);
            const op = interpolate(f, [item.d, item.d + 3], [0, 1], { extrapolateLeft: "clamp" });
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14, opacity: op }}>
                <div style={{ width: 140, fontSize: 20, fontFamily: "Georgia,serif", fontWeight: 700, color: "#ccc", textAlign: "right" }}>{item.label}</div>
                <div style={{ height: 38, width: w, background: RED, borderRadius: 4, boxShadow: `0 0 20px ${RED}60`, minWidth: 4 }} />
                <div style={{ fontSize: 26, fontFamily: "Georgia,serif", fontWeight: 900, color: "#fff", width: 60 }}>{item.val}%</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 7: DEBT SPIRAL (45f / 1.5s) ─────────────────────────────
export const SceneDebtSpiral: React.FC = () => (
  <AbsoluteFill style={{ background: "#0d0d0d" }}>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <ZoomIn delay={0} fromScale={3} stiffness={280}>
        <div style={{ fontSize: 36, fontFamily: "Georgia,serif", fontWeight: 700, color: "#666", letterSpacing: 6, marginBottom: 20 }}>
          NETFLIX DEBT
        </div>
      </ZoomIn>
      <div style={{ position: "relative", width: 600, height: 300 }}>
        <FlyIn from="left" delay={4}>
          <div style={{ position: "absolute", left: 0, top: 0 }}>{NetflixLogo(260)}</div>
        </FlyIn>
        <FlyIn from="right" delay={12}>
          <div style={{ position: "absolute", right: 0, bottom: 40 }}>{NetflixLogo(200)}</div>
        </FlyIn>
        <ZoomIn delay={22} fromScale={6} stiffness={500}>
          <div style={{ position: "absolute", left: 160, top: 60, fontSize: 160, fontFamily: "Georgia,serif", fontWeight: 900, color: RED, textShadow: "0 0 50px rgba(229,9,20,0.7), 6px 6px 0 #000" }}>
            $14B
          </div>
        </ZoomIn>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

// ── Scene 8: OUTRO (45f / 1.5s) ───────────────────────────────────
export const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [30, 45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#0d0d0d" }}>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <ZoomIn delay={0} fromScale={5} stiffness={350}>
          {TvImg(380)}
        </ZoomIn>
        <FlyIn from="left" delay={8}>
          <div style={{ fontSize: 80, fontFamily: "Georgia,serif", fontWeight: 700, color: "#fff", letterSpacing: 12 }}>THE</div>
        </FlyIn>
        <FlyIn from="right" delay={14}>
          <div style={{ fontSize: 130, fontFamily: "Georgia,serif", fontWeight: 900, color: RED, letterSpacing: 16, textShadow: "0 0 40px rgba(229,9,20,0.6)" }}>
            STREAMING
          </div>
        </FlyIn>
        <ZoomIn delay={22} fromScale={5} stiffness={400}>
          <div style={{ fontSize: 140, fontFamily: "Georgia,serif", fontWeight: 900, color: "#fff", letterSpacing: 16 }}>
            BUBBLE
          </div>
        </ZoomIn>
        <div style={{ opacity: fade, position: "absolute", bottom: 120 }}>
          <div style={{ fontSize: 28, fontFamily: "Georgia,serif", fontStyle: "italic", color: "#666", letterSpacing: 6 }}>
            How long until it bursts?
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SCENE_LENGTHS: Record<string, number> = {
  intro: 60,
  "netflix-spend": 55,
  "content-chart": 60,
  "cord-cutting": 55,
  "streaming-debt": 45,
  "market-share": 45,
  "debt-spiral": 45,
  outro: 45,
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
