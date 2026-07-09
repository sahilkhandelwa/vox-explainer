import React from "react";
import { FocalStructure, Cutout } from "../VoxSystem";

export const SceneInflationHigh: React.FC = () => {
  return (
    <>
      <FocalStructure src="/assets/foreground/inflation-chart.svg" scale={1.0} delay={2} />
      <Cutout src="/assets/foreground/us-map.svg" scale={0.6} x={-700} y={60} delay={26} offset={12} />
    </>
  );
};
