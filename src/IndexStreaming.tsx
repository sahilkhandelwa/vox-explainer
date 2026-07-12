import React from "react";
import { registerRoot, Composition } from "remotion";
import { VoxStreamingMaster } from "./VoxStreamingMaster";
import { SCENE_LENGTHS } from "./scenes-streaming";

const sceneIds = ["intro", "netflix-spend", "content-chart", "cord-cutting", "streaming-debt", "market-share", "debt-spiral", "outro"];
const totalFrames = sceneIds.reduce((acc, id) => acc + (SCENE_LENGTHS[id] ?? 60), 0);

registerRoot(() => (
  <Composition
    id="VoxStreamingMaster"
    component={VoxStreamingMaster}
    durationInFrames={totalFrames}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{}}
  />
));
