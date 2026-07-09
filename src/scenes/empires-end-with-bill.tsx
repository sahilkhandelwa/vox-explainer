import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const SceneEmpiresEndWar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eth = spring({ frame: frame - 4, fps, config: { damping: 30, mass: 1.2, stiffness: 50 } });
  const opacity = interpolate(eth, [0, 1], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity }}>
      <div style={{ fontSize: 80, fontFamily: "Georgia, serif", letterSpacing: 14, color: "#d22b2b", fontWeight: 700, marginBottom: 32, textTransform: "uppercase" }}>
        PART 1
      </div>
      <div style={{ fontSize: 140, fontFamily: "Georgia, serif", fontWeight: 800, color: "#1a1a1a", textAlign: "center", maxWidth: 1400, lineHeight: 1.1, textShadow: "6px 6px 0 rgba(210,43,43,0.3)" }}>
        “EMPIRES DON'T END WITH A WAR.”
      </div>
    </div>
  );
};
