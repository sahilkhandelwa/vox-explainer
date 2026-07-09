import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { FocalStructure } from "../VoxSystem";

export const SceneOilPrices: React.FC = () => {
  const frame = useCurrentFrame();
  const ticker = interpolate(frame, [12, 60], [60, 116], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = Math.max(0, Math.sin((frame - 60) / 4) * 0.6);
  return (
    <>
      <FocalStructure src="/assets/foreground/barrel.svg" scale={0.65} x={-380} y={-40} delay={0} />
      <div style={{ position: "absolute", left: 940, top: 360, fontSize: 280, fontFamily: "Georgia, serif", fontWeight: 700, color: "#d22b2b", textShadow: `${4 + flash * 12}px ${4 + flash * 12}px 0 #1a1a1a` }}>
        ${Math.round(ticker)}
      </div>
      <div style={{ position: "absolute", left: 920, top: 670, fontSize: 60, fontFamily: "Georgia, serif", fontWeight: 700, color: "#1a1a1a" }}>
        PER BARREL
      </div>
    </>
  );
};
