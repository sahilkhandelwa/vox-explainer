// ── Editorial scene components (photo cutouts + ink filters) ───
import React from "react";
import { spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from "remotion";
import { EditorialCutout, EditorialFocal, EditorialText } from "../VoxEditorialSystem";

export const EditorialScene0: React.FC = () => (
  <>
    <EditorialFocal src="/assets-editorial/foreground/white-house-photo.png" scale={0.85} delay={4} />
    <EditorialCutout src="/assets-editorial/midground/trump-cutout.png" scale={0.45} x={-340} y={-60} delay={18} offset={12} />
    <EditorialCutout src="/assets-editorial/midground/khamenei-cutout.png" scale={0.45} x={340} y={-60} delay={26} offset={12} />
    <EditorialText delay={60}>
      <div style={{ fontSize: 180, fontFamily: "Georgia, serif", fontWeight: 800, color: "#E50914", textShadow: "4px 4px 0 #1a1a1a", textAlign: "center", position: "absolute", bottom: 120 }}>
        PEACE DEAL
      </div>
    </EditorialText>
  </>
);

export const EditorialScene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fall = spring({ frame: frame - 8, fps, config: { damping: 60, mass: 1.6, stiffness: 26 } });
  const dropY = interpolate(fall, [0, 1], [-200, 380]);
  const rot = interpolate(fall, [0, 1], [0, 25]);
  return (
    <>
      <div style={{ position: "absolute", left: 660, top: dropY, width: 600, height: 600, transform: `rotate(${rot}deg)`, transformOrigin: "300px 300px" }}>
        <Img src={staticFile("/assets-editorial/foreground/eagle-photo.png")} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "grayscale(1) contrast(250%) brightness(85%)" }} />
      </div>
      <EditorialCutout src="/assets-editorial/midground/trump-cutout.png" scale={0.45} x={-160} y={60} delay={2} offset={12} />
    </>
  );
};

export const EditorialScene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pan = spring({ frame: frame - 6, fps, config: { damping: 50, mass: 1.4, stiffness: 36 } });
  const dx = interpolate(pan, [0, 1], [120, 0]);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px)` }}>
        <EditorialFocal src="/assets-editorial/foreground/strait-map.png" scale={0.95} delay={2} />
      </div>
      <EditorialText delay={20}>
        <div style={{ fontSize: 80, fontFamily: "Georgia, serif", fontWeight: 700, color: "#fff", background: "#E50914", padding: "12px 32px", position: "absolute", bottom: 160 }}>
          THE HORMUZ CHOKEPOINT
        </div>
      </EditorialText>
    </>
  );
};

export const EditorialScene3: React.FC = () => {
  const frame = useCurrentFrame();
  const ticker = interpolate(frame, [12, 60], [60, 116], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = Math.max(0, Math.sin((frame - 60) / 4) * 0.6);
  return (
    <>
      <EditorialFocal src="/assets-editorial/foreground/oil-chart.png" scale={0.85} delay={0} />
      <div style={{ position: "absolute", left: 1280, top: 320, fontSize: 180, fontFamily: "Georgia, serif", fontWeight: 700, color: "#E50914", textShadow: `${4 + flash * 12}px ${4 + flash * 12}px 0 #1a1a1a` }}>
        ${Math.round(ticker)}
      </div>
    </>
  );
};

export const EditorialScene4: React.FC = () => (
  <>
    <EditorialFocal src="/assets-editorial/foreground/inflation-chart.png" scale={0.9} delay={2} />
    <EditorialCutout src="/assets-editorial/foreground/us-map.png" scale={0.55} x={-700} y={80} delay={22} offset={12} />
  </>
);

export const EditorialScene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ticker = interpolate(frame, [10, 70], [0, 39], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = spring({ frame: frame - 70, fps, config: { damping: 8, mass: 1, stiffness: 200 } });
  return (
    <>
      <EditorialFocal src="/assets-editorial/foreground/capitol-photo.png" scale={0.8} delay={4} />
      <div style={{ position: "absolute", left: 1240, top: 380, fontSize: 200, fontFamily: "Georgia, serif", fontWeight: 800, color: "#E50914", textShadow: `0 ${6 + pulse * 10}px 0 #1a1a1a`, transform: `scale(${1 + pulse * 0.08})` }}>
        ${ticker.toFixed(0)}T
      </div>
    </>
  );
};

