import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, getViewportLayout } from '../layout';
import {
  getCameraDrift,
  GlassPanel,
  MacroCameraRig,
  RingPortalOverlay,
  SPRINGS,
} from '../presets';

const NOTIFICATIONS = [
  {
    id: 'schedules',
    startFrame: 3, // "Schedules," (f218)
    iconBg: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    iconLabel: '💬',
    title: 'Freshmen Help Group',
    time: 'now',
    body: 'Where is my next class in HPSB? Still waiting on a reply after 4 hours...',
  },
  {
    id: 'rooms',
    startFrame: 21, // "rooms," (f236)
    iconBg: 'linear-gradient(135deg, #3B6CFF 0%, #1D4ED8 100%)',
    iconLabel: '🏢',
    title: 'Campus Room Inquiry',
    time: 'now',
    body: 'Saan po yung CIT office sa Admin Building? Need directions asap — 0 replies.',
  },
  {
    id: 'policies',
    startFrame: 34, // "policies..." (f249)
    iconBg: 'linear-gradient(135deg, #FF4D6D 0%, #E11D48 100%)',
    iconLabel: '31',
    title: 'Student Handbook & Policies',
    time: 'now',
    body: '4 official PDFs (Source01 to Source04) — which page has the scholarship rules?',
  },
];

