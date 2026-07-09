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
