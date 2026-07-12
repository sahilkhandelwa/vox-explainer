import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from "remotion";

const SpringDiv: React.FC<{ delay?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ children, delay = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - delay, fps, config: { damping: 12, mass: 0.9, stiffness: 110 } });
  const dy = interpolate(pop, [0, 1], [60, 0]);
  const op = interpolate(f, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp" });
  return <div style={{ opacity: op, transform: `translateY(${dy}px)`, ...style }}>{children}</div>;
};

const A = (p: string) => staticFile(`/assets/foreground/${p}`);

const BigNumber: React.FC<{ n: string; sub?: string; delay?: number; color?: string }> = ({ n, sub, delay = 4, color = "#E50914" }) => (
  <SpringDiv delay={delay} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ fontSize: 220, fontFamily: "Georgia,serif", fontWeight: 800, color, letterSpacing: 4, textShadow: "4px 4px 0 rgba(0,0,0,0.15)" }}>{n}</div>
    {sub && <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#666", marginTop: 8, letterSpacing: 2 }}>{sub}</div>}
  </SpringDiv>
);

const NetflixLogo = () => <Img src={A("netflix-logo.png")} style={{ width: 500, objectFit: "contain" }} />;
const AmazonLogo = () => <Img src={A("amazon-logo.png")} style={{ width: 460, objectFit: "contain" }} />;
const DisneyLogo = () => <Img src={A("disney-logo.png")} style={{ width: 420, objectFit: "contain" }} />;
const TvImg = () => <Img src={A("tv.png")} style={{ height: 360, objectFit: "contain" }} />;
const SofaImg = () => <Img src={A("sofa.png")} style={{ height: 300, objectFit: "contain" }} />;

const Title: React.FC<{ text: string; size?: number; color?: string }> = ({ text, size = 48, color = "#1a1a1a" }) => (
  <div style={{ fontSize: size, fontFamily: "Georgia,serif", fontWeight: 700, color, letterSpacing: 3, textAlign: "center" }}>{text}</div>
);

const Divider = () => <div style={{ width: 120, height: 3, background: "#E50914", margin: "16px auto" }} />;

export const SceneIntro: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <SpringDiv delay={2}>
      <TvImg />
    </SpringDiv>
    <SpringDiv delay={10}>
      <Title text="THE STREAMING WARS" size={100} color="#E50914" />
    </SpringDiv>
    <SpringDiv delay={22}>
      <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#888", letterSpacing: 4, fontStyle: "italic" }}>Who's spending what to win your screen?</div>
    </SpringDiv>
  </div>
);