export const EditorialScene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = interpolate(spring({ frame: frame - 12, fps, config: { damping: 14, mass: 1.4, stiffness: 70 } }), [0, 1], [0, -12]);
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `rotate(${tilt}deg)` }}>
      <EditorialFocal src="/assets-editorial/foreground/scale-photo.png" scale={0.9} delay={2} />
    </div>
  );
};

export const EditorialScene7: React.FC = () => (
  <>
    <EditorialFocal src="/assets-editorial/foreground/comparison-chart.png" scale={0.85} delay={2} />
    <EditorialText delay={40}>
      <div style={{ fontSize: 48, fontFamily: "Georgia, serif", fontWeight: 700, color: "#1a1a1a", position: "absolute", bottom: 60, textAlign: "center" }}>
        INTEREST ON DEBT NOW EXCEEDS THE ENTIRE MILITARY BUDGET
      </div>
    </EditorialText>
  </>
);

export const EditorialScene8: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 150], [0, 200], { extrapolateRight: "clamp" });
  return (
    <>
      <EditorialFocal src="/assets-editorial/foreground/globe-photo.png" scale={0.85} x={-180} delay={2} />
      <div style={{ position: "absolute", left: 1120 + drift, top: 280, fontSize: 280, fontFamily: "Georgia, serif", fontWeight: 800, color: "#E50914", textShadow: "6px 6px 0 #1a1a1a", opacity: 0.85 }}>
        $
      </div>
    </>
  );
};

export const EditorialScene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eth = spring({ frame: frame - 4, fps, config: { damping: 30, mass: 1.2, stiffness: 50 } });
  const opacity = interpolate(eth, [0, 1], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity }}>
      <div style={{ fontSize: 80, fontFamily: "Georgia, serif", letterSpacing: 14, color: "#E50914", fontWeight: 700, marginBottom: 32, textTransform: "uppercase" }}>PART 1</div>
      <div style={{ fontSize: 140, fontFamily: "Georgia, serif", fontWeight: 800, color: "#1a1a1a", textAlign: "center", maxWidth: 1400, lineHeight: 1.1, textShadow: "6px 6px 0 rgba(229,9,20,0.3)" }}>
        “EMPIRES DON'T END WITH A WAR.”
      </div>
    </div>
  );
};

export const EditorialScene10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eth = spring({ frame: frame - 4, fps, config: { damping: 30, mass: 1.2, stiffness: 50 } });
  const opacity = interpolate(eth, [0, 1], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity }}>
      <div style={{ fontSize: 80, fontFamily: "Georgia, serif", letterSpacing: 14, color: "#E50914", fontWeight: 700, marginBottom: 32, textTransform: "uppercase" }}>PART 2</div>
      <div style={{ fontSize: 130, fontFamily: "Georgia, serif", fontWeight: 800, color: "#fff", textAlign: "center", maxWidth: 1500, lineHeight: 1.1, padding: "24px 40px", background: "#E50914", boxShadow: "10px 10px 0 #1a1a1a" }}>
        “THEY END WITH A BILL THEY CAN NO LONGER PAY.”
      </div>
    </div>
  );
};

export const EditorialScene11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const eth = spring({ frame: frame - 2, fps, config: { damping: 22, mass: 1.3, stiffness: 60 } });
  const opacity = interpolate(eth, [0, 1], [0, 1]);
  const fadeOut = interpolate(frame, [80, 124], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: opacity * fadeOut }}>
      <div style={{ fontSize: 60, fontFamily: "Georgia, serif", letterSpacing: 12, color: "#E50914", fontWeight: 700, marginBottom: 24, textTransform: "uppercase" }}>EMPIRE'S END</div>
      <div style={{ fontSize: 110, fontFamily: "Georgia, serif", fontWeight: 800, color: "#1a1a1a", textAlign: "center", maxWidth: 1400, lineHeight: 1.15 }}>
        This is how the American era quietly closes.
      </div>
    </div>
  );
};

export const EDITORIAL_SCENES: Record<string, React.FC> = {
  "peace-deal": EditorialScene0,
  "empire-downfall": EditorialScene1,
  "strait-hostage": EditorialScene2,
  "oil-prices": EditorialScene3,
  "inflation-high": EditorialScene4,
  "debt-39-trillion": EditorialScene5,
  "debt-bigger-than-economy": EditorialScene6,
  "interest-military": EditorialScene7,
  "world-leaving-dollar": EditorialScene8,
  "empires-end-with-bill": EditorialScene9,
  "empires-end-bill": EditorialScene10,
  outro: EditorialScene11,
};
