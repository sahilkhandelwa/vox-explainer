import React from "react";
import { registerRoot, Composition } from "remotion";
import { VoxStreamingMaster } from "./VoxStreamingMaster";
import timeline from "./timeline-streaming.json";

const fps = timeline.fps || 30;
const totalSec = timeline.scenes.reduce((acc, s) => acc + s.durationSec, 0);
const totalFrames = Math.ceil(totalSec * fps) + Math.ceil(1.6 * fps);

registerRoot(() => (
  <Composition
    id="VoxStreamingMaster"
    component={VoxStreamingMaster}
    durationInFrames={totalFrames}
    fps={fps}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
));
