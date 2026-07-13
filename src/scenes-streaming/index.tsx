import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, AbsoluteFill } from "remotion";
import { ParallaxScene, Float } from "../VoxSystem";

// ── animation helpers ──────────────────────────────────────────────

/** Spring-up from below with fade-in */
const Rise: React.FC<{ delay?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ children, delay = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - delay, fps, config: { damping: 12, mass: 0.9, stiffness: 110 } });
  const dy = interpolate(pop, [0, 1], [60, 0]);
  const op = interpolate(f, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp" });
  return <div style={{ opacity: op, transform: `translateY(${dy}px)`, ...style }}>{children}</div>;
};

/** Sequential staggered word reveal */
const WordReveal: React.FC<{ text: string; delay?: number; charDelay?: number; style?: React.CSSProperties }> = ({
  text, delay = 0, charDelay = 4, style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", ...style }}>
      {text.split(" ").map((word, i) => {
        const pop = spring({ frame: f - delay - i * charDelay, fps, config: { damping: 10, mass: 0.7, stiffness: 150 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(f, [delay + i * charDelay, delay + i * charDelay + 4], [0, 1], { extrapolateLeft: "clamp" }),
              transform: `scale(${pop})`,
              marginRight: 12,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

const A = (p: string) => staticFile(`/assets/foreground/${p}`);

const BigNumber: React.FC<{ n: string; sub?: string; delay?: number; color?: string }> = ({ n, sub, delay = 4, color = "#E50914" }) => (
  <Rise delay={delay} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <Float amp={3} period={90} phase={delay}>
      <div style={{ fontSize: 220, fontFamily: "Georgia,serif", fontWeight: 800, color, letterSpacing: 4, textShadow: "4px 4px 0 rgba(0,0,0,0.15)" }}>{n}</div>
    </Float>
    {sub && <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#666", marginTop: 8, letterSpacing: 2 }}>{sub}</div>}
  </Rise>
);

const NetflixLogo = (w = 500) => <Img src={A("netflix-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const AmazonLogo = (w = 460) => <Img src={A("amazon-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const DisneyLogo = (w = 420) => <Img src={A("disney-logo.png")} style={{ width: w, objectFit: "contain" }} />;
const TvImg = (h = 360) => <Img src={A("tv.png")} style={{ height: h, objectFit: "contain" }} />;
const SofaImg = (h = 300) => <Img src={A("sofa.png")} style={{ height: h, objectFit: "contain" }} />;

const Title: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 48, color = "#1a1a1a" }) => (
  <div style={{ fontSize: size, fontFamily: "Georgia,serif", fontWeight: 700, color, letterSpacing: 3, textAlign: "center" }}>{text}</div>
);

const Divider = () => <div style={{ width: 120, height: 3, background: "#E50914", margin: "16px auto" }} />;

// ── Scene 1: INTRO ─────────────────────────────────────────────────
export const SceneIntro: React.FC = () => (
  <ParallaxScene>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Rise delay={2}>
        <Float amp={4} period={100}>
{TvImg(340)}
          </Float>
      </Rise>
      <Rise delay={10}>
        <WordReveal text="THE STREAMING WARS" delay={0} charDelay={6}
          style={{ fontSize: 100, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 8, textShadow: "4px 4px 0 #1a1a1a" }}
        />
      </Rise>
      <Rise delay={24}>
        <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#888", letterSpacing: 4, fontStyle: "italic" }}>
          Who's spending what to win your screen?
        </div>
      </Rise>
    </AbsoluteFill>
  </ParallaxScene>
);

// ── Scene 2: NETFLIX SPEND ─────────────────────────────────────────
export const SceneNetflix: React.FC = () => (
  <ParallaxScene>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Rise delay={2}>
        <Title text="NETFLIX CONTENT SPEND 2023" size={44} color="#888" />
      </Rise>
      <Rise delay={10}>
        <Float amp={3} period={110} phase={10}>
          {NetflixLogo()}
        </Float>
      </Rise>
      <Divider />
      <BigNumber n="$17B" sub="Annual content budget" delay={18} />
      <Rise delay={32}>
        <Float amp={2} period={90} phase={20}>
          <div style={{ fontSize: 32, fontFamily: "Georgia,serif", color: "#1a1a1a", marginTop: 20, letterSpacing: 2 }}>More than any other streamer</div>
        </Float>
      </Rise>
    </AbsoluteFill>
  </ParallaxScene>
);

// ── Scene 3: CONTENT SPENDING BARS ─────────────────────────────────
export const SceneBars: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const bars = [
    { name: "Netflix", val: 17, color: "#1a1a1a", delay: 4 },
    { name: "Amazon", val: 12, color: "#E50914", delay: 12 },
    { name: "Disney+", val: 8, color: "#1a1a1a", delay: 20 },
    { name: "Apple TV+", val: 5, color: "#E50914", delay: 28 },
    { name: "HBO Max", val: 4, color: "#333", delay: 36 },
  ];
  return (
    <ParallaxScene>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Rise delay={2}>
          <Title text="ANNUAL CONTENT SPENDING" size={48} />
        </Rise>
        <div style={{ display: "flex", gap: 30, alignItems: "flex-end", height: 500, marginTop: 40 }}>
          {bars.map((b) => {
            const h = spring({ frame: f - b.delay, fps, config: { damping: 15, mass: 1, stiffness: 80 } }) * (b.val / 17 * 400);
            return (
              <div key={b.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 160 }}>
                <div style={{ fontSize: 44, fontFamily: "Georgia,serif", fontWeight: 700, color: b.color, marginBottom: 8, position: "relative", top: -36 }}>${b.val}B</div>
                <div style={{ width: "100%", height: h, background: b.color, borderRadius: "4px 4px 0 0", opacity: 0.85 }} />
                <div style={{ fontSize: 24, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", marginTop: 16 }}>{b.name}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </ParallaxScene>
  );
};

// ── Scene 4: CORD CUTTING ──────────────────────────────────────────
export const SceneCordCut: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(interpolate(f, [20, 60], [0, 180]));
  return (
    <ParallaxScene>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Rise delay={2}>
          <Title text="CORD CUTTING ACCELERATES" size={44} color="#888" />
        </Rise>
        <div style={{ display: "flex", gap: 60, alignItems: "center", marginTop: 20 }}>
          <Rise delay={8}>
            <Float amp={3} period={90} phase={0}>
  {TvImg(280)}
            </Float>
          </Rise>
          <Rise delay={14}>
            <Float amp={2} period={80} phase={15}>
              <div style={{ fontSize: 80, fontFamily: "Georgia,serif", color: "#E50914", fontWeight: 700 }}>→</div>
            </Float>
          </Rise>
          <Rise delay={20}>
            <Float amp={3} period={100} phase={30}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
{SofaImg(250)}
                <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#888", marginTop: 8 }}>Streaming</div>
              </div>
            </Float>
          </Rise>
        </div>
        <Rise delay={32}>
          <Float amp={4} period={120} phase={45}>
            <div style={{ fontSize: 100, fontFamily: "Georgia,serif", fontWeight: 900, color: "#E50914", letterSpacing: 2, marginTop: 30 }}>{n}M+</div>
          </Float>
          <div style={{ fontSize: 26, fontFamily: "Georgia,serif", color: "#666", letterSpacing: 2 }}>US streaming subscribers in 2024</div>
        </Rise>
      </AbsoluteFill>
    </ParallaxScene>
  );
};

// ── Scene 5: STREAMING DEBT ────────────────────────────────────────
export const SceneDebt: React.FC = () => (
  <ParallaxScene>
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Rise delay={4}>
        <Title text="COMBINED STREAMING DEBT" size={52} color="#888" />
      </Rise>
      <BigNumber n="$200B+" sub="Total industry content debt" delay={10} />
      <Rise delay={22}>
        <div style={{ display: "flex", gap: 30, marginTop: 30 }}>
          <Float amp={3} period={100} phase={0}>{NetflixLogo(300)}</Float>
          <Float amp={3} period={120} phase={30}>{AmazonLogo(280)}</Float>
          <Float amp={3} period={90} phase={60}>{DisneyLogo(260)}</Float>
        </div>
      </Rise>
      <Rise delay={34}>
        <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#1a1a1a", marginTop: 20, textAlign: "center", maxWidth: 700 }}>
          Content spending far outpaces revenue across the industry
        </div>
      </Rise>
    </AbsoluteFill>
  </ParallaxScene>
);

// ── Scene 6: MARKET SHARE ──────────────────────────────────────────
export const SceneShare: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const items = [
    { label: "Netflix", val: 38, logo: "netflix-logo.png", delay: 4 },
    { label: "Amazon Prime", val: 22, logo: "amazon-logo.png", delay: 14 },
    { label: "Disney+", val: 15, logo: "disney-logo.png", delay: 24 },
    { label: "Apple TV+", val: 12, logo: null, delay: 34 },
    { label: "Others", val: 13, logo: null, delay: 44 },
  ];
  return (
    <ParallaxScene>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Rise delay={2}>
          <Title text="STREAMING MARKET SHARE" size={48} />
        </Rise>
        <div style={{ width: 900, marginTop: 40 }}>
          {items.map((item) => {
            const w = spring({ frame: f - item.delay, fps, config: { damping: 14, mass: 0.9, stiffness: 90 } }) * (item.val * 9);
            const op = interpolate(f, [item.delay, item.delay + 8], [0, 1], { extrapolateLeft: "clamp" });
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16, opacity: op }}>
                <div style={{ width: 160, fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", textAlign: "right" }}>{item.label}</div>
                {item.logo && <Img src={A(item.logo)} style={{ height: 28, objectFit: "contain" }} />}
                <div style={{ height: 32, width: w, background: "#E50914", borderRadius: 4, minWidth: 4 }} />
                <div style={{ fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a" }}>{item.val}%</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </ParallaxScene>
  );
};

// ── Scene 7: DEBT SPIRAL ───────────────────────────────────────────
export const SceneDebtSpiral: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const logos = [
    { src: "netflix-logo.png", delay: 2, x: -200, y: -120 },
    { src: "amazon-logo.png", delay: 10, x: 0, y: 0 },
    { src: "disney-logo.png", delay: 18, x: 200, y: -120 },
  ];
  return (
    <ParallaxScene>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Rise delay={2}>
          <Title text="THE DEBT SPIRAL" size={52} color="#888" />
        </Rise>
        <div style={{ position: "relative", width: 700, height: 300, marginTop: 30 }}>
          {logos.map((l, idx) => {
            const s = spring({ frame: f - l.delay, fps, config: { damping: 10, mass: 1, stiffness: 80 } });
            const float = Math.sin(((f + idx * 40) / 100) * Math.PI * 2) * 4;
            return (
              <div key={l.src} style={{ position: "absolute", left: 250 + l.x, top: 150 + l.y + float, transform: `translate(-50%,-50%) scale(${s})`, opacity: s }}>
                <Img src={A(l.src)} style={{ width: 320, objectFit: "contain" }} />
              </div>
            );
          })}
        </div>
        <BigNumber n="$14B" sub="Netflix long-term debt" delay={30} />
      </AbsoluteFill>
    </ParallaxScene>
  );
};

// ── Scene 8: OUTRO ─────────────────────────────────────────────────
export const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 20, 100, 130], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ParallaxScene>
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fade }}>
        <Rise delay={4}>
          <Float amp={4} period={100}>
  {TvImg(320)}
          </Float>
        </Rise>
        <Rise delay={14}>
          <WordReveal text="THE STREAMING BUBBLE" delay={0} charDelay={5}
            style={{ fontSize: 100, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 8, textShadow: "4px 4px 0 #1a1a1a" }}
          />
        </Rise>
        <Rise delay={30}>
          <div style={{ fontSize: 36, fontFamily: "Georgia,serif", fontWeight: 400, color: "#888", fontStyle: "italic", letterSpacing: 4 }}>How long until it bursts?</div>
        </Rise>
      </AbsoluteFill>
    </ParallaxScene>
  );
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
