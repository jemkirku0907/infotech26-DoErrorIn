import React from 'react';
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { noise2D } from '@remotion/noise';
import { COLORS } from '../layout';

export const AtmosphericBackground: React.FC<{
  mood?: 'default' | 'cold' | 'warm';
  showBuilding?: boolean;
}> = ({ mood = 'default', showBuilding = true }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const primaryGlow =
    mood === 'cold'
      ? 'rgba(64, 92, 148, 0.34)'
      : mood === 'warm'
      ? 'rgba(37, 99, 235, 0.48)'
      : 'rgba(59, 108, 255, 0.44)';

  const secondaryGlow =
    mood === 'cold'
      ? 'rgba(42, 57, 110, 0.24)'
      : 'rgba(34, 171, 227, 0.32)';

  // Continuous slow drifting coordinates via @remotion/noise
  const orb1X = 50 + noise2D('orb1x', frame * 0.004, 0) * 18;
  const orb1Y = 46 + noise2D('orb1y', 0, frame * 0.004) * 14;
  const orb2X = 50 + noise2D('orb2x', frame * 0.003, 10) * 24;
  const orb2Y = 54 + noise2D('orb2y', 10, frame * 0.003) * 16;

  // Deterministic drifting particles (24 subtle glowing bokeh motes)
  const particles = React.useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      baseX: random(`px-${i}`) * 100,
      baseY: random(`py-${i}`) * 100,
      size: 3 + random(`ps-${i}`) * 8,
      speedX: (random(`psx-${i}`) - 0.5) * 0.08,
      speedY: -0.04 - random(`psy-${i}`) * 0.09,
      alpha: 0.14 + random(`pa-${i}`) * 0.32,
      isYellow: i % 9 === 0,
    }));
  }, []);

  const buildingScale = interpolate(frame, [0, 1404], [1.04, 1.15], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 48%, #071130 0%, #030616 58%, #010208 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Faint UMak building photo blended under deep royal blue overlay */}
      {showBuilding && (
        <AbsoluteFill
          style={{
            opacity: mood === 'cold' ? 0.045 : 0.065,
            mixBlendMode: 'luminosity',
            transform: `scale(${buildingScale})`,
            filter: 'blur(8px) contrast(1.12)',
          }}
        >
          <Img
            src={staticFile('umak-building.jpg')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </AbsoluteFill>
      )}

      {/* Concentrated Volumetric Royal-Blue & Cyan Spotlight behind active 3D stage */}
      <AbsoluteFill
        style={{
          background: `
            radial-gradient(ellipse 58% 48% at ${orb1X}% ${orb1Y}%, ${primaryGlow} 0%, transparent 68%),
            radial-gradient(circle at ${orb2X}% ${orb2Y}%, ${secondaryGlow} 0%, transparent 56%)
          `,
        }}
      />

      {/* Slow drifting diagonal light streaks */}
      {[0, 1, 2].map((idx) => {
        const offset = ((frame * (0.45 + idx * 0.15) + idx * 240) % (width + 900)) - 450;
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: '-20%',
              left: offset,
              width: 340,
              height: '140%',
              transform: 'rotate(24deg)',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(111, 168, 255, 0.05) 50%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Floating bokeh particles */}
      {particles.map((p) => {
        const x = ((p.baseX + frame * p.speedX) % 100 + 100) % 100;
        const y = ((p.baseY + frame * p.speedY) % 100 + 100) % 100;
        const pulse = 0.7 + 0.3 * Math.sin(frame * 0.08 + p.id);
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.isYellow ? COLORS.brandYellow : COLORS.brandCyan,
              opacity: p.alpha * pulse,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.isYellow ? COLORS.brandYellow : COLORS.neonBlue}`,
              filter: p.size > 8 ? 'blur(2px)' : undefined,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Subtle anti-banding film grain / dither + deep midnight edge vignette */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.022) 1px, transparent 0), radial-gradient(rgba(34,171,227,0.018) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 46%, rgba(1, 3, 12, 0.82) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
