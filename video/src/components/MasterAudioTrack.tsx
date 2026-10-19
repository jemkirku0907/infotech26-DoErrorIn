import React from 'react';
import { Audio, staticFile } from 'remotion';

export const MasterAudioTrack: React.FC = () => {
  return (
    <Audio
      src={staticFile('audio/soundtrack-master.wav')}
      volume={1}
    />
  );
};
