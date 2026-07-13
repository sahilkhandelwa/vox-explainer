// ── Vox visual system primitives ───────────────────────────────────
import React from "react";
import { Img, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = staticFile("/assets/background/paper-warm.svg");
const HT = staticFile("/assets/midground/halftone-mask.svg");

// Static shared papery background (used identically across every scene).
export const VoxBackground: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <Img
    src={BG}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity,
      filter: "saturate(0.9)",
    }}
  />
);

// ── Cutout: silhouette + halftone dots + crimson offset stroke ─────
// Spring-pops up from below on scene entry. Staggered entry handled
// by the caller via the `delay` prop.
export const Cutout: React.FC<{
  src: string;            // raw /assets/... path; we staticFile() it here
  scale?: number;
  x?: number;
  y?: number;
  delay?: number;
  springFrom?: number;
  offset?: number;
}> = ({ src, scale = 1, x = 0, y = 0, delay = 0, springFrom = 360, offset = 12 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const assetURL = staticFile(src.startsWith("/assets") ? src : `/assets/midground/${src}`);

  const pop = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.9, stiffness: 110 },
  });
  const dy = interpolate(pop, [0, 1], [springFrom, 0]);
  const opacity = interpolate(frame, [delay, delay + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tf = `translate(${x}px, ${y + dy}px) scale(${scale}) translateZ(0)`;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none", transform: tf, opacity }}>
      {/* Signature crimson offset: duplicate silhouette in solid red, offset on x/y */}
      <div style={{ position: "absolute", left: offset, top: offset, width: 1920, height: 1080 }}>
        <Img src={assetURL} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0)" }} />
        <div style={{ position: "absolute", inset: 0, background: "#d22b2b", mixBlendMode: "multiply", pointerEvents: "none" }} />
      </div>
      {/* Second softer offset for added depth */}
      <div style={{ position: "absolute", left: offset * 1.7, top: offset * 1.7, width: 1920, height: 1080, opacity: 0.55 }}>
        <Img src={assetURL} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0)" }} />
        <div style={{ position: "absolute", inset: 0, background: "#a01916", mixBlendMode: "multiply", pointerEvents: "none" }} />
      </div>
      {/* Real cutout silhouette on top */}
      <Img src={assetURL} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, objectFit: "contain" }} />
      {/* Halftone overlay, masked to silhouette via blend modes */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, mixBlendMode: "multiply", opacity: 0.7 }}>
        <Img src={HT} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <Img src={assetURL} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "destination-in" }} />
      </div>
    </div>
  );
};

// ── FocalStructure: crisp foreground illustration ──────────────────
// Subtle upward spring + settle (heavier feel than cutout).
export const FocalStructure: React.FC<{
  src: string;
  scale?: number;
  x?: number;
  y?: number;
  delay?: number;
  springFrom?: number;
}> = ({ src, scale = 1, x = 0, y = 0, delay = 0, springFrom = 240 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const assetURL = staticFile(src.startsWith("/assets") ? src : `/assets/foreground/${src}`);
  const pop = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 1.1, stiffness: 90 } });
  const dy = interpolate(pop, [0, 1], [springFrom, 0]);
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none", transform: `translate(${x}px, ${y + dy}px) scale(${scale})`, opacity }}>
      <Img src={assetURL} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
};

// ── 3-Layer Parallax system ────────────────────────────────────────

/** Gentle sine-wave float for depth / breathing life into static elements */
export const Float: React.FC<{
  amp?: number;      // pixels of float (default 6)
  period?: number;   // frames for full cycle (default 120)
  phase?: number;    // offset in frames
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ amp = 6, period = 120, phase = 0, style, children }) => {
  const f = useCurrentFrame();
  const y = Math.sin(((f + phase) / period) * Math.PI * 2) * amp;
  return <div style={{ transform: `translateY(${y.toFixed(1)}px)`, ...style }}>{children}</div>;
};

/** Parallax-wrapped scene — background drifts slow, midground normal, foreground fast */
export const ParallaxScene: React.FC<{
  bgDrift?: number;     // background drift amount (default 4)
  fgDrift?: number;     // foreground drift amount (default 12)
  children?: React.ReactNode;
}> = ({ bgDrift = 4, fgDrift = 12, children }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = f / Math.max(durationInFrames, 1);
  const bgX = interpolate(progress, [0, 1], [0, bgDrift], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fgX = interpolate(progress, [0, 1], [0, fgDrift], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Background layer — paper drifts slowly */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${bgX.toFixed(1)}px)`, zIndex: 0 }}>
        <VoxBackground opacity={1} />
      </div>
      {/* Midground layer — main content */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {children}
      </div>
      {/* Foreground layer — floating accent elements */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", transform: `translateX(${fgX.toFixed(1)}px)` }}>
        <ForegroundAccents />
      </div>
      {/* Vignette overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(60,40,20,0.6) 100%)", opacity: 0.15 }} />
    </div>
  );
};

/** Floating decorative foreground elements — CSS shapes that drift */
const ForegroundAccents: React.FC = () => {
  const f = useCurrentFrame();
  const dots = [
    { x: 80, y: 120, r: 6, period: 100, phase: 0, color: "#E50914" },
    { x: 1700, y: 200, r: 4, period: 130, phase: 20, color: "#1a1a1a" },
    { x: 120, y: 800, r: 5, period: 110, phase: 40, color: "#E50914" },
    { x: 1760, y: 750, r: 3, period: 90, phase: 60, color: "#888" },
    { x: 960, y: 50, r: 4, period: 140, phase: 10, color: "#1a1a1a" },
    { x: 960, y: 1000, r: 5, period: 120, phase: 30, color: "#E50914" },
  ];
  const lines = [
    { x1: 140, y1: 60, x2: 220, y2: 100, period: 150, phase: 0 },
    { x1: 1640, y1: 920, x2: 1780, y2: 960, period: 120, phase: 30 },
  ];
  return (
    <>
      {dots.map((d, i) => {
        const floatY = Math.sin(((f + d.phase) / d.period) * Math.PI * 2) * 8;
        return (
          <div
            key={"d" + i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y + floatY,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: "50%",
              background: d.color,
              opacity: 0.2 + Math.sin(((f + d.phase) / d.period) * Math.PI * 2) * 0.1,
            }}
          />
        );
      })}
      {lines.map((l, i) => {
        const dx = Math.sin(((f + l.phase) / l.period) * Math.PI * 2) * 4;
        const len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1);
        const angle = Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
        return (
          <div
            key={"l" + i}
            style={{
              position: "absolute",
              left: l.x1,
              top: l.y1 + dx,
              width: len,
              height: 2,
              background: "#1a1a1a",
              opacity: 0.06,
              transform: `rotate(${angle}rad)`,
              transformOrigin: "0 50%",
            }}
          />
        );
      })}
    </>
  );
};
