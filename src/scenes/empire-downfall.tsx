import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate, staticFile, Img } from "remotion";
import { Cutout } from "../VoxSystem";

export const SceneEmpireDownfall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fall = spring({ frame: frame - 8, fps, config: { damping: 60, mass: 1.6, stiffness: 26 } });
  const dropY = interpolate(fall, [0, 1], [-200, 360]);
  const rot = interpolate(fall, [0, 1], [0, 22]);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translate(${660}px, ${dropY}px) rotate(${rot}deg)`, transformOrigin: "960px 540px" }}>
        <Img src={staticFile("/assets/foreground/falling-eagle.svg")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <Cutout src="/assets/midground/trump.svg" scale={0.5} x={-140} y={20} delay={2} offset={14} />
    </>
  );
};
