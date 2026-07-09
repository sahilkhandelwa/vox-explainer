import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from "remotion";
import { FocalStructure, Cutout } from "../VoxSystem";

export const SceneStraitHostage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pan = spring({ frame: frame - 6, fps, config: { damping: 50, mass: 1.4, stiffness: 36 } });
  const dx = interpolate(pan, [0, 1], [120, 0]);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px)` }}>
        <FocalStructure src="/assets/foreground/strait-map.svg" scale={1.0} delay={4} />
      </div>
      {/* Midground silhouette of oil tanker with halftone + red offset */}
      <Cutout src="/assets/midground/oil-tanker.svg" scale={0.7} x={0} y={60} delay={18} offset={10} />
      {/* Ocean strip across the bottom (synthetic blue sea) for atmosphere */}
      <Img
        src={staticFile("/assets/foreground/ocean.svg")}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: 1920,
          height: 240,
          objectFit: "cover",
          opacity: 0.85,
        }}
      />
    </>
  );
};
