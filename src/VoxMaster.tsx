import React from "react";
import { useVideoConfig, Audio, Sequence, staticFile } from "remotion";
import { VoxBackground } from "./VoxSystem";
import timeline from "./timeline.json";
import voManifest from "./vo-manifest.json";

import { ScenePeaceDeal } from "./scenes/peace-deal";
import { SceneEmpireDownfall } from "./scenes/empire-downfall";
import { SceneStraitHostage } from "./scenes/strait-hostage";
import { SceneOilPrices } from "./scenes/oil-prices";
import { SceneInflationHigh } from "./scenes/inflation-high";
import { SceneDebt39 } from "./scenes/debt-39-trillion";
import { SceneDebtBigger } from "./scenes/debt-bigger-than-economy";
import { SceneInterestMilitary } from "./scenes/interest-military";
import { SceneWorldDollar } from "./scenes/world-leaving-dollar";
import { SceneEmpiresEndWar } from "./scenes/empires-end-with-bill";
import { SceneEmpiresEndBill } from "./scenes/empires-end-bill";
import { SceneOutro } from "./scenes/outro";

const COMP_MAP: Record<string, React.FC> = {
  "peace-deal": ScenePeaceDeal,
  "empire-downfall": SceneEmpireDownfall,
  "strait-hostage": SceneStraitHostage,
  "oil-prices": SceneOilPrices,
  "inflation-high": SceneInflationHigh,
  "debt-39-trillion": SceneDebt39,
  "debt-bigger-than-economy": SceneDebtBigger,
  "interest-military": SceneInterestMilitary,
  "world-leaving-dollar": SceneWorldDollar,
  "empires-end-with-bill": SceneEmpiresEndWar,
  "empires-end-bill": SceneEmpiresEndBill,
  outro: SceneOutro,
};

type T = {
  fps: number;
  scenes: Array<{ id: string; startSec: number; endSec: number; durationSec: number }>;
};

export const VoxMaster: React.FC = () => {
  const tl = timeline as T;
  const { fps: confFps } = useVideoConfig();
  const available = (voManifest as { scenes: string[] }).scenes;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1920,
        height: 1080,
        background: "#efe6d2",
        overflow: "hidden",
      }}
    >
      <VoxBackground opacity={1} />

      {tl.scenes.map((s) => {
        const Comp = COMP_MAP[s.id];
        const from = Math.round(s.startSec * confFps);
        const dur = Math.ceil(s.durationSec * confFps);
        const hasAudio = available.includes(s.id);
        return (
          <Sequence
            key={s.id}
            from={from}
            durationInFrames={dur}
            name={s.id}
            layout="absolute-fill"
          >
            <Comp />
            {hasAudio && <Audio src={staticFile(`/audio/vo-${s.id}.wav`)} />}
          </Sequence>
        );
      })}

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(60,40,20,0.6) 100%)",
        }}
      />
    </div>
  );
};
