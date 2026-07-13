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
export const Cutout: React.FC<{
  src: string;
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
      <div style={{ position: "absolute", left: offset, top: offset, width: 1920, height: 1080 }}>
        <Img src={assetURL} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0)" }} />
        <div style={{ position: "absolute", inset: 0, background: "#d22b2b", mixBlendMode: "multiply", pointerEvents: "none" }} />
      </div>
      <div style={{ position: "absolute", left: offset * 1.7, top: offset * 1.7, width: 1920, height: 1080, opacity: 0.55 }}>
        <Img src={assetURL} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0)" }} />
        <div style={{ position: "absolute", inset: 0, background: "#a01916", mixBlendMode: "multiply", pointerEvents: "none" }} />
      </div>
      <Img src={assetURL} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, objectFit: "contain" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, mixBlendMode: "multiply", opacity: 0.7 }}>
        <Img src={HT} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <Img src={assetURL} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "destination-in" }} />
      </div>
    </div>
  );
};

// ── FocalStructure: crisp foreground illustration ──────────────────
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

// ── 3-Layer Paper Parallax System ──────────────────────────────────

/** Paper-like drop shadow — makes elements look like physical cutouts */
export const PaperShadow: React.FC<{
  depth?: "flat" | "raised" | "floating"; // controls shadow size
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ depth = "raised", style, children }) => {
  const shadow = depth === "flat"
    ? "0 2px 4px rgba(0,0,0,0.08)"
    : depth === "floating"
    ? "0 12px 28px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)"
    : "0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)";
  const bg = depth === "flat" ? "rgba(255,255,255,0)" : "rgba(255,255,255,0)";
  return (
    <div style={{ filter: `drop-shadow(${shadow})`, ...style }}>
      {children}
    </div>
  );
};

/** Hook: returns parallax transform values for a given z-layer */
export function useParallax(zIndex: number): {
  x: number;
  y: number;
  scale: number;
} {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = f / Math.max(durationInFrames, 1);
  // Camera slowly zooms in and pans right-up
  const camZoom = interpolate(progress, [0, 1], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camPanX = interpolate(progress, [0, 1], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camPanY = interpolate(progress, [0, 1], [0, -4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Higher z = more movement (parallax)
  const depthFactor = zIndex / 3;
  return {
    x: camPanX * depthFactor * 3,
    y: camPanY * depthFactor * 3,
    scale: 1 + (camZoom - 1) * (1 + depthFactor),
  };
}

/** Position a child at a given z-depth for camera parallax */
export const ZLayer: React.FC<{
  z?: number;      // 0=bg, 1=mid, 2=front, 3=float
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ z = 1, style, children }) => {
  const { x, y, scale } = useParallax(z);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(4)})`,
        zIndex: z,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Full 3-layer parallax scene wrapper */
export const ParallaxScene: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {/* Layer 0: Paper background — moves least */}
    <ZLayer z={0}>
      <div style={{ width: 1920, height: 1080 }}>
        <VoxBackground opacity={1} />
      </div>
    </ZLayer>
    {/* Layer 1-2: Content from scenes */}
    {children}
    {/* Vignette — stays on top */}
    <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none", background: "radial-gradient(circle at 50% 50%, transparent 50%, rgba(20,10,5,0.5) 100%)", opacity: 0.2 }} />
  </div>
);

/** Gentle sine-wave float for breathing life */
export const Float: React.FC<{
  amp?: number;
  period?: number;
  phase?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ amp = 6, period = 90, phase = 0, style, children }) => {
  const f = useCurrentFrame();
  const y = Math.sin(((f + phase) / period) * Math.PI * 2) * amp;
  return <div style={{ transform: `translateY(${y.toFixed(1)}px)`, ...style }}>{children}</div>;
};
