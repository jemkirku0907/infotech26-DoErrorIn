import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import {
  AnimatedCheckIcon,
  AnimatedShieldIcon,
  getCameraDrift,
  getCameraShake,
  GlassPanel,
  KineticHeadline,
  MacroCameraRig,
  NeonWaveformBar,
  RingPortalOverlay,
  SPRINGS,
} from '../presets';

export const Scene6Security: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);
  const drift = getCameraDrift(frame, 6);

  // PHASE A (local 0..108): "UMak accounts only. Protected from spam."
  const phaseAExit = interpolate(frame, [104, 114], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const shieldSpring = spring({ frame, fps, config: SPRINGS.glassCard });
  const umakCheckSpring = spring({ frame: frame - 16, fps, config: SPRINGS.bouncy });
  const emailShake = getCameraShake(frame, 36, 7, 10);
  const rejectToastSpring = spring({ frame: frame - 36, fps, config: SPRINGS.snappy });

  const isCleared = frame >= 92;
  const reqCount = isCleared
    ? 1
    : Math.min(20, Math.floor(interpolate(frame, [48, 60], [12, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));
  const barFill = isCleared ? 0.12 : reqCount / 20;
  const rateLimitToastSpring = spring({ frame: frame - 56, fps, config: SPRINGS.snappy });

  // PHASE B (local 108..183): "No noise, no waiting..." + Centered Verified Pill Badge (replicates @frameonvis 00:16 "✓ Japan trip ready!" pill + chime!)
  const wNo1 = spring({ frame: frame - 110, fps, config: SPRINGS.snappy });
  const wNoise = spring({ frame: frame - 118, fps, config: SPRINGS.snappy });
  const wNo2 = spring({ frame: frame - 131, fps, config: SPRINGS.snappy });
  const wWaiting = spring({ frame: frame - 139, fps, config: SPRINGS.snappy });
  const pillPop = spring({ frame: frame - 150, fps, config: SPRINGS.bouncy });

  const exitPortal = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const stageW = layout.isVertical ? layout.contentWidth : 1440;

  return (
    <AbsoluteFill>
      <MacroCameraRig
        scale={interpolate(frame, [0, 55, 110, 155, durationInFrames], [1.08, 1.12, 1.0, 1.06, 1.02])}
        translateX={drift.translateX * 0.35}
        translateY={drift.translateY * 0.35 - 16}
        translateZ={drift.translateZ * 0.35}
        rotateX={interpolate(frame, [0, 108, 120, durationInFrames], [12, 10, 0, 0])}
        rotateY={interpolate(frame, [0, 50, 108, 120, durationInFrames], [8, -8, 0, 0, 0])}
        perspective={1320}
      >
        {/* PHASE A (local 0..114): Two-Card 3D Glass Security Stage */}
        {frame < 115 && (
          <div
            style={{
              width: stageW,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 26,
              opacity: 1 - phaseAExit,
              transform: `scale(${1 - phaseAExit * 0.08}) translateY(${interpolate(phaseAExit, [0, 1], [0, -120])}px)`,
              filter: phaseAExit > 0.05 ? `blur(${(phaseAExit * 12).toFixed(1)}px)` : undefined,
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                transform: `scale(${0.88 + 0.12 * shieldSpring}) translateZ(36px)`,
                opacity: shieldSpring,
              }}
            >
              <div style={{ width: 82, height: 82 }}>
                <AnimatedShieldIcon size={82} progress={shieldSpring} />
              </div>
              <KineticHeadline
                text="Built-in security."
                frame={frame}
                fps={fps}
                startFrame={2}
                fontSize={layout.isVertical ? 56 : 66}
                accentWords={['security.']}
              />
            </div>

            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: layout.isVertical ? '1fr' : '1.05fr 0.95fr',
                gap: 28,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Card 1: UMak Login Verification & Non-UMak Rejection */}
              <div style={{ transform: `translate3d(${emailShake.x}px, ${emailShake.y}px, 24px) rotateY(6deg)` }}>
                <GlassPanel
                  width="100%"
                  borderRadius={34}
                  active={frame < 55}
                  glowColor={frame >= 35 && frame < 55 ? 'rgba(255, 77, 109, 0.48)' : 'rgba(34, 171, 227, 0.48)'}
                >
                  <div style={{ padding: '28px 34px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <span style={{ fontSize: 30, fontWeight: 800, color: '#FFFFFF' }}>UMak Login</span>

                    <div
                      style={{
                        padding: '15px 22px',
                        borderRadius: 20,
                        background: 'rgba(34, 171, 227, 0.15)',
                        border: `1.5px solid ${COLORS.brandCyan}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF' }}>
                        juan.delacruz@umak.edu.ph
                      </span>
                      {frame >= 16 && (
                        <div style={{ width: 36, height: 36, transform: `scale(${umakCheckSpring})` }}>
                          <AnimatedCheckIcon size={36} progress={umakCheckSpring} />
                        </div>
                      )}
                    </div>

                    {frame >= 28 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div
                          style={{
                            padding: '14px 22px',
                            borderRadius: 20,
                            background: 'rgba(255, 77, 109, 0.15)',
                            border: `1.5px solid ${COLORS.dangerRed}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: 26, fontWeight: 600, color: '#FFE4E8' }}>
                            visitor.account@gmail.com
                          </span>
                          <span style={{ fontSize: 26, fontWeight: 800, color: COLORS.dangerRed }}>✕</span>
                        </div>
                        {frame >= 36 && (
                          <div
                            style={{
                              padding: '12px 18px',
                              borderRadius: 16,
                              background: 'rgba(255, 77, 109, 0.22)',
                              border: `1.5px solid ${COLORS.dangerRed}`,
                              opacity: rejectToastSpring,
                              fontSize: 23,
                              fontWeight: 700,
                              color: '#FFFFFF',
                            }}
                          >
                            Sign-in restricted to @umak.edu.ph accounts
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </GlassPanel>
              </div>

              {/* Card 2: Smart Rate Limiting & HTTP 429 Protection */}
              <div style={{ transform: 'translate3d(0px, 0px, 24px) rotateY(-6deg)' }}>
                <GlassPanel
                  width="100%"
                  borderRadius={34}
                  active={frame >= 55}
                  glowColor={frame >= 56 && !isCleared ? 'rgba(255, 77, 109, 0.55)' : 'rgba(34, 171, 227, 0.48)'}
                >
                  <div style={{ padding: '28px 34px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textWhite }}>Request Traffic</span>
                      <span
                        style={{
                          fontSize: 30,
                          fontWeight: 800,
                          fontVariantNumeric: 'tabular-nums',
                          color: frame >= 56 && !isCleared ? COLORS.dangerRed : COLORS.brandCyan,
                        }}
                      >
                        {reqCount} / 20 req
                      </span>
                    </div>

                    <div
                      style={{
                        width: '100%',
                        height: 18,
                        borderRadius: 999,
                        background: 'rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, barFill * 100)}%`,
                          height: '100%',
                          borderRadius: 999,
                          background:
                            frame >= 56 && !isCleared
                              ? `linear-gradient(90deg, #FF758F 0%, ${COLORS.dangerRed} 100%)`
                              : `linear-gradient(90deg, ${COLORS.neonBlue} 0%, ${COLORS.brandCyan} 100%)`,
                        }}
                      />
                    </div>

                    {frame >= 56 && !isCleared && (
                      <div
                        style={{
                          padding: '15px 20px',
                          borderRadius: 18,
                          background: 'rgba(255, 77, 109, 0.22)',
                          border: `1.5px solid ${COLORS.dangerRed}`,
                          opacity: rateLimitToastSpring,
                          fontSize: 25,
                          fontWeight: 800,
                          color: '#FFFFFF',
                        }}
                      >
                        Rate limit reached (HTTP 429)
                      </div>
                    )}

                    {isCleared && (
                      <div
                        style={{
                          padding: '15px 20px',
                          borderRadius: 18,
                          background: 'rgba(34, 171, 227, 0.2)',
                          border: `1.5px solid ${COLORS.brandCyan}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div style={{ width: 32, height: 32 }}>
                          <AnimatedCheckIcon size={32} progress={1} />
                        </div>
                        <span style={{ fontSize: 25, fontWeight: 700, color: '#FFFFFF' }}>
                          Protected & ready for new questions
                        </span>
                      </div>
                    )}

                    <NeonWaveformBar frame={frame} color={COLORS.brandCyan} height={24} />
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        )}

        {/* PHASE B (local 108..183): "No noise, no waiting..." + Centered Emerald/Cyan Confirmation Pill Badge (exact @frameonvis 00:16 beat!) */}
        {frame >= 108 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 38,
            }}
          >
            {/* Kinetic Phrase: "No noise, no waiting." */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              {[
                { text: 'No', p: wNo1, accent: false },
                { text: 'noise,', p: wNoise, accent: false },
                { text: 'no', p: wNo2, accent: false },
                { text: 'waiting.', p: wWaiting, accent: true },
              ].map((item, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: layout.isVertical ? 68 : 82,
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: item.accent ? COLORS.brandCyan : '#FFFFFF',
                    opacity: item.p,
                    transform: `translateY(${interpolate(item.p, [0, 1], [32, 0])}px)`,
                  }}
                >
                  {item.text}
                </span>
              ))}
            </div>

            {/* Centered Confirmation Pill Badge ("✓ Verified UMak Companion — Ready!") with Apple-Pay chime at local 150! */}
            {frame >= 148 && (
              <div
                style={{
                  padding: '22px 48px',
                  borderRadius: 24,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 45%, #22ABE3 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.65)',
                  boxShadow: '0 18px 60px rgba(16, 185, 129, 0.55), 0 0 42px rgba(34, 171, 227, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 18,
                  opacity: pillPop,
                  transform: `scale(${interpolate(pillPop, [0, 1], [0.65, 1])}) translateY(${interpolate(pillPop, [0, 1], [28, 0])}px)`,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.24)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#FFFFFF',
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: '#FFFFFF',
                  }}
                >
                  Verified UMak Companion ready!
                </span>
              </div>
            )}
          </div>
        )}
      </MacroCameraRig>

      <RingPortalOverlay progress={exitPortal} centerX="50%" centerY="50%" />
    </AbsoluteFill>
  );
};
