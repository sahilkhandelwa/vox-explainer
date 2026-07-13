import React from "react";
import { useVideoConfig, Sequence, AbsoluteFill } from "remotion";
import { STREAMING_SCENES } from "./scenes-streaming";
import timeline from "./timeline-streaming.json";

type T = { fps: number; scenes: Array<{ id: string; startSec: number; endSec: number; durationSec: number }> };
const tl = timeline as T;
let acc = 0;
for (const s of tl.scenes) { s.startSec = acc; acc += s.durationSec; s.endSec = acc; }

export const VoxStreamingMaster: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080, overflow: "hidden", background: "#efe6d2" }}>
      {tl.scenes.map((s) => {
        const Comp = STREAMING_SCENES[s.id];
        const from = Math.round(s.startSec * fps);
        const dur = Math.ceil(s.durationSec * fps);
        if (!Comp) return null;
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur} name={s.id} layout="absolute-fill">
            <Comp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
