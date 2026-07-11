import React from "react";
import { useVideoConfig, Audio, Sequence, staticFile } from "remotion";
import { EditorialBg } from "./VoxEditorialSystem";
import { EDITORIAL_SCENES } from "./scenes-editorial";
import timeline from "./timeline.json";
import voManifest from "./vo-manifest.json";

type T = { fps: number; scenes: Array<{ id: string; startSec: number; endSec: number; durationSec: number }> };

export const VoxEditorialMaster: React.FC = () => {
  const tl = timeline as T;
  const { fps: confFps } = useVideoConfig();
  const available = (voManifest as { scenes: string[] }).scenes;

  return (
    <div style={{ position: "absolute", inset: 0, width: 1920, height: 1080, overflow: "hidden" }}>
      <EditorialBg />
      {tl.scenes.map((s) => {
        const Comp = EDITORIAL_SCENES[s.id];
        const from = Math.round(s.startSec * confFps);
        const dur = Math.ceil(s.durationSec * confFps);
        const hasAudio = available.includes(s.id);
        if (!Comp) return null;
        return (
          <Sequence key={s.id} from={from} durationInFrames={dur} name={s.id} layout="absolute-fill">
            <Comp />
            {hasAudio && <Audio src={staticFile(`/audio/vo-${s.id}.wav`)} />}
          </Sequence>
        );
      })}
      <div style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none", background: "radial-gradient(circle at 50% 50%, transparent 55%, rgba(60,40,20,0.6) 100%)" }} />
    </div>
  );
};
