import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import {
  getCameraDrift,
  GlassPanel,
  MacroCameraRig,
  OrbitalRingMark,
  RingPortalOverlay,
  SPRINGS,
} from '../presets';

const FEATURE_ROWS = [
  {
    icon: '📄',
    title: 'Official UMak Documents',
    sub: 'Grounded exclusively in Source01 to Source04 PDFs',
    startFrame: 106,
  },
  {
    icon: '✓',
    title: 'Exact Page Citations',
    sub: 'Shows the exact source document and highlighted page',
    startFrame: 118,
  },
  {
    icon: '📎',
    title: 'Schedule & Photo Uploads',
    sub: 'Attach your class schedule, form, or campus notice',
    startFrame: 132,
  },
  {
    icon: '🧭',
    title: 'Interactive Campus Map',
    sub: 'Pinpoint buildings, floors, and wings across UMak',
    startFrame: 146,
  },
  {
    icon: '🔒',
    title: 'UMak Google Sign-In',
    sub: 'Restricted to @umak.edu.ph with smart rate limiting',
    startFrame: 162,
  },
];

export const Scene3Solution: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);
  const drift = getCameraDrift(frame, 3);

  const entryPortal = interpolate(frame, [0, 14], [0.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // BEAT 1 (local 0..52): "But what if every answer..." (But: 3, what: 9, if: 16, every: 20, answer...: 28)
  const b1Exit = interpolate(frame, [46, 54], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wBut = spring({ frame: frame - 2, fps, config: SPRINGS.snappy });
  const wWhat = spring({ frame: frame - 8, fps, config: SPRINGS.snappy });
  const wIf = spring({ frame: frame - 14, fps, config: SPRINGS.snappy });
  const wEvery = spring({ frame: frame - 19, fps, config: SPRINGS.bouncy });
  const wAnswer = spring({ frame: frame - 27, fps, config: SPRINGS.bouncy });

  // BEAT 2 (local 52..100): "...just made sense?" (just: 55, made: 63, sense?: 69)
  const b2Exit = interpolate(frame, [94, 103], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const wJust = spring({ frame: frame - 53, fps, config: SPRINGS.snappy });
  const wMade = spring({ frame: frame - 61, fps, config: SPRINGS.snappy });
  const wSense = spring({ frame: frame - 68, fps, config: SPRINGS.bouncy });

  // BEAT 3 (local 98..216): "One place to ask, to verify, to understand." — Vertical Stacked Card Cascade (replicates @frameonvis Plan list!)
  const planHeaderP = spring({ frame: frame - 98, fps, config: SPRINGS.snappy });
  const exitGlideY = interpolate(frame, [durationInFrames - 16, durationInFrames], [0, -340], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const listWidth = layout.isVertical ? 860 : 880;

  return (
    <AbsoluteFill>
      <MacroCameraRig
        scale={interpolate(frame, [0, 52, 102, durationInFrames], [1.06, 1.1, 1.0, 1.05])}
        translateX={drift.translateX * 0.3}
        translateY={drift.translateY * 0.3 + exitGlideY}
        translateZ={drift.translateZ * 0.3}
        rotateX={drift.rotateX * 0.25}
        rotateY={drift.rotateY * 0.25}
        perspective={layout.perspective}
      >
        {/* BEAT 1 (local 0..54): "But what if every answer" */}
        {frame < 55 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              opacity: 1 - b1Exit,
              transform: `translateY(${interpolate(b1Exit, [0, 1], [0, -80])}px) scale(${1 - b1Exit * 0.06})`,
              filter: b1Exit > 0.05 ? `blur(${(b1Exit * 10).toFixed(1)}px)` : undefined,
            }}
          >
            {[
              { text: 'But', p: wBut, accent: false },
              { text: 'what', p: wWhat, accent: false },
              { text: 'if', p: wIf, accent: false },
              { text: 'every', p: wEvery, accent: true },
              { text: 'answer', p: wAnswer, accent: true },
            ].map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: layout.isVertical ? 74 : 90,
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  color: item.accent ? COLORS.brandCyan : '#FFFFFF',
                  textShadow: item.accent
                    ? `0 0 38px ${COLORS.brandCyan}, 0 0 70px ${COLORS.neonBlue}`
                    : 'none',
                  opacity: item.p,
                  transform: `translateY(${interpolate(item.p, [0, 1], [36, 0])}px) scale(${interpolate(item.p, [0, 1], [0.86, 1])})`,
                }}
              >
                {item.text}
              </span>
            ))}
          </div>
        )}

        {/* BEAT 2 (local 52..103): "Just made sense" */}
        {frame >= 52 && frame < 104 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              opacity: 1 - b2Exit,
              transform: `translateY(${interpolate(b2Exit, [0, 1], [0, -120])}px) scale(${1 - b2Exit * 0.08})`,
              filter: b2Exit > 0.05 ? `blur(${(b2Exit * 10).toFixed(1)}px)` : undefined,
            }}
          >
            {[
              { text: 'Just', p: wJust, accent: false },
              { text: 'made', p: wMade, accent: false },
              { text: 'sense', p: wSense, accent: true },
            ].map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: layout.isVertical ? 82 : 98,
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  color: item.accent ? COLORS.brandCyan : '#FFFFFF',
                  textShadow: item.accent
                    ? `0 0 42px ${COLORS.brandCyan}, 0 0 76px ${COLORS.neonBlue}`
                    : 'none',
                  opacity: item.p,
                  transform: `translateY(${interpolate(item.p, [0, 1], [36, 0])}px) scale(${interpolate(item.p, [0, 1], [0.85, 1])})`,
                }}
              >
                {item.text}
              </span>
            ))}
          </div>
        )}

        {/* BEAT 3 (local 98..216): "One place to ask, to verify, to understand." — Tarsi-Style Vertical Feature Cascade */}
        {frame >= 98 && (
          <div
            style={{
              width: listWidth,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top Header matching "Plan / Manage your budget, goals and more." */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px 6px 8px',
                opacity: planHeaderP,
                transform: `translateY(${interpolate(planHeaderP, [0, 1], [32, 0])}px)`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: 800,
                    letterSpacing: '-0.035em',
                    color: '#FFFFFF',
                  }}
                >
                  TAGA-asK <span style={{ color: COLORS.brandCyan }}>AI</span>
                </span>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 500,
                    color: COLORS.textSilver,
                  }}
                >
                  One place to ask, to verify, and to understand UMak.
                </span>
              </div>
              <OrbitalRingMark frame={frame} size={68} />
            </div>

            {/* 5 Cascading Dark-Glass Feature Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {FEATURE_ROWS.map((row) => {
                const rowP = spring({
                  frame: frame - row.startFrame,
                  fps,
                  config: SPRINGS.snappy,
                });
                return (
                  <div
                    key={row.title}
                    style={{
                      opacity: rowP,
                      transform: `translateY(${interpolate(rowP, [0, 1], [90, 0])}px) scale(${interpolate(rowP, [0, 1], [0.92, 1])})`,
                      filter: rowP < 0.85 ? `blur(${((1 - rowP) * 10).toFixed(1)}px)` : undefined,
                    }}
                  >
                    <GlassPanel
                      width="100%"
                      borderRadius={26}
                      borderColor="rgba(111, 168, 255, 0.35)"
                      glowColor="rgba(59, 108, 255, 0.32)"
                      glowSpread={36}
                    >
                      <div
                        style={{
                          padding: '18px 28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(12, 19, 44, 0.92)',
                          borderRadius: 24,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              background: 'rgba(34, 171, 227, 0.18)',
                              border: `1.5px solid ${COLORS.brandCyan}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24,
                              fontWeight: 800,
                              color: COLORS.brandCyan,
                            }}
                          >
                            {row.icon}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>{row.title}</span>
                            <span style={{ fontSize: 21, fontWeight: 500, color: COLORS.textSilver }}>{row.sub}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 32, fontWeight: 600, color: COLORS.textSilver }}>›</span>
                      </div>
                    </GlassPanel>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </MacroCameraRig>

      <RingPortalOverlay progress={entryPortal} centerX="50%" centerY="50%" />
    </AbsoluteFill>
  );
};
