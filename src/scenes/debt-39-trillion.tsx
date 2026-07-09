import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FocalStructure, Cutout } from "../VoxSystem";

export const SceneDebt39: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ticker = interpolate(frame, [10, 70], [0, 39], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = spring({ frame: frame - 70, fps, config: { damping: 8, mass: 1, stiffness: 200 } });
  return (
    <>
      <FocalStructure src="/assets/foreground/capitol.svg" scale={0.85} delay={4} />
      <Cutout src="/assets/midground/official-figure.svg" scale={0.32} x={300} y={140} delay={30} offset={10} />
      <div style={{ position: "absolute", left: 1200, top: 280, fontSize: 260, fontFamily: "Georgia, serif", fontWeight: 800, color: "#d22b2b", textShadow: `0 ${6 + pulse * 10}px 0 #1a1a1a`, transform: `scale(${1 + pulse * 0.08})`, transformOrigin: "left top" }}>
        ${ticker.toFixed(0)}T
      </div>
      <div style={{ position: "absolute", left: 1220, top: 560, fontSize: 80, fontFamily: "Georgia, serif", fontWeight: 700, color: "#1a1a1a" }}>
        TOTAL DEBT
      </div>
    </>
  );
};
