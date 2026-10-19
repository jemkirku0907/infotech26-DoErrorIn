import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import { SPRINGS } from '../presets';
import { VOICEOVER_DATA, TimedWord } from '../voiceover-timings';

interface CaptionChunk {
  words: TimedWord[];
  startFrame: number;
  endFrame: number;
}

function buildCaptionChunks(allWords: TimedWord[], maxWordsPerChunk = 6): CaptionChunk[] {
  const chunks: CaptionChunk[] = [];
  let current: TimedWord[] = [];

  for (let i = 0; i < allWords.length; i++) {
    const w = allWords[i];
    current.push(w);
    const endsSentence = /[.?!]$/.test(w.word);
    const endsClause = /[,;:]$/.test(w.word) && current.length >= 4;
    if (current.length >= maxWordsPerChunk || endsSentence || endsClause || i === allWords.length - 1) {
      chunks.push({
        words: current,
        startFrame: current[0].startFrame,
        endFrame: current[current.length - 1].endFrame,
      });
      current = [];
    }
  }
  return chunks;
}

export const KaraokeCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);

  const chunks = React.useMemo(
    () => buildCaptionChunks(VOICEOVER_DATA.allWords, layout.isVertical ? 5 : 7),
    [layout.isVertical]
  );

  // Find active chunk (with small 4-frame lead-in and 8-frame tail)
  const activeChunk = chunks.find(
    (c, idx) =>
      frame >= c.startFrame - 4 &&
      frame <= (idx < chunks.length - 1 ? Math.min(c.endFrame + 8, chunks[idx + 1].startFrame - 1) : c.endFrame + 12)
  );

  if (!activeChunk) return null;

  const enterP = spring({
    frame: frame - (activeChunk.startFrame - 4),
    fps,
    config: SPRINGS.snappy,
  });

  const pillY = interpolate(enterP, [0, 1], [14, 0]);
  const pillOpacity = interpolate(enterP, [0, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        left: layout.safeMargin,
        right: layout.safeMargin,
        bottom: layout.captionBottom,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: layout.captionMaxWidth,
          padding: layout.isVertical ? '14px 28px' : '16px 36px',
          borderRadius: 999,
          background: 'rgba(11, 18, 48, 0.62)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1.5px solid rgba(111, 168, 255, 0.48)`,
          boxShadow: '0 14px 44px rgba(3, 6, 26, 0.72), 0 0 28px rgba(59, 108, 255, 0.25)',
          transform: `translateY(${pillY}px)`,
          opacity: pillOpacity,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: layout.isVertical ? '10px' : '13px',
        }}
      >
        {activeChunk.words.map((w, idx) => {
          const isActive = frame >= w.startFrame - 1 && frame <= w.endFrame + 2;
          const isPast = frame > w.endFrame + 2;
          const isBrandYellow =
            w.word.includes('AI') || w.word.includes('CIT') || w.word.includes('UMak') || w.word.includes('03');

          return (
            <span
              key={`${w.word}-${w.startFrame}-${idx}`}
              style={{
                fontSize: layout.captionFontSize,
                fontWeight: isActive ? 800 : 600,
                letterSpacing: '-0.015em',
                lineHeight: 1.2,
                color: isActive
                  ? isBrandYellow
                    ? COLORS.brandYellow
                    : '#FFFFFF'
                  : isPast
                  ? 'rgba(248, 250, 252, 0.88)'
                  : 'rgba(203, 213, 225, 0.58)',
                textShadow: isActive
                  ? isBrandYellow
                    ? '0 0 24px rgba(244, 235, 42, 0.75)'
                    : '0 0 22px rgba(34, 171, 227, 0.85), 0 0 8px rgba(255, 255, 255, 0.65)'
                  : 'none',
                transform: isActive ? 'scale(1.06) translateY(-1px)' : 'scale(1)',
                display: 'inline-block',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
