import React from "react";
import { registerRoot, Composition } from "remotion";
import { VoxMaster } from "./VoxMaster";
import timeline from "./timeline.json";

const fps = (timeline as { fps: number }).fps || 30;
const scenes = (timeline as { scenes: Array<{ endSec: number }> }).scenes;
const totalSec = scenes[scenes.length - 1].endSec;
const totalFrames = Math.ceil(totalSec * fps) + Math.ceil(1.6 * fps);

registerRoot(() => (
  <Composition
    id="VoxMaster"
    component={VoxMaster}
    durationInFrames={totalFrames}
    fps={fps}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
));
