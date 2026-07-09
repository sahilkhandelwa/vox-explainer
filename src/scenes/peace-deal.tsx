import React from "react";
import { Cutout, FocalStructure } from "../VoxSystem";

export const ScenePeaceDeal: React.FC = () => {
  return (
    <>
      <FocalStructure src="/assets/foreground/white-house.svg" scale={1.0} delay={4} />
      <Cutout src="/assets/midground/trump.svg" scale={0.42} x={-360} y={-40} delay={20} offset={14} />
      <Cutout src="/assets/midground/khamenei.svg" scale={0.42} x={360} y={-40} delay={28} offset={14} />
      <Cutout src="/assets/midground/official-figure.svg" scale={0.32} x={-720} y={140} delay={36} offset={10} />
      <Cutout src="/assets/midground/official-figure.svg" scale={0.32} x={720} y={140} delay={42} offset={10} />
    </>
  );
};
