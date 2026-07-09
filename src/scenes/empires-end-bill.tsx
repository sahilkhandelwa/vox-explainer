import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const SceneEmpiresEndBill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eth = spring({ frame: frame - 4, fps, config: { damping: 30, mass: 1.2, stiffness: 50 } });
  const opacity = interpolate(eth, [0, 1], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity }}>
      <div style={{ fontSize: 80, fontFamily: "Georgia, serif", letterSpacing: 14, color: "#d22b2b", fontWeight: 700, marginBottom: 32, textTransform: "uppercase" }}>
        PART 2
      </div>
      <div style={{ fontSize: 130, fontFamily: "Georgia, serif", fontWeight: 800, color: "#fff", textAlign: "center", maxWidth: 1500, lineHeight: 1.1, padding: "24px 40px", background: "#d22b2b", boxShadow: "10px 10px 0 #1a1a1a" }}>
        “THEY END WITH A BILL THEY CAN NO LONGER PAY.”
      </div>
    </div>
  );
};
