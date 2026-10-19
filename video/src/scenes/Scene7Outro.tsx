import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import {
  getCameraDrift,
  GlassPanel,
  MacroCameraRig,
  OrbitalRingMark,
  RingPortalOverlay,
  SPRINGS,
} from '../presets';

export const Scene7Outro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);
  const drift = getCameraDrift(frame, 7);

  const entryPortal = interpolate(frame, [0, 14], [0.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // BEAT 1 (local 0..50): "...just clarity." — Swings in with 3D perspective tilt (replicates @frameonvis 00:18 "Just clarity"!)
  const clarityEnter = spring({ frame: frame - 2, fps, config: SPRINGS.bouncy });
  const clarityWord2 = spring({ frame: frame - 10, fps, config: SPRINGS.bouncy });
  const clarityExit = interpolate(frame, [44, 52], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tiltRotZ = interpolate(clarityWord2, [0, 1], [11, 0]);
  const tiltRotY = interpolate(clarityWord2, [0, 1], [-24, 0]);

  // BEAT 2 (local 52..233): "TAGA-asK AI. Ask smarter." — Tarsi-Style App Icon Bounce -> Slide Left to Reveal Lockup & URL!
  const iconPop = spring({ frame: frame - 52, fps, config: SPRINGS.bouncy });
  const slideOut = spring({ frame: frame - 112, fps, config: SPRINGS.snappy });
  const urlPop = spring({ frame: frame - 126, fps, config: SPRINGS.bouncy });

  // Icon starts at X=0 in center, then slides left by -295px when "Ask smarter." begins at local 112
  const iconShiftX = interpolate(slideOut, [0, 1], [0, layout.isVertical ? 0 : -295]);
  const iconShiftY = interpolate(slideOut, [0, 1], [0, layout.isVertical ? -140 : 0]);

  return (
    <AbsoluteFill>
      <MacroCameraRig
        scale={interpolate(frame, [0, 50, 120, durationInFrames], [1.06, 1.1, 1.0, 1.04])}
        translateX={drift.translateX * 0.3}
        translateY={drift.translateY * 0.3}
        translateZ={drift.translateZ * 0.3}
        rotateX={drift.rotateX * 0.25}
        rotateY={drift.rotateY * 0.25}
        perspective={layout.perspective}
      >
        {/* BEAT 1 (local 0..52): "Just clarity." with 3D Tilt Swing */}
        {frame < 53 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              opacity: (1 - clarityExit) * clarityEnter,
              transform: `rotateZ(${tiltRotZ}deg) rotateY(${tiltRotY}deg) scale(${interpolate(clarityEnter, [0, 1], [0.82, 1]) * (1 - clarityExit * 0.12)})`,
              filter: clarityExit > 0.05 ? `blur(${(clarityExit * 12).toFixed(1)}px)` : undefined,
              transformStyle: 'preserve-3d',
            }}
          >
            <span
              style={{
                fontSize: layout.isVertical ? 86 : 108,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: '#FFFFFF',
              }}
            >
              Just
            </span>
            <span
              style={{
                fontSize: layout.isVertical ? 86 : 108,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: COLORS.brandCyan,
                textShadow: `0 0 42px ${COLORS.brandCyan}, 0 0 80px ${COLORS.neonBlue}`,
                opacity: clarityWord2,
                transform: `translateY(${interpolate(clarityWord2, [0, 1], [28, 0])}px)`,
              }}
            >
              clarity.
            </span>
          </div>
        )}

        {/* BEAT 2 (local 50..233): Tarsi-Style Icon-Slide Lockup ("TAGA-asK AI. Ask smarter.") */}
        {frame >= 50 && (
          <div
            style={{
              position: 'relative',
              width: 1180,
              height: 460,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Main Horizontal Icon + Text Row (replicates @frameonvis 00:20-00:22 "Tarsi | Take Control"!) */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: 220,
              }}
            >
              {/* Rounded-Square App Icon Badge that pops in center, then slides left */}
              <div
                style={{
                  position: 'absolute',
                  width: 176,
                  height: 176,
                  borderRadius: 44,
                  padding: 3,
                  background: `linear-gradient(135deg, ${COLORS.brandCyan} 0%, ${COLORS.neonBlue} 50%, ${COLORS.brandYellow} 100%)`,
                  boxShadow: `0 20px 65px rgba(34, 171, 227, 0.55), 0 0 48px rgba(59, 108, 255, 0.5)`,
                  opacity: iconPop,
                  transform: `translate3d(${iconShiftX}px, ${iconShiftY}px, 20px) scale(${interpolate(iconPop, [0, 1], [0.4, 1])}) rotate(${interpolate(iconPop, [0, 1], [-12, 0])}deg)`,
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 41,
                    background: 'radial-gradient(circle at 50% 50%, rgba(34, 171, 227, 0.22) 0%, rgba(13, 24, 62, 0.95) 70%, #050A1F 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <Img
                    src={staticFile('heron-clean.png')}
                    style={{
                      width: '84%',
                      height: '84%',
                      objectFit: 'contain',
                      filter: `drop-shadow(0 4px 18px rgba(244, 235, 42, 0.85)) drop-shadow(0 0 32px rgba(34, 171, 227, 0.6))`,
                    }}
                  />
                </div>
              </div>

              {/* Sliding Headline to the Right of the Icon: "TAGA-asK AI" + "Ask Smarter." */}
              {frame >= 110 && (
                <div
                  style={{
                    position: 'absolute',
                    left: layout.isVertical ? '50%' : 'calc(50% - 150px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: layout.isVertical ? 'center' : 'flex-start',
                    gap: 4,
                    opacity: slideOut,
                    transform: layout.isVertical
                      ? `translate(-50%, ${interpolate(slideOut, [0, 1], [20, 75])}px)`
                      : `translateX(${interpolate(slideOut, [0, 1], [-60, 0])}px)`,
                    filter: slideOut < 0.85 ? `blur(${((1 - slideOut) * 10).toFixed(1)}px)` : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                    <span
                      style={{
                        fontSize: 72,
                        fontWeight: 800,
                        letterSpacing: '-0.035em',
                        color: '#FFFFFF',
                      }}
                    >
                      TAGA-asK <span style={{ color: COLORS.brandYellow }}>AI</span>
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 54,
                      fontWeight: 800,
                      letterSpacing: '-0.03em',
                      color: COLORS.brandCyan,
                      textShadow: `0 0 32px ${COLORS.brandCyan}`,
                    }}
                  >
                    Ask Smarter. Stay Connected.
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Glowing URL Pill: taga-askai.vercel.app */}
            {frame >= 124 && (
              <div
                style={{
                  marginTop: 42,
                  opacity: urlPop,
                  transform: `translateY(${interpolate(urlPop, [0, 1], [28, 0])}px) scale(${interpolate(urlPop, [0, 1], [0.88, 1])})`,
                }}
              >
                <GlassPanel
                  borderRadius={999}
                  sweepAngle={(frame * 6) % 360}
                  glowColor="rgba(244, 235, 42, 0.55)"
                  glowSpread={56}
                >
                  <div
                    style={{
                      padding: '16px 42px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <OrbitalRingMark frame={frame} size={42} />
                    <span
                      style={{
                        fontSize: 36,
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                        color: COLORS.brandYellow,
                        textShadow: '0 0 24px rgba(244, 235, 42, 0.55)',
                      }}
                    >
                      taga-askai.vercel.app
                    </span>
                  </div>
                </GlassPanel>
              </div>
            )}
          </div>
        )}
      </MacroCameraRig>

      <RingPortalOverlay progress={entryPortal} centerX="50%" centerY="50%" />
    </AbsoluteFill>
  );
};