export const SceneNetflix: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <SpringDiv delay={2}>
      <Title text="NETFLIX CONTENT SPEND 2023" size={44} color="#888" />
    </SpringDiv>
    <SpringDiv delay={10}>
      <NetflixLogo />
    </SpringDiv>
    <Divider />
    <BigNumber n="$17B" sub="Annual content budget" delay={18} />
    <SpringDiv delay={32}>
      <div style={{ fontSize: 32, fontFamily: "Georgia,serif", color: "#1a1a1a", marginTop: 20, letterSpacing: 2 }}>More than any other streamer</div>
    </SpringDiv>
  </div>
);

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
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringDiv delay={2}>
        <Title text="ANNUAL CONTENT SPENDING" size={48} />
      </SpringDiv>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-end", height: 500, marginTop: 40 }}>
        {bars.map((b) => {
          const h = spring({ frame: f - b.delay, fps, config: { damping: 15, mass: 1, stiffness: 80 } }) * (b.val / 17 * 400);
          return (
            <div key={b.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 44, fontFamily: "Georgia,serif", fontWeight: 700, color: b.color, marginBottom: 8, position: "relative", top: -36 }}>${b.val}B</div>
              <div style={{ width: 160, height: h, background: b.color, borderRadius: "4px 4px 0 0", opacity: 0.85 }} />
              <div style={{ fontSize: 24, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", marginTop: 16 }}>{b.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SceneCordCut: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringDiv delay={2}>
        <Title text="CORD CUTTING ACCELERATES" size={44} color="#888" />
      </SpringDiv>
      <div style={{ display: "flex", gap: 60, alignItems: "center", marginTop: 20 }}>
        <SpringDiv delay={8}>
          <TvImg />
        </SpringDiv>
        <SpringDiv delay={14}>
          <div style={{ fontSize: 80, fontFamily: "Georgia,serif", color: "#E50914", fontWeight: 700 }}>→</div>
        </SpringDiv>
        <SpringDiv delay={20}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <SofaImg />
            <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#888", marginTop: 8 }}>Streaming</div>
          </div>
        </SpringDiv>
      </div>
      <SpringDiv delay={32}>
        <div style={{ fontSize: 80, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 2, marginTop: 30 }}>180M+</div>
        <div style={{ fontSize: 26, fontFamily: "Georgia,serif", color: "#666", letterSpacing: 2 }}>US streaming subscribers in 2024</div>
      </SpringDiv>
    </div>
  );
};

export const SceneDebt: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <SpringDiv delay={4}>
      <Title text="COMBINED STREAMING DEBT" size={52} color="#888" />
    </SpringDiv>
    <BigNumber n="$200B+" sub="Total industry content debt" delay={10} />
    <SpringDiv delay={22}>
      <div style={{ display: "flex", gap: 30, marginTop: 30 }}>
        <NetflixLogo />
        <AmazonLogo />
        <DisneyLogo />
      </div>
    </SpringDiv>
    <SpringDiv delay={34}>
      <div style={{ fontSize: 28, fontFamily: "Georgia,serif", color: "#1a1a1a", marginTop: 20, textAlign: "center", maxWidth: 700 }}>
        Content spending far outpaces revenue across the industry
      </div>
    </SpringDiv>
  </div>
);

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
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringDiv delay={2}>
        <Title text="STREAMING MARKET SHARE" size={48} />
      </SpringDiv>
      <div style={{ width: 900, marginTop: 40 }}>
        {items.map((item) => {
          const w = spring({ frame: f - item.delay, fps, config: { damping: 14, mass: 0.9, stiffness: 90 } }) * (item.val * 9);
          return (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16, opacity: interpolate(f, [item.delay, item.delay + 8], [0, 1], { extrapolateLeft: "clamp" }) }}>
              <div style={{ width: 160, fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", textAlign: "right" }}>{item.label}</div>
              {item.logo && <Img src={A(item.logo)} style={{ height: 28, objectFit: "contain" }} />}
              <div style={{ height: 32, width: w, background: "#E50914", borderRadius: 4, minWidth: 4 }} />
              <div style={{ fontSize: 22, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a" }}>{item.val}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SceneDebtSpiral: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const logos = [
    { src: "netflix-logo.png", delay: 2, x: -200, y: -120 },
    { src: "amazon-logo.png", delay: 10, x: 0, y: 0 },
    { src: "disney-logo.png", delay: 18, x: 200, y: -120 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringDiv delay={2}>
        <Title text="THE DEBT SPIRAL" size={52} color="#888" />
      </SpringDiv>
      <div style={{ position: "relative", width: 700, height: 300, marginTop: 30 }}>
        {logos.map((l) => {
          const s = spring({ frame: f - l.delay, fps, config: { damping: 10, mass: 1, stiffness: 80 } });
          return (
            <div key={l.src} style={{ position: "absolute", left: 250 + l.x, top: 150 + l.y, transform: `translate(-50%,-50%) scale(${s}) rotate(${interpolate(s, [0, 1], [-15, 0])}deg)`, opacity: s }}>
              <Img src={A(l.src)} style={{ width: 320, objectFit: "contain" }} />
            </div>
          );
        })}
      </div>
      <BigNumber n="$14B" sub="Netflix long-term debt" delay={30} />
    </div>
  );
};

export const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 20, 100, 130], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fade }}>
      <SpringDiv delay={4}>
        <TvImg />
      </SpringDiv>
      <SpringDiv delay={14}>
        <Title text="THE STREAMING BUBBLE" size={100} color="#E50914" />
      </SpringDiv>
      <SpringDiv delay={28}>
        <div style={{ fontSize: 36, fontFamily: "Georgia,serif", fontWeight: 400, color: "#888", fontStyle: "italic", letterSpacing: 4 }}>How long until it bursts?</div>
      </SpringDiv>
    </div>
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
