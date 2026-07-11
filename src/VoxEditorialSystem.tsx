// ── Vox editorial visual system v3 ───────────────────────────────
// Real photo cutouts with original colors preserved.
// Red offset via SVG feColorMatrix (silhouette-matched, not a box).
// Original Vox paper background.
import React from "react";
import { Img, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BG = staticFile("/assets/background/paper-warm.svg");

const RED_MATRIX = `
  <filter id="toRedV3" x="-20%" y="-20%" width="140%" height="140%">
    <feColorMatrix type="matrix" values="
      0 0 0 0 0.898
      0 0 0 0 0.035
      0 0 0 0 0.078
      0 0 0 1 0" />
  </filter>`;

export const EditorialBg: React.FC = () => (
  <Img
    src={BG}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.9)" }}
  />
);

export const EditorialCutout: React.FC<{
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
  const url = staticFile(src);

  const pop = spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.9, stiffness: 110 } });
  const dy = interpolate(pop, [0, 1], [springFrom, 0]);
  const opacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tf = `translate3d(${x}px, ${y + dy}px, 0) scale(${scale})`;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none", transform: tf, opacity }}>
      <svg style={{ position: "absolute", width: 0, height: 0 }} dangerouslySetInnerHTML={{ __html: RED_MATRIX }} />

      {/* Red offset — silhouette-matched via feColorMatrix */}
      <div style={{ position: "absolute", left: offset, top: offset, width: "100%", height: "100%" }}>
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "url(#toRedV3)" }} />
      </div>
      {/* Second softer offset */}
      <div style={{ position: "absolute", left: offset * 1.7, top: offset * 1.7, width: "100%", height: "100%", opacity: 0.55 }}>
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "url(#toRedV3)" }} />
      </div>

      {/* Main photo — original colors preserved */}
      <Img src={url} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
};

export const EditorialFocal: React.FC<{
  src: string;
  scale?: number;
  x?: number;
  y?: number;
  delay?: number;
  springFrom?: number;
}> = ({ src, scale = 1, x = 0, y = 0, delay = 0, springFrom = 240 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const url = staticFile(src);
  const pop = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 1.1, stiffness: 90 } });
  const dy = interpolate(pop, [0, 1], [springFrom, 0]);
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none", transform: `translate3d(${x}px, ${y + dy}px, 0) scale(${scale})`, opacity }}>
      <Img src={url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>
  );
};

export const EditorialText: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ children, style, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.9, stiffness: 100 } });
  const opacity = interpolate(pop, [0, 1], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity, ...(style || {}) }}>
      {children}
    </div>
  );
};
