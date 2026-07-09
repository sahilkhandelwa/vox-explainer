import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eth = spring({ frame: frame - 2, fps, config: { damping: 22, mass: 1.3, stiffness: 60 } });
  const opacity = interpolate(eth, [0, 1], [0, 1]);
  const fadeOut = interpolate(frame, [80, 124], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: opacity * fadeOut }}>
      <div style={{ fontSize: 60, fontFamily: "Georgia, serif", letterSpacing: 12, color: "#d22b2b", fontWeight: 700, marginBottom: 24 }}>EMPIRE'S END</div>
      <div style={{ fontSize: 110, fontFamily: "Georgia, serif", fontWeight: 800, color: "#1a1a1a", textAlign: "center", maxWidth: 1400, lineHeight: 1.15 }}>
        This is how the American era quietly closes.
      </div>
    </div>
  );
};
