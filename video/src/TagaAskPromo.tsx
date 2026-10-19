import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';
import { SCENE_RANGES } from './audioTimeline';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { MasterAudioTrack } from './components/MasterAudioTrack';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Problem } from './scenes/Scene2Problem';
import { Scene3Solution } from './scenes/Scene3Solution';
import { Scene4HeroCIT } from './scenes/Scene4HeroCIT';
import { Scene5UploadsAndMap } from './scenes/Scene5UploadsAndMap';
import { Scene6Security } from './scenes/Scene6Security';
import { Scene7Outro } from './scenes/Scene7Outro';

const { fontFamily } = loadFont('normal', {
  weights: ['500', '600', '700', '800'],
  subsets: ['latin'],
});

export const TagaAskPromo: React.FC = () => {
  const frame = useCurrentFrame();

  // Mood shifts to cold slate-blue during Scene 2 ("Problem"), warms to bright cyan/blue on Scene 3+
  const isProblemScene =
    frame >= SCENE_RANGES.S2.start &&
    frame < SCENE_RANGES.S2.start + SCENE_RANGES.S2.duration;
  const mood = isProblemScene ? 'cold' : frame >= SCENE_RANGES.S3.start ? 'warm' : 'default';

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        color: '#F8FAFC',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 1. Root Master Audio (100 BPM Music + 70 Frame-Accurate Tactile SFX, No Narrator) */}
      <MasterAudioTrack />

      {/* 2. Depth Layer 1: Midnight-Black Void + Concentrated Royal-Blue Volumetric Spotlight */}
      <AtmosphericBackground mood={mood} showBuilding />

      {/* 3. Depth Layer 2 & 3: 7 Scenes on 100 BPM Beat Grid (No Lower-Third Karaoke Bar) */}
      <Sequence
        from={SCENE_RANGES.S1.start}
        durationInFrames={SCENE_RANGES.S1.duration}
      >
        <Scene1Intro durationInFrames={SCENE_RANGES.S1.duration} />
      </Sequence>

      <Sequence
        from={SCENE_RANGES.S2.start}
        durationInFrames={SCENE_RANGES.S2.duration}
      >
        <Scene2Problem durationInFrames={SCENE_RANGES.S2.duration} />
      </Sequence>

      <Sequence
        from={SCENE_RANGES.S3.start}
        durationInFrames={SCENE_RANGES.S3.duration}
      >
        <Scene3Solution durationInFrames={SCENE_RANGES.S3.duration} />
      </Sequence>

      <Sequence
        from={SCENE_RANGES.S4.start}
        durationInFrames={SCENE_RANGES.S4.duration}
      >
        <Scene4HeroCIT durationInFrames={SCENE_RANGES.S4.duration} />
      </Sequence>

      <Sequence from={SCENE_RANGES.S5.start} durationInFrames={SCENE_RANGES.S5.duration}>
        <Scene5UploadsAndMap durationInFrames={SCENE_RANGES.S5.duration} />
      </Sequence>

      <Sequence from={SCENE_RANGES.S6.start} durationInFrames={SCENE_RANGES.S6.duration}>
        <Scene6Security durationInFrames={SCENE_RANGES.S6.duration} />
      </Sequence>

      <Sequence from={SCENE_RANGES.S7.start} durationInFrames={SCENE_RANGES.S7.duration}>
        <Scene7Outro durationInFrames={SCENE_RANGES.S7.duration} />
      </Sequence>
    </AbsoluteFill>
  );
};
