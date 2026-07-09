import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FocalStructure } from "../VoxSystem";

export const SceneDebtBigger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = interpolate(spring({ frame: frame - 12, fps, config: { damping: 14, mass: 1.4, stiffness: 70 } }), [0, 1], [0, -12]);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `rotate(${tilt}deg)` }}>
        <FocalStructure src="/assets/foreground/scale-balance.svg" scale={0.95} delay={2} />
      </div>
    </>
  );
};
