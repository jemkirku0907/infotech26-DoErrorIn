import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import {
  FullScreenShockwave,
  getCameraDrift,
  GlassPanel,
  MacroCameraRig,
  RingPortalOverlay,
  SPRINGS,
} from '../presets';

const INQUIRY_ROWS = [
  { title: 'Admin Building & CIT Office', sub: 'Posted in UMak Student Community', badge: '0 replies' },
  { title: 'Class Schedules & Room Assignments', sub: 'Posted in Freshmen Help Group', badge: '4h wait' },
  { title: 'Scholarship & Exemption Guidelines', sub: 'Posted in Campus Inquiries', badge: '6h wait' },
  { title: 'Official Handbook & Academic Rules', sub: 'Posted in Student Forum', badge: '0 replies' },
];

const LOGO_LAYERS = [
  { id: 'taga', src: 'logo-layers/layer_taga.png', startFrame: 144, fromX: -480, fromY: 0, glow: COLORS.neonBlue },
  { id: 'heron', src: 'logo-layers/layer_heron.png', startFrame: 150, fromX: 380, fromY: -90, glow: COLORS.brandYellow },
  { id: 'as', src: 'logo-layers/layer_as.png', startFrame: 156, fromX: 0, fromY: 220, glow: COLORS.brandCyan },
  { id: 'k', src: 'logo-layers/layer_k.png', startFrame: 159, fromX: 0, fromY: 260, glow: COLORS.neonBlue },
  { id: 'ai', src: 'logo-layers/layer_ai.png', startFrame: 168, fromX: 420, fromY: 0, glow: COLORS.brandYellow },
];

