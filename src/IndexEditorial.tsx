import React from "react";
import { registerRoot, Composition } from "remotion";
import { VoxEditorialMaster } from "./VoxEditorialMaster";
import timeline from "./timeline.json";

const fps = timeline.fps || 30;
const scenes = timeline.scenes;
const totalSec = scenes[scenes.length - 1].endSec;
const totalFrames = Math.ceil(totalSec * fps) + Math.ceil(1.6 * fps);

registerRoot(() => (
  <Composition
    id="VoxEditorialMaster"
    component={VoxEditorialMaster}
    durationInFrames={totalFrames}
    fps={fps}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
));
