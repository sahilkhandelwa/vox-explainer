import React from "react";
import { useVideoConfig, Sequence, AbsoluteFill } from "remotion";
import { VoxBackground } from "./VoxSystem";
import { STREAMING_SCENES, SCENE_LENGTHS, FlashOverlay } from "./scenes-streaming";
import timeline from "./timeline-streaming.json";

type T = { fps: number; scenes: Array<{ id: string; startSec: number; endSec: number; durationSec: number }> };
const tl = timeline as T;

const FLASH_FRAMES = 4;

// Build absolute frame offsets — no gap, flash overlaps last frames of each scene
let acc = 0;
const sceneFrames: Array<{ id: string; start: number; dur: number }> = [];
for (const s of tl.scenes) {
  const dur = SCENE_LENGTHS[s.id] ?? Math.ceil(s.durationSec * tl.fps);
  sceneFrames.push({ id: s.id, start: acc, dur });
  acc += dur;
}
const TOTAL_FRAMES = acc;

export const VoxStreamingMaster: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080, overflow: "hidden", background: "#efe6d2" }}>
      <VoxBackground opacity={1} />
      {sceneFrames.map((sf) => {
        const Comp = STREAMING_SCENES[sf.id];
        if (!Comp) return null;
        return (
          <React.Fragment key={sf.id}>
            <Sequence from={sf.start} durationInFrames={sf.dur} name={sf.id} layout="absolute-fill">
              <Comp />
            </Sequence>
            <Sequence from={sf.start + sf.dur - FLASH_FRAMES} durationInFrames={FLASH_FRAMES} layout="absolute-fill">
              <FlashOverlay since={0} />
            </Sequence>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none", background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(60,40,20,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};