export const Scene1Intro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);
  const drift = getCameraDrift(frame, 1);

  // BEAT 1 (f0..f72): "Campus life moves fast." — Word-by-word kinetic entrance (Campus: f8, life: f26, moves: f38, fast.: f50)
  const beat1Exit = interpolate(frame, [66, 76], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const w1 = spring({ frame: frame - 6, fps, config: SPRINGS.snappy });
  const w2 = spring({ frame: frame - 24, fps, config: SPRINGS.snappy });
  const w3 = spring({ frame: frame - 36, fps, config: SPRINGS.snappy });
  const w4 = spring({ frame: frame - 48, fps, config: SPRINGS.bouncy });

  // BEAT 2 (f70..f144): "Too fast to follow." — Whip-down to Rapidly Counting Unanswered Inquiries Card (142 -> 748)
  const cardEnter = spring({ frame: frame - 70, fps, config: SPRINGS.whip });
  const cardExit = interpolate(frame, [136, 146], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const counterValue = Math.floor(
    interpolate(frame, [78, 136], [142, 748], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const waitHours = interpolate(frame, [78, 136], [1.2, 6.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }).toFixed(1);

  // BEAT 3 (f142..f215): "Meet TAGA-asK AI." — Deconstructed 5-Layer Brand Lockup + Tagline
  const aiShockwave = interpolate(frame, [168, 188], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const taglineSpring = spring({ frame: frame - 178, fps, config: SPRINGS.snappy });
  const exitPortal = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const lockupWidth = layout.isVertical ? 800 : 860;
  const lockupHeight = Math.round(lockupWidth * (819 / 1024));

  return (
    <AbsoluteFill>
      <MacroCameraRig
        scale={interpolate(frame, [0, 70, 140, 180, durationInFrames], [1.06, 1.12, 1.04, 1.0, 1.04])}
        translateX={drift.translateX * 0.35}
        translateY={drift.translateY * 0.35}
        translateZ={drift.translateZ * 0.35}
        rotateX={interpolate(frame, [0, 75, 145, durationInFrames], [4, 10, 6, 0])}
        rotateY={interpolate(frame, [0, 75, 145, durationInFrames], [-4, 6, -4, 0])}
        perspective={layout.perspective}
      >
        {/* BEAT 1 (f0..f75): Kinetic Text "Campus life moves fast." */}
        {frame < 76 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              opacity: 1 - beat1Exit,
              transform: `translateY(${interpolate(beat1Exit, [0, 1], [0, -180])}px) scale(${interpolate(beat1Exit, [0, 1], [1, 0.92])})`,
              filter: beat1Exit > 0.05 ? `blur(${(beat1Exit * 12).toFixed(1)}px)` : undefined,
            }}
          >
            {[
              { text: 'Campus', p: w1, accent: false },
              { text: 'life', p: w2, accent: false },
              { text: 'moves', p: w3, accent: false },
              { text: 'fast.', p: w4, accent: true },
            ].map((item, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  fontSize: layout.isVertical ? 76 : 92,
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  color: item.accent ? COLORS.brandCyan : '#FFFFFF',
                  textShadow: item.accent
                    ? `0 0 36px ${COLORS.brandCyan}, 0 0 68px ${COLORS.neonBlue}`
                    : '0 10px 30px rgba(0,0,0,0.5)',
                  opacity: item.p,
                  transform: `translateY(${interpolate(item.p, [0, 1], [42, 0])}px) scale(${interpolate(item.p, [0, 1], [0.84, 1])})`,
                  filter: item.p < 0.9 ? `blur(${((1 - item.p) * 10).toFixed(1)}px)` : undefined,
                }}
              >
                {item.text}
              </span>
            ))}
          </div>
        )}

        {/* BEAT 2 (f70..f146): "Too fast to follow." — Rapidly Counting Campus Inquiry Report Card (modeled on @frameonvis Expense Report) */}
        {frame >= 68 && frame < 147 && (
          <div
            style={{
              position: 'absolute',
              width: layout.isVertical ? 860 : 880,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              opacity: cardEnter * (1 - cardExit),
              transform: `translateY(${interpolate(cardEnter, [0, 1], [320, 0]) + interpolate(cardExit, [0, 1], [0, -240])}px) scale(${0.92 + 0.08 * cardEnter})`,
              filter:
                cardEnter < 0.85
                  ? `blur(${((1 - cardEnter) * 14).toFixed(1)}px)`
                  : cardExit > 0.1
                  ? `blur(${(cardExit * 14).toFixed(1)}px)`
                  : undefined,
            }}
          >
            {/* Top Counter Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: COLORS.textSilver,
                  letterSpacing: '-0.01em',
                }}
              >
                Unanswered Student Posts
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span
                  style={{
                    fontSize: 78,
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.03em',
                    color: '#FFFFFF',
                    textShadow: `0 0 36px ${COLORS.dangerRed}`,
                  }}
                >
                  {counterValue}
                </span>
                <span
                  style={{
                    fontSize: 34,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: COLORS.dangerRed,
                  }}
                >
                  • {waitHours} hrs waiting
                </span>
              </div>
            </div>

            {/* Dark Glass Inquiry List Card */}
            <GlassPanel
              width="100%"
              borderRadius={34}
              borderColor="rgba(111, 168, 255, 0.42)"
              glowColor="rgba(59, 108, 255, 0.45)"
              glowSpread={64}
            >
              <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {INQUIRY_ROWS.map((row, idx) => {
                  const rowP = spring({
                    frame: frame - (76 + idx * 5),
                    fps,
                    config: SPRINGS.snappy,
                  });
                  return (
                    <div
                      key={row.title}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: idx < INQUIRY_ROWS.length - 1 ? 14 : 0,
                        borderBottom:
                          idx < INQUIRY_ROWS.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                        opacity: rowP,
                        transform: `translateY(${interpolate(rowP, [0, 1], [20, 0])}px)`,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>{row.title}</span>
                        <span style={{ fontSize: 22, fontWeight: 500, color: COLORS.textSilver }}>{row.sub}</span>
                      </div>
                      <span
                        style={{
                          padding: '8px 22px',
                          borderRadius: 999,
                          background: 'linear-gradient(135deg, #FF3B6B 0%, #D91B52 100%)',
                          boxShadow: '0 0 24px rgba(255, 59, 107, 0.45)',
                          fontSize: 24,
                          fontWeight: 800,
                          color: '#FFFFFF',
                        }}
                      >
                        {row.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>
          </div>
        )}

        {/* BEAT 3 (f142..f215): "Meet TAGA-asK AI." — 5-Layer Deconstructed Brand Lockup */}
        {frame >= 142 && (
          <div
            style={{
              position: 'relative',
              width: lockupWidth,
              height: lockupHeight,
              marginTop: -30,
              transformStyle: 'preserve-3d',
            }}
          >
            {LOGO_LAYERS.map((layer) => {
              const p = spring({
                frame: frame - layer.startFrame,
                fps,
                config: layer.id === 'ai' ? SPRINGS.slam : SPRINGS.snappy,
              });
              const tx = interpolate(p, [0, 1], [layer.fromX, 0]);
              const ty = interpolate(p, [0, 1], [layer.fromY, 0]);
              const scale = interpolate(p, [0, 1], [0.82, 1]);
              const dofBlur = Math.max(0, (1 - p) * 14);
              const opacity = interpolate(frame, [layer.startFrame - 2, layer.startFrame + 4], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              return (
                <Img
                  key={layer.id}
                  src={staticFile(layer.src)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity,
                    transform: `translate3d(${tx}px, ${ty}px, 0px) scale(${scale})`,
                    filter: `blur(${dofBlur.toFixed(1)}px) drop-shadow(0 0 26px ${layer.glow})`,
                  }}
                />
              );
            })}
          </div>
        )}

        {frame >= 174 && (
          <div
            style={{
              position: 'absolute',
              bottom: 125,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              opacity: taglineSpring,
              transform: `translateY(${interpolate(taglineSpring, [0, 1], [24, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: COLORS.textWhite,
                textShadow: `0 0 26px ${COLORS.brandCyan}`,
              }}
            >
              Your UMak <span style={{ color: COLORS.brandYellow }}>AI</span> Companion
            </div>
          </div>
        )}
      </MacroCameraRig>

      <FullScreenShockwave progress={aiShockwave} centerX="56%" centerY="52%" />
      <RingPortalOverlay progress={exitPortal} centerX="50%" centerY="50%" />
    </AbsoluteFill>
  );
};
