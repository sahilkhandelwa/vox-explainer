import React from "react";
import { useVideoConfig, Sequence, AbsoluteFill } from "remotion";
import { STREAMING_SCENES, SCENE_LENGTHS } from "./scenes-streaming";
import timeline from "./timeline-streaming.json";

type T = { fps: number; scenes: Array<{ id: string; startSec: number; endSec: number; durationSec: number }> };
const tl = timeline as T;

// Build absolute frame offsets
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
    <AbsoluteFill style={{ width: 1920, height: 1080, overflow: "hidden", background: "#0d0d0d" }}>
      {sceneFrames.map((sf) => {
        const Comp = STREAMING_SCENES[sf.id];
        if (!Comp) return null;
        return (
          <Sequence key={sf.id} from={sf.start} durationInFrames={sf.dur} name={sf.id} layout="absolute-fill">
            <Comp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
