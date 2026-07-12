// ── Streaming Wars scenes — pure React/TSX, no external assets ───
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

const SpringText: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f - delay, fps, config: { damping: 12, mass: 0.9, stiffness: 110 } });
  const dy = interpolate(pop, [0, 1], [120, 0]);
  const op = interpolate(f, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp" });
  return <div style={{ opacity: op, transform: `translateY(${dy}px)`, ...style }}>{children}</div>;
};

export const SceneIntro: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <SpringText delay={4}>
      <div style={{ fontSize: 100, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 8, marginBottom: 24 }}>THE</div>
    </SpringText>
    <SpringText delay={14}>
      <div style={{ fontSize: 160, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 12, textShadow: "4px 4px 0 #1a1a1a" }}>STREAMING</div>
    </SpringText>
    <SpringText delay={24}>
      <div style={{ fontSize: 160, fontFamily: "Georgia,serif", fontWeight: 800, color: "#1a1a1a", letterSpacing: 12 }}>WARS</div>
    </SpringText>
    <SpringText delay={36}>
      <div style={{ fontSize: 32, fontFamily: "Georgia,serif", color: "#888", letterSpacing: 4, marginTop: 40 }}>Who's winning the content battle?</div>
    </SpringText>
  </div>
);

export const SceneNetflix: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pop = spring({ frame: f - 4, fps, config: { damping: 10, mass: 1, stiffness: 100 } });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringText delay={4}>
        <div style={{ fontSize: 48, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 4, marginBottom: 40 }}>NETFLIX CONTENT SPEND 2023</div>
      </SpringText>
      <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])})` }}>
        <SpringText delay={10}>
          <div style={{ fontSize: 280, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 4, textShadow: "6px 6px 0 #1a1a1a" }}>$17B</div>
        </SpringText>
      </div>
      <SpringText delay={24}>
        <div style={{ width: 200, height: 6, background: "#E50914", margin: "24px 0" }} />
      </SpringText>
      <SpringText delay={30}>
        <div style={{ fontSize: 40, fontFamily: "Georgia,serif", color: "#1a1a1a", letterSpacing: 2 }}>More than any other streamer</div>
      </SpringText>
    </div>
  );
};

export const SceneBars: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const bars = [
    { name: "Netflix", val: 17, color: "#E50914", delay: 4 },
    { name: "Amazon", val: 12, color: "#1a1a1a", delay: 12 },
    { name: "Disney+", val: 8, color: "#E50914", delay: 20 },
    { name: "Apple TV+", val: 6, color: "#333", delay: 28 },
    { name: "HBO Max", val: 4, color: "#E50914", delay: 36 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringText delay={2}>
        <div style={{ fontSize: 52, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 4, marginBottom: 60 }}>ANNUAL CONTENT SPENDING</div>
      </SpringText>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-end", height: 580 }}>
        {bars.map((b) => {
          const h = spring({ frame: f - b.delay, fps, config: { damping: 15, mass: 1, stiffness: 80 } }) * (b.val / 17 * 500);
          return (
            <div key={b.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 48, fontFamily: "Georgia,serif", fontWeight: 700, color: "white", marginBottom: 8, position: "relative", top: -40 }}>${b.val}B</div>
              <div style={{ width: 160, height: h, background: b.color, borderRadius: 4 }} />
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
  const data = [
    { year: "2018", val: 120, delay: 4 },
    { year: "2020", val: 95, delay: 16 },
    { year: "2022", val: 70, delay: 28 },
    { year: "2024", val: 45, delay: 40 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringText delay={2}>
        <div style={{ fontSize: 52, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 4, marginBottom: 60 }}>TRADITIONAL TV SUBSCRIBERS (US)</div>
      </SpringText>
      <div style={{ display: "flex", gap: 60, alignItems: "flex-end", height: 500 }}>
        {data.map((d) => {
          const h = spring({ frame: f - d.delay, fps, config: { damping: 18, mass: 1.2, stiffness: 60 } }) * (d.val / 120 * 400);
          return (
            <div key={d.year} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 40, fontFamily: "Georgia,serif", fontWeight: 700, color: "#E50914", marginBottom: 8, position: "relative", top: -40 }}>{d.val}M</div>
              <div style={{ width: 180, height: h, background: "#E50914", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
              <div style={{ fontSize: 28, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", marginTop: 16 }}>{d.year}</div>
            </div>
          );
        })}
      </div>
      <SpringText delay={52}>
        <div style={{ fontSize: 36, fontFamily: "Georgia,serif", fontWeight: 700, color: "#E50914", letterSpacing: 2, marginTop: 60 }}>CORD-CUTTING ACCELERATING</div>
      </SpringText>
    </div>
  );
};

export const SceneDebt: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <SpringText delay={4}>
      <div style={{ fontSize: 64, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 4, marginBottom: 40 }}>COMBINED STREAMING DEBT</div>
    </SpringText>
    <SpringText delay={10}>
      <div style={{ fontSize: 280, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 4, textShadow: "6px 6px 0 #1a1a1a" }}>$200B+</div>
    </SpringText>
    <SpringText delay={20}>
      <div style={{ width: 300, height: 6, background: "#E50914", margin: "24px 0" }} />
    </SpringText>
    <SpringText delay={26}>
      <div style={{ fontSize: 36, fontFamily: "Georgia,serif", color: "#1a1a1a", letterSpacing: 2, textAlign: "center", maxWidth: 800 }}>
        Content debt is growing faster than revenue across the industry
      </div>
    </SpringText>
  </div>
);

export const SceneShare: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const items = [
    { label: "Netflix 38%", color: "#1a1a1a", pct: 38, delay: 4 },
    { label: "Amazon 22%", color: "#E50914", pct: 22, delay: 14 },
    { label: "Disney+ 15%", color: "#333", pct: 15, delay: 24 },
    { label: "Apple TV+ 12%", color: "#E50914", pct: 12, delay: 34 },
    { label: "Others 13%", color: "#666", pct: 13, delay: 44 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <SpringText delay={2}>
        <div style={{ fontSize: 52, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 4, marginBottom: 60 }}>STREAMING MARKET SHARE</div>
      </SpringText>
      {items.map((item) => {
        const w = spring({ frame: f - item.delay, fps, config: { damping: 14, mass: 0.9, stiffness: 90 } }) * (item.pct * 12);
        return (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, width: 900, opacity: interpolate(f, [item.delay, item.delay + 8], [0, 1], { extrapolateLeft: "clamp" }) }}>
            <div style={{ width: 140, fontSize: 24, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", textAlign: "right" }}>{item.label}</div>
            <div style={{ height: 40, width: w, background: item.color, borderRadius: 4, minWidth: 4 }} />
          </div>
        );
      })}
    </div>
  );
};

export const SceneDebtSpiral: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <SpringText delay={4}>
      <div style={{ fontSize: 48, fontFamily: "Georgia,serif", fontWeight: 700, color: "#888", letterSpacing: 4, marginBottom: 40 }}>NETFLIX LONG-TERM DEBT</div>
    </SpringText>
    <SpringText delay={10}>
      <div style={{ fontSize: 280, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 4, textShadow: "6px 6px 0 #1a1a1a" }}>$14B</div>
    </SpringText>
    <SpringText delay={22}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
        <div style={{ width: 4, height: 80, background: "#E50914" }} />
        <div style={{ width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: "24px solid #E50914" }} />
      </div>
    </SpringText>
    <SpringText delay={30}>
      <div style={{ fontSize: 36, fontFamily: "Georgia,serif", color: "#1a1a1a", letterSpacing: 2, marginTop: 40 }}>Content debt growing faster than revenue</div>
    </SpringText>
  </div>
);

export const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [0, 20, 100, 130], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: fade }}>
      <SpringText delay={4}>
        <div style={{ fontSize: 100, fontFamily: "Georgia,serif", fontWeight: 700, color: "#1a1a1a", letterSpacing: 8 }}>THE STREAMING</div>
      </SpringText>
      <SpringText delay={14}>
        <div style={{ fontSize: 160, fontFamily: "Georgia,serif", fontWeight: 800, color: "#E50914", letterSpacing: 12, textShadow: "4px 4px 0 #1a1a1a" }}>BUBBLE</div>
      </SpringText>
      <SpringText delay={30}>
        <div style={{ fontSize: 40, fontFamily: "Georgia,serif", fontWeight: 400, color: "#888", letterSpacing: 4, marginTop: 60, fontStyle: "italic" }}>How long until it bursts?</div>
      </SpringText>
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