export const Scene2Problem: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const layout = getViewportLayout(width, height);
  const drift = getCameraDrift(frame, 2);

  // BEAT 1 (local 0..64): 3 Stacked Notification Banners ("Schedules, rooms, policies...")
  const stackExit = interpolate(frame, [58, 66], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // BEAT 2 (local 64..108): "All scattered." ("all": local 67, "scattered.": local 78)
  const scat1 = spring({ frame: frame - 66, fps, config: SPRINGS.snappy });
  const scat2 = spring({ frame: frame - 76, fps, config: SPRINGS.bouncy });
  const scatExit = interpolate(frame, [102, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // BEAT 3 (local 108..165): "All unclear." ("All": local 111, "unclear.": local 121) + Lens Defocus Blur (local 126..158)
  const unc1 = spring({ frame: frame - 110, fps, config: SPRINGS.snappy });
  const unc2 = spring({ frame: frame - 120, fps, config: SPRINGS.snappy });
  const defocusBlur = interpolate(frame, [126, 146, 162], [0, 16, 20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const defocusScale = interpolate(frame, [126, 158], [1, 0.94], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const portalProgress = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bannerWidth = layout.isVertical ? 860 : 880;

  return (
    <AbsoluteFill>
      <MacroCameraRig
        scale={interpolate(frame, [0, 64, 110, durationInFrames], [1.06, 1.12, 1.04, 1.0])}
        translateX={drift.translateX * 0.3}
        translateY={drift.translateY * 0.3}
        translateZ={drift.translateZ * 0.3}
        rotateX={drift.rotateX * 0.25}
        rotateY={drift.rotateY * 0.25}
        perspective={layout.perspective}
      >
        {/* BEAT 1 (local 0..65): 3 iOS-Style Stacked Notification Banners ("Schedules, rooms, policies...") */}
        {frame < 66 && (
          <div
            style={{
              position: 'relative',
              width: bannerWidth,
              height: 360,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1 - stackExit,
              transform: `scale(${1 - stackExit * 0.08})`,
              filter: stackExit > 0.05 ? `blur(${(stackExit * 12).toFixed(1)}px)` : undefined,
              transformStyle: 'preserve-3d',
            }}
          >
            {NOTIFICATIONS.map((notif, idx) => {
              if (frame < notif.startFrame - 1) return null;
              const pop = spring({
                frame: frame - notif.startFrame,
                fps,
                config: SPRINGS.bouncy,
              });
              // Count how many newer notifications have appeared on top of this one
              const newerCount = NOTIFICATIONS.slice(idx + 1).reduce((acc, newer) => {
                const np = spring({
                  frame: frame - newer.startFrame,
                  fps,
                  config: SPRINGS.snappy,
                });
                return acc + np;
              }, 0);

              const yOffset = newerCount * 58 + interpolate(pop, [0, 1], [-70, 0]);
              const scale = (1 - newerCount * 0.045) * interpolate(pop, [0, 1], [0.86, 1]);
              const zOffset = -newerCount * 40;
              const dimOpacity = Math.max(0.45, 1 - newerCount * 0.22) * pop;

              return (
                <div
                  key={notif.id}
                  style={{
                    position: 'absolute',
                    top: 40,
                    width: '100%',
                    zIndex: 10 + idx,
                    opacity: dimOpacity,
                    transform: `translate3d(0px, ${yOffset}px, ${zOffset}px) scale(${scale})`,
                  }}
                >
                  <GlassPanel
                    width="100%"
                    borderRadius={32}
                    borderColor="rgba(255, 255, 255, 0.22)"
                    glowColor="rgba(59, 108, 255, 0.42)"
                    glowSpread={52}
                  >
                    <div
                      style={{
                        padding: '24px 32px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 22,
                        background: 'rgba(15, 23, 48, 0.94)',
                        borderRadius: 30,
                      }}
                    >
                      {/* Left App Icon Square */}
                      <div
                        style={{
                          width: 68,
                          height: 68,
                          borderRadius: 18,
                          background: notif.iconBg,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 32,
                          fontWeight: 800,
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}
                      >
                        {notif.iconLabel}
                      </div>

                      {/* Right Notification Text */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF' }}>{notif.title}</span>
                          <span style={{ fontSize: 22, fontWeight: 600, color: COLORS.textSilver }}>{notif.time}</span>
                        </div>
                        <span
                          style={{
                            fontSize: 24,
                            fontWeight: 500,
                            lineHeight: 1.32,
                            color: 'rgba(248, 250, 252, 0.88)',
                          }}
                        >
                          {notif.body}
                        </span>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              );
            })}
          </div>
        )}

        {/* BEAT 2 (local 64..109): "All scattered." */}
        {frame >= 64 && frame < 110 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              opacity: 1 - scatExit,
              transform: `scale(${1 - scatExit * 0.08})`,
              filter: scatExit > 0.05 ? `blur(${(scatExit * 10).toFixed(1)}px)` : undefined,
            }}
          >
            <span
              style={{
                fontSize: layout.isVertical ? 84 : 104,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: '#FFFFFF',
                opacity: scat1,
                transform: `translateY(${interpolate(scat1, [0, 1], [36, 0])}px)`,
              }}
            >
              All
            </span>
            <span
              style={{
                fontSize: layout.isVertical ? 84 : 104,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: COLORS.dangerRed,
                textShadow: `0 0 42px ${COLORS.dangerRed}`,
                opacity: scat2,
                transform: `translateY(${interpolate(scat2, [0, 1], [36, 0])}px) scale(${interpolate(scat2, [0, 1], [0.85, 1])})`,
              }}
            >
              scattered.
            </span>
          </div>
        )}

        {/* BEAT 3 (local 108..165): "All unclear." + Intentional Camera Defocus Blur (replicates @frameonvis 00:07!) */}
        {frame >= 108 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              transform: `scale(${defocusScale})`,
              filter: `blur(${defocusBlur.toFixed(1)}px)`,
              opacity: interpolate(frame, [152, 164], [1, 0.15], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            <span
              style={{
                fontSize: layout.isVertical ? 84 : 104,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: '#FFFFFF',
                opacity: unc1,
                transform: `translateY(${interpolate(unc1, [0, 1], [32, 0])}px)`,
              }}
            >
              All
            </span>
            {frame >= 119 && (
              <span
                style={{
                  fontSize: layout.isVertical ? 84 : 104,
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  color: COLORS.textSilver,
                  opacity: unc2,
                  transform: `translateX(${interpolate(unc2, [0, 1], [28, 0])}px)`,
                }}
              >
                unclear.
              </span>
            )}
          </div>
        )}
      </MacroCameraRig>

      <RingPortalOverlay progress={portalProgress} centerX="50%" centerY="50%" />
    </AbsoluteFill>
  );
};
