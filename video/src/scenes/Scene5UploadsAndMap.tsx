import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import {
  AnimatedMapPinIcon,
  AnimatedUploadRingIcon,
  getCameraDrift,
  getRackFocusBlur,
  GlassPanel,
  MacroCameraRig,
  NeonWaveformBar,
  RingPortalOverlay,
  SPRINGS,
} from '../presets';

const STACKED_CARD_TITLES = ['Citations', 'Uploads', 'Campus Map', 'UMak Login'] as const;

export const Scene5UploadsAndMap: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);
  const drift = getCameraDrift(frame, 5);

  const isMapPhase = frame >= 108;
  const activeCardTitle = isMapPhase ? 'Campus Map' : 'Uploads';

  const swapProgress = spring({
    frame: frame - 108,
    fps,
    config: SPRINGS.glassCard,
  });
  const uploadsBlur = interpolate(swapProgress, [0, 0.5, 1], [0, 14, 20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const mapRackBlur = getRackFocusBlur(frame, 108, 128, 18);

  const thumbFlySpring = spring({
    frame: frame - 20,
    fps,
    config: SPRINGS.glassCard,
  });
  const fileChipSpring = spring({
    frame: frame - 38,
    fps,
    config: SPRINGS.snappy,
  });
  const replySpring = spring({
    frame: frame - 74,
    fps,
    config: SPRINGS.glassCard,
  });

  const pinDropSpring = spring({
    frame: frame - 128,
    fps,
    config: SPRINGS.bouncy,
  });

  // Macro 3D Camera Orbit: tilts left during Uploads (Part A), then swoops into a dramatic 3D tilted floating Map Panel in Part B!
  const camScale = interpolate(
    frame,
    [0, 50, 104, 142, durationInFrames],
    [1.12, 1.18, 1.08, 1.24, 1.16],
    { extrapolateRight: 'clamp' }
  );
  const camRotX = interpolate(
    frame,
    [0, 55, 108, 150, durationInFrames],
    [14, 10, 22, 16, 12],
    { extrapolateRight: 'clamp' }
  );
  const camRotY = interpolate(
    frame,
    [0, 55, 108, 150, durationInFrames],
    [-10, -6, -20, -12, -8],
    { extrapolateRight: 'clamp' }
  );

  const exitPortal = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const stageW = layout.isVertical ? layout.contentWidth : 1460;

  return (
    <AbsoluteFill>
      <MacroCameraRig
        scale={camScale}
        translateX={drift.translateX * 0.4}
        translateY={drift.translateY * 0.4 - 24}
        translateZ={drift.translateZ * 0.4}
        rotateX={camRotX}
        rotateY={camRotY}
        perspective={1320}
      >
        <div
          style={{
            width: stageW,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 1. Stacked 3D Glass Cards Fan-Out Header (exact 4 allowed titles) */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: layout.isVertical ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 18,
              transformStyle: 'preserve-3d',
              zIndex: 30,
            }}
          >
            {STACKED_CARD_TITLES.map((title, idx) => {
              const fanSpring = spring({
                frame: frame - idx * 4,
                fps,
                config: SPRINGS.snappy,
              });
              const isActive = title === activeCardTitle;
              const zOffset = isActive ? 42 : -18 * Math.abs(idx - (isMapPhase ? 2 : 1));
              const cardBlur = isActive ? 0 : 2.2;

              return (
                <div
                  key={title}
                  style={{
                    transform: `translate3d(0px, ${interpolate(fanSpring, [0, 1], [60, 0])}px, ${zOffset}px)`,
                    opacity: fanSpring,
                  }}
                >
                  <GlassPanel
                    width="100%"
                    borderRadius={26}
                    active={isActive}
                    dofBlurPx={cardBlur}
                    borderColor={isActive ? COLORS.brandCyan : 'rgba(111, 168, 255, 0.35)'}
                    glowColor={isActive ? 'rgba(34, 171, 227, 0.55)' : 'rgba(59, 108, 255, 0.18)'}
                    glowSpread={isActive ? 48 : 22}
                  >
                    <div
                      style={{
                        padding: layout.isVertical ? '18px 22px' : '20px 26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: layout.isVertical ? 29 : 31,
                          fontWeight: isActive ? 800 : 600,
                          color: isActive ? '#FFFFFF' : COLORS.textSilver,
                          textShadow: isActive ? `0 0 20px ${COLORS.brandCyan}` : 'none',
                        }}
                      >
                        {title}
                      </span>
                    </div>
                  </GlassPanel>
                </div>
              );
            })}
          </div>

          {/* 2. Main 3D Stage: Smooth Slide Swap between Uploads (Part A) & Real UMak Campus Map Visualizer (Part B) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: layout.isVertical ? 940 : 580,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* PART A: UPLOADS CARD STAGE */}
            {swapProgress < 0.98 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translate3d(${interpolate(swapProgress, [0, 1], [0, -width * 0.85])}px, 0px, ${interpolate(swapProgress, [0, 1], [24, -180])}px) rotateY(${interpolate(swapProgress, [0, 1], [0, 18])}deg)`,
                  opacity: 1 - swapProgress,
                }}
              >
                <GlassPanel
                  width="100%"
                  borderRadius={36}
                  dofBlurPx={uploadsBlur}
                  sweepAngle={(frame * 4.5) % 360}
                  glowColor="rgba(59, 108, 255, 0.48)"
                >
                  <div
                    style={{
                      padding: layout.isVertical ? '30px 32px' : '32px 42px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 22,
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
                      <div style={{ width: 64, height: 64, transform: `scale(${thumbFlySpring})` }}>
                        <AnimatedUploadRingIcon size={64} progress={fileChipSpring} />
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '12px 22px',
                          borderRadius: 20,
                          background: 'rgba(34, 171, 227, 0.16)',
                          border: `1.5px solid ${COLORS.brandCyan}`,
                          boxShadow: '0 0 28px rgba(34, 171, 227, 0.35)',
                          transform: `translate3d(${interpolate(thumbFlySpring, [0, 1], [-180, 0])}px, 0px, 0px)`,
                          opacity: thumbFlySpring,
                        }}
                      >
                        <span style={{ fontSize: 27, fontWeight: 700, color: '#FFFFFF' }}>
                          📄 Class_Schedule_1stSem.pdf
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: '12px 22px',
                          borderRadius: 20,
                          background: 'rgba(59, 108, 255, 0.16)',
                          border: `1.5px solid ${COLORS.neonIce}`,
                          transform: `translate3d(${interpolate(thumbFlySpring, [0, 1], [180, 0])}px, 0px, 0px)`,
                          opacity: thumbFlySpring,
                        }}
                      >
                        <span style={{ fontSize: 27, fontWeight: 700, color: '#FFFFFF' }}>
                          🖼️ Campus_Notice.png
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        alignSelf: 'flex-end',
                        padding: '14px 26px',
                        borderRadius: '26px 26px 8px 26px',
                        background: `linear-gradient(135deg, ${COLORS.neonBlue} 0%, ${COLORS.brandNavy} 100%)`,
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 10px 30px rgba(59, 108, 255, 0.4)',
                        fontSize: 30,
                        fontWeight: 700,
                        color: '#FFFFFF',
                      }}
                    >
                      Where is my next class?
                    </div>

                    {frame >= 88 && (
                      <div
                        style={{
                          padding: '20px 28px',
                          borderRadius: 26,
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(111, 168, 255, 0.4)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 14,
                          transform: `translateY(${interpolate(replySpring, [0, 1], [36, 0])}px)`,
                          opacity: replySpring,
                        }}
                      >
                        <span style={{ fontSize: 29, lineHeight: 1.38, fontWeight: 600, color: COLORS.textWhite }}>
                          Your next class in <span style={{ color: COLORS.brandYellow }}>Class_Schedule_1stSem.pdf</span> is at the{' '}
                          <span style={{ color: COLORS.brandCyan }}>Admin Building, Second Floor, South Wing</span>.
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '7px 18px',
                              borderRadius: 999,
                              background: 'rgba(34, 171, 227, 0.2)',
                              border: `1.5px solid ${COLORS.brandCyan}`,
                              fontSize: 25,
                              fontWeight: 700,
                              color: '#FFFFFF',
                            }}
                          >
                            Source03.pdf, Page 1
                          </span>
                          <div style={{ width: 280 }}>
                            <NeonWaveformBar frame={frame} height={26} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </GlassPanel>
              </div>
            )}

            {/* PART B: 3D TILTED UMAK CAMPUS MAP & LOCATION VISUALIZER (replicates macro-ref-1 v1_f028.jpg + real map screenshot!) */}
            {swapProgress > 0.02 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translate3d(${interpolate(swapProgress, [0, 1], [width * 0.85, 0])}px, 0px, ${interpolate(swapProgress, [0, 1], [-180, 32])}px) rotateY(${interpolate(swapProgress, [0, 1], [-22, 0])}deg)`,
                  opacity: swapProgress,
                }}
              >
                <GlassPanel
                  width="100%"
                  borderRadius={38}
                  dofBlurPx={mapRackBlur}
                  active
                  glowColor="rgba(34, 171, 227, 0.65)"
                  glowSpread={76}
                >
                  <div
                    style={{
                      padding: layout.isVertical ? '30px 30px' : '32px 42px',
                      display: 'flex',
                      flexDirection: layout.isVertical ? 'column' : 'row',
                      alignItems: 'stretch',
                      justifyContent: 'space-between',
                      gap: 28,
                    }}
                  >
                    {/* Left Map Canvas: Authentic UMak Campus Building Layout from Screenshot 2 */}
                    <div
                      style={{
                        flex: 1.35,
                        borderRadius: 28,
                        background: 'rgba(5, 10, 28, 0.92)',
                        border: '1.5px solid rgba(111, 168, 255, 0.4)',
                        padding: '24px 26px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 20,
                        boxShadow: 'inset 0 0 42px rgba(34, 171, 227, 0.22)',
                      }}
                    >
                      {/* Top Row: ADMIN BUILDING (Active Royal Blue + Yellow Border + Red/White Target Pin) & HPSB TOWER */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 20 }}>
                        {/* ADMIN BUILDING Card (matches screenshot 2 exact active highlight!) */}
                        <div
                          style={{
                            position: 'relative',
                            width: 260,
                            padding: '26px 20px',
                            borderRadius: 24,
                            background: `linear-gradient(135deg, #2D4FE0 0%, #223B9E 100%)`,
                            border: `3px solid ${COLORS.brandYellow}`,
                            boxShadow: `0 0 46px rgba(59, 108, 255, 0.8), 0 0 24px rgba(244, 235, 42, 0.45)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            transform: `scale(${0.92 + 0.08 * pinDropSpring})`,
                          }}
                        >
                          {/* Pulsing Red/White Target Pin + Bouncing Yellow Map Pin */}
                          <div
                            style={{
                              position: 'absolute',
                              top: -28,
                              transform: `scale(${pinDropSpring})`,
                            }}
                          >
                            <AnimatedMapPinIcon size={58} frame={frame} />
                          </div>
                          <span style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', marginTop: 8 }}>
                            Admin Building
                          </span>
                          <span style={{ fontSize: 22, fontWeight: 600, color: COLORS.neonIce }}>
                            Second Floor, South Wing
                          </span>
                        </div>

                        {/* HPSB TOWER */}
                        <div
                          style={{
                            width: 220,
                            padding: '24px 18px',
                            borderRadius: 22,
                            background: 'rgba(34, 171, 227, 0.14)',
                            border: '1.5px solid rgba(34, 171, 227, 0.45)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span style={{ fontSize: 25, fontWeight: 800, color: COLORS.brandCyan }}>
                            HPSB Tower
                          </span>
                          <span style={{ fontSize: 21, fontWeight: 500, color: COLORS.textSilver }}>
                            12 Floors
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Academic 1, Academic 2, Academic 3, UMak Oval */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        {['Academic 1', 'Academic 2', 'Academic 3'].map((bldg, bIdx) => (
                          <div
                            key={bldg}
                            style={{
                              padding: '14px 12px',
                              borderRadius: 18,
                              background:
                                bIdx === 0
                                  ? 'rgba(244, 235, 42, 0.14)'
                                  : 'rgba(111, 168, 255, 0.12)',
                              border: `1.5px solid ${
                                bIdx === 0 ? 'rgba(244, 235, 42, 0.45)' : 'rgba(111, 168, 255, 0.3)'
                              }`,
                              textAlign: 'center',
                              fontSize: 23,
                              fontWeight: 700,
                              color: '#FFFFFF',
                            }}
                          >
                            {bldg}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Directory Panel from Screenshot 2: Admin Building • Second Floor • CIT Office */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 18,
                      }}
                    >
                      <div
                        style={{
                          padding: '26px 30px',
                          borderRadius: 28,
                          background: 'rgba(11, 18, 48, 0.9)',
                          border: `2px solid ${COLORS.brandYellow}`,
                          boxShadow: '0 0 42px rgba(244, 235, 42, 0.35)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        <span style={{ fontSize: 34, fontWeight: 800, color: COLORS.brandYellow }}>
                          CIT Office, South Wing, 2F
                        </span>
                        <span style={{ fontSize: 26, fontWeight: 600, color: COLORS.textWhite }}>
                          Admin Building • Source03.pdf, Page 1
                        </span>
                        <NeonWaveformBar frame={frame} color={COLORS.brandYellow} height={28} />
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            )}
          </div>
        </div>
      </MacroCameraRig>
      <RingPortalOverlay progress={exitPortal} centerX="50%" centerY="50%" />
    </AbsoluteFill>
  );
};
