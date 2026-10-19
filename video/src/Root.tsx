import React from 'react';
import { Composition } from 'remotion';
import { TagaAskPromo } from './TagaAskPromo';
import { TOTAL_FRAMES } from './audioTimeline';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TagaAskPromo16x9"
        component={TagaAskPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TagaAskPromo9x16"
        component={TagaAskPromo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
