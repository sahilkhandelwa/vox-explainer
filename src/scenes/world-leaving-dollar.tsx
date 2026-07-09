import React from "react";
import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { FocalStructure, Cutout } from "../VoxSystem";

export const SceneWorldDollar: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 150], [0, 220], { extrapolateRight: "clamp" });
  return (
    <>
      <FocalStructure src="/assets/foreground/globe-dollar.svg" scale={0.9} x={-180} delay={2} />
      <div style={{ position: "absolute", left: 1180 + drift, top: 280, fontSize: 260, fontFamily: "Georgia, serif", fontWeight: 800, color: "#d22b2b", textShadow: "6px 6px 0 #1a1a1a", opacity: 0.85 }}>
        $
      </div>
      <Cutout src="/assets/midground/trump.svg" scale={0.32} x={640} y={180} delay={34} offset={10} />
    </>
  );
};
