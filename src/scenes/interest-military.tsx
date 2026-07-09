import React from "react";
import { FocalStructure, Cutout } from "../VoxSystem";

export const SceneInterestMilitary: React.FC = () => {
  return (
    <>
      <FocalStructure src="/assets/foreground/comparison-bars.svg" scale={1.0} delay={2} />
      <Cutout src="/assets/midground/official-figure.svg" scale={0.4} x={-650} y={50} delay={28} offset={12} />
    </>
  );
};
