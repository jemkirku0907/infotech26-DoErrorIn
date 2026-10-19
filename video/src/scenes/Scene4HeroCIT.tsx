import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import {
  AnimatedCheckIcon,
  AnimatedMapPinIcon,
  FullScreenShockwave,
  getCameraDrift,
  GlassPanel,
  GlowingCursor,
  HeronRingMark,
  MacroCameraRig,
  NeonConnector,
  NeonWaveformBar,
  SPRINGS,
} from '../presets';

const ANSWER_TOKENS = [
  'The',
  'Center',
  'for',
  'Information',
  'Technology',
  '(CIT)',
  'is',
  'on',
  'the',
  'Second',
  'Floor,',
  'South',
  'Wing,',
  'Admin',
  'Building.',
];

const HIGHLIGHT_INDICES = new Set([9, 10, 11, 12, 13, 14]);

export const Scene4HeroCIT: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);
  const drift = getCameraDrift(frame, 4);

  const borderSweepAngle = (frame * 5.2) % 360;

  // Beat 1 (f0..f54): macro-ref-1 Close-Up Horizontal Panning Input Bar (replicates v1_f016.jpg)
  const enPrompt = 'Where is the CIT?';
  const tlPrompt = 'Saan ang CIT?';
  const typedCount = Math.floor(
    interpolate(frame, [6, 34], [0, enPrompt.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const morphToTaglish = interpolate(frame, [36, 46], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const activePromptText =
    frame < 6
      ? 'Ask TAGA-asK AI anything...'
      : morphToTaglish > 0.5
      ? tlPrompt
      : enPrompt.slice(0, typedCount);
  const isPlaceholder = frame < 6;

  // Beat 2 (f50..f76): Full-screen neon blue shockwave ring when clicking Send (replicates v1_f019.jpg)
  const shockwaveProgress = interpolate(frame, [51, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beat 3 (f62..end): 3D Answer Card + Right-Angle Connector + PDF Reference Carousel Card + Waveform
  const answerSpring = spring({
    frame: frame - 62,
    fps,
    config: SPRINGS.glassCard,
  });
  const visibleTokenCount = Math.floor(
    interpolate(frame, [72, 136], [0, ANSWER_TOKENS.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const selectionProgress = interpolate(frame, [138, 162], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const connectorProgress = interpolate(frame, [164, 184], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const chipSpring = spring({
    frame: frame - 168,
    fps,
    config: SPRINGS.snappy,
  });
  const pdfSpring = spring({
    frame: frame - 180,
    fps,
    config: SPRINGS.glassCard,
  });
  const mapCardSpring = spring({
    frame: frame - 208,
    fps,
    config: SPRINGS.glassCard,
  });

  // Macro 3D Camera Choreography:
  // f0..f14: Zoom into left side of input bar (scale 1.72, tx +260)
  // f14..f50: Pan horizontally across input bar to right Send button (scale 1.78, tx -280)
  // f52..f74: Shockwave pull back to reveal 3D stage (scale 1.12, rotX 15, rotY -10)
  // f180..f230: Orbit right toward 3D PDF Reference Card (rotY +8, scale 1.18)
  const camScale = interpolate(
    frame,
    [0, 12, 36, 50, 68, 185, 232, durationInFrames],
    [1.18, 1.52, 1.56, 1.52, 1.06, 1.14, 1.1, 1.06],
    { extrapolateRight: 'clamp' }
  );
  const panRangeX = layout.isVertical ? 110 : 210;
  const camTx = interpolate(
    frame,
    [0, 12, 36, 50, 68, 185, 232, durationInFrames],
    [0, panRangeX, panRangeX * 0.85, -panRangeX * 0.85, 0, -40, -18, 0],
    { extrapolateRight: 'clamp' }
  );
  const camTy = interpolate(
    frame,
    [0, 12, 50, 68, 185, 232, durationInFrames],
    [90, 165, 165, 0, -10, -16, -8],
    { extrapolateRight: 'clamp' }
  );
  const camRotX = interpolate(
    frame,
    [0, 48, 72, 185, 235, durationInFrames],
    [14, 16, 12, 14, 10, 8],
    { extrapolateRight: 'clamp' }
  );
  const camRotY = interpolate(
    frame,
    [0, 16, 36, 50, 72, 185, 235, durationInFrames],
    [0, 10, 8, -12, -8, 8, -6, -3],
    { extrapolateRight: 'clamp' }
  );

  // Whip-pan exit over final 12 frames
  const exitWhipX = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, -width * 1.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Cursor trajectory
  const sendBtnX = layout.isVertical ? width * 0.82 : width * 0.82;
  const sendBtnY = layout.isVertical ? 520 : 455;
  const mapBtnX = layout.isVertical ? width * 0.68 : width * 0.46;
  const mapBtnY = layout.isVertical ? 790 : 605;

  const cursorMoveP = spring({
    frame: frame - 188,
    fps,
    config: SPRINGS.gentle,
  });
  const cursorX =
    frame < 188
      ? interpolate(frame, [22, 50], [sendBtnX + 110, sendBtnX], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : interpolate(cursorMoveP, [0, 1], [sendBtnX, mapBtnX]);
  const cursorY =
    frame < 188
      ? interpolate(frame, [22, 50], [sendBtnY + 80, sendBtnY], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : interpolate(cursorMoveP, [0, 1], [sendBtnY, mapBtnY]) - Math.sin(cursorMoveP * Math.PI) * 55;
  const mapClickRipple = interpolate(frame, [206, 224], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const panelMaxW = layout.isVertical ? layout.contentWidth : 1480;

  return (
    <AbsoluteFill>
      <MacroCameraRig
        scale={camScale}
        translateX={camTx + drift.translateX * 0.35 + exitWhipX}
        translateY={camTy + drift.translateY * 0.35}
        translateZ={drift.translateZ * 0.35}
        rotateX={camRotX}
        rotateY={camRotY}
        perspective={1320}
      >
        <div
          style={{
            width: panelMaxW,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* 1. Hero Glowing Input Bar with Traveling Neon Border & Real TAGA-asK AI Toolbar */}
          <div style={{ width: '100%', transform: 'translateZ(36px)' }}>
            <GlassPanel
              width="100%"
              borderRadius={36}
              sweepAngle={borderSweepAngle}
              glowColor="rgba(59, 108, 255, 0.62)"
              glowSpread={68}
            >
              <div
                style={{
                  padding: layout.isVertical ? '22px 28px' : '22px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
                    <HeronRingMark frame={frame} size={layout.isVertical ? 54 : 58} />
                    <div
                      style={{
                        fontSize: layout.isVertical ? 34 : 38,
                        fontWeight: isPlaceholder ? 500 : 700,
                        color: isPlaceholder
                          ? 'rgba(203, 213, 225, 0.62)'
                          : morphToTaglish > 0.5
                          ? COLORS.brandYellow
                          : COLORS.textWhite,
                        letterSpacing: '-0.02em',
                        display: 'flex',
                        alignItems: 'center',
                        textShadow:
                          morphToTaglish > 0.5
                            ? '0 0 24px rgba(244, 235, 42, 0.55)'
                            : '0 0 18px rgba(111, 168, 255, 0.45)',
                      }}
                    >
                      <span>{activePromptText}</span>
                      {frame < 54 && Math.floor(frame / 7) % 2 === 0 && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 4,
                            height: 40,
                            marginLeft: 6,
                            borderRadius: 2,
                            background: COLORS.brandCyan,
                            boxShadow: `0 0 14px ${COLORS.brandCyan}`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Glowing Circular ↑ Send Button (matches macro-ref-1 v1_f019.jpg) */}
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background:
                        frame >= 48 && frame <= 62
                          ? '#FFFFFF'
                          : `linear-gradient(135deg, ${COLORS.brandCyan} 0%, ${COLORS.neonBlue} 100%)`,
                      boxShadow: `0 0 ${frame >= 48 && frame <= 64 ? 64 : 28}px ${COLORS.brandCyan}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${frame >= 50 && frame <= 55 ? 0.88 : 1})`,
                    }}
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={frame >= 48 && frame <= 62 ? '#060B20' : '#FFFFFF'}
                      strokeWidth="2.8"
                    >
                      <path d="M12 19V5" />
                      <path d="m5 12 7-7 7 7" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Input Action Chips from Real UI (Attach + Campus Map) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingLeft: 76 }}>
                  <span style={{ fontSize: 24, fontWeight: 600, color: COLORS.textSilver }}>
                    📎 Attach
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 600, color: COLORS.textSilver }}>
                    🧭 Campus Map
                  </span>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* 2. Main 3D Stage: Authentic TAGA-asK AI Grounded Response Card + 3D PDF Quote Card + Map Card */}
          {frame >= 60 && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: layout.isVertical ? 'column' : 'row',
                alignItems: 'stretch',
                gap: 28,
                transform: `translate3d(0px, ${interpolate(answerSpring, [0, 1], [240, 0])}px, 0px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Left Column: Authentic TAGA-asK AI Verified Answer Card */}
              <div style={{ flex: layout.isVertical ? undefined : 1.25, position: 'relative' }}>
                <GlassPanel
                  width="100%"
                  borderRadius={34}
                  glowColor="rgba(34, 171, 227, 0.45)"
                  glowSpread={60}
                >
                  <div
                    style={{
                      padding: layout.isVertical ? '26px 30px' : '28px 36px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 18,
                    }}
                  >
                    {/* Streaming Answer Text with Yellow Selection Handles */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '9px',
                        lineHeight: 1.4,
                        fontSize: layout.isVertical ? 31 : 34,
                        fontWeight: 600,
                      }}
                    >
                      {ANSWER_TOKENS.slice(0, visibleTokenCount).map((tok, idx) => {
                        const tokenBirthFrame = 72 + Math.floor((idx / ANSWER_TOKENS.length) * 64);
                        const age = Math.max(0, frame - tokenBirthFrame);
                        const freshGlow = interpolate(age, [0, 14], [1, 0], { extrapolateRight: 'clamp' });
                        const isLocationPhrase = HIGHLIGHT_INDICES.has(idx);
                        const isHighlighted = isLocationPhrase && selectionProgress > (idx - 9) / 6;

                        return (
                          <span
                            key={`${tok}-${idx}`}
                            style={{
                              position: 'relative',
                              padding: isLocationPhrase ? '2px 6px' : undefined,
                              borderRadius: 8,
                              background: isHighlighted ? 'rgba(244, 235, 42, 0.2)' : 'transparent',
                              borderBottom: isHighlighted ? `3px solid ${COLORS.brandYellow}` : 'none',
                              color: isHighlighted ? COLORS.brandYellow : COLORS.textWhite,
                              textShadow:
                                freshGlow > 0.05
                                  ? `0 0 ${24 * freshGlow}px #FFFFFF, 0 0 ${36 * freshGlow}px ${COLORS.brandCyan}`
                                  : isHighlighted
                                  ? '0 0 20px rgba(244, 235, 42, 0.55)'
                                  : 'none',
                            }}
                          >
                            {idx === 9 && selectionProgress > 0.05 && (
                              <span
                                style={{
                                  position: 'absolute',
                                  left: -5,
                                  top: -6,
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: COLORS.brandYellow,
                                  boxShadow: `0 0 12px ${COLORS.brandYellow}`,
                                }}
                              />
                            )}
                            {idx === 14 && selectionProgress > 0.9 && (
                              <span
                                style={{
                                  position: 'absolute',
                                  right: -5,
                                  bottom: -6,
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  background: COLORS.brandYellow,
                                  boxShadow: `0 0 12px ${COLORS.brandYellow}`,
                                }}
                              />
                            )}
                            {tok}
                          </span>
                        );
                      })}
                    </div>

                    {/* Inner Location Box from Real TAGA-asK AI Screenshot + Citation Chip */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                      }}
                    >
                      {frame >= 166 && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 22px',
                            borderRadius: 999,
                            background: 'rgba(34, 171, 227, 0.18)',
                            border: `1.5px solid ${COLORS.brandCyan}`,
                            boxShadow: '0 0 32px rgba(34, 171, 227, 0.48)',
                            transform: `scale(${0.85 + 0.15 * chipSpring})`,
                            opacity: chipSpring,
                          }}
                        >
                          <div style={{ width: 32, height: 32 }}>
                            <AnimatedCheckIcon size={32} progress={chipSpring} />
                          </div>
                          <span style={{ fontSize: 27, fontWeight: 700, color: '#FFFFFF' }}>
                            Source03.pdf, Page 1
                          </span>
                        </div>
                      )}

                      {frame >= 172 && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 24px',
                            borderRadius: 999,
                            background:
                              frame >= 208
                                ? `linear-gradient(135deg, ${COLORS.brandCyan} 0%, ${COLORS.neonBlue} 100%)`
                                : 'rgba(59, 108, 255, 0.28)',
                            border: `1.5px solid ${frame >= 208 ? '#FFFFFF' : COLORS.neonIce}`,
                            boxShadow:
                              frame >= 208
                                ? `0 0 38px ${COLORS.brandCyan}`
                                : '0 0 20px rgba(59, 108, 255, 0.35)',
                            transform: `scale(${frame >= 206 && frame <= 214 ? 0.93 : 1})`,
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.brandYellow} strokeWidth="2.4">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span style={{ fontSize: 27, fontWeight: 700, color: '#FFFFFF' }}>
                            View on map
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Live Pulsing Neon Waveform along bottom of Answer Card (matches macro-ref-2 v2_f024.jpg) */}
                    <NeonWaveformBar frame={frame} height={32} />
                  </div>
                </GlassPanel>

                {!layout.isVertical && (
                  <NeonConnector
                    pathD="M 660 130 L 775 130 L 775 175 L 830 175"
                    progress={connectorProgress}
                    endX={830}
                    endY={175}
                    color={COLORS.brandCyan}
                  />
                )}
              </div>

              {/* Right Column: 3D Tilted PDF Quote Card + Admin Building Pin Card */}
              <div
                style={{
                  flex: layout.isVertical ? undefined : 0.95,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  transform: 'translateZ(48px) rotateY(-8deg)',
                }}
              >
                {frame >= 184 && (
                  <div
                    style={{
                      transform: `translateX(${interpolate(pdfSpring, [0, 1], [220, 0])}px)`,
                      opacity: pdfSpring,
                    }}
                  >
                    <GlassPanel
                      width="100%"
                      borderRadius={32}
                      active
                      glowColor="rgba(34, 171, 227, 0.5)"
                    >
                      <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 27, fontWeight: 800, color: COLORS.brandCyan }}>
                            Source03.pdf, Page 1
                          </span>
                          <div style={{ width: 34, height: 34 }}>
                            <AnimatedCheckIcon size={34} progress={pdfSpring} />
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '14px 18px',
                            borderRadius: 18,
                            background: 'rgba(244, 235, 42, 0.16)',
                            borderLeft: `4px solid ${COLORS.brandYellow}`,
                            fontSize: 26,
                            fontWeight: 600,
                            lineHeight: 1.36,
                            color: '#FFFFFF',
                          }}
                        >
                          “Center for Information Technology (CIT) — Second Floor, South Wing, Admin Building.”
                        </div>
                      </div>
                    </GlassPanel>
                  </div>
                )}

                {frame >= 208 && (
                  <div
                    style={{
                      transform: `translateY(${interpolate(mapCardSpring, [0, 1], [100, 0])}px) scale(${0.9 + 0.1 * mapCardSpring})`,
                      opacity: mapCardSpring,
                    }}
                  >
                    <GlassPanel
                      width="100%"
                      borderRadius={32}
                      glowColor="rgba(244, 235, 42, 0.42)"
                    >
                      <div
                        style={{
                          padding: '20px 26px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 18,
                          background:
                            'radial-gradient(circle at 22% 50%, rgba(34, 171, 227, 0.25) 0%, transparent 70%)',
                        }}
                      >
                        <div style={{ width: 60, height: 60, flexShrink: 0 }}>
                          <AnimatedMapPinIcon size={60} frame={frame} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 29, fontWeight: 800, color: COLORS.brandYellow }}>
                            Admin Building
                          </span>
                          <span style={{ fontSize: 26, fontWeight: 600, color: COLORS.textWhite }}>
                            Second Floor, South Wing
                          </span>
                        </div>
                      </div>
                    </GlassPanel>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </MacroCameraRig>

      {/* Full-Screen Shockwave Ring on Send Click */}
      <FullScreenShockwave progress={shockwaveProgress} centerX="50%" centerY="42%" />

      {/* Soft Glowing Pointer Cursor */}
      <GlowingCursor
        x={cursorX}
        y={cursorY}
        clicking={(frame >= 49 && frame <= 55) || (frame >= 206 && frame <= 214)}
        rippleProgress={frame < 120 ? shockwaveProgress : mapClickRipple}
        visible={frame >= 20 && frame <= 295}
      />
    </AbsoluteFill>
  );
};
