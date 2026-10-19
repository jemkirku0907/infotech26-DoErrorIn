import React from 'react';
import { Easing, interpolate, spring, staticFile, Img } from 'remotion';
import { COLORS, SPACING } from './layout';

// 1. Shared Spring Configurations (damping 14 to 22, tiny overshoot on key hits)
export const SPRINGS = {
  whip: { stiffness: 210, damping: 15, mass: 0.85 }, // ~6% overshoot, settles ~12 frames
  snappy: { stiffness: 185, damping: 16, mass: 0.9 },
  glassCard: { stiffness: 125, damping: 18, mass: 1.05 },
  bouncy: { stiffness: 220, damping: 14, mass: 0.8 },
  slam: { stiffness: 260, damping: 16, mass: 0.9 },
  gentle: { stiffness: 85, damping: 21, mass: 1.15 },
} as const;

export const EASINGS = {
  smoothOut: Easing.bezier(0.16, 1, 0.3, 1),
  smoothInOut: Easing.bezier(0.65, 0, 0.35, 1),
  punchy: Easing.bezier(0.22, 1, 0.36, 1),
} as const;

// 2. Decaying Camera Shake helper (e.g., 4px for 6 frames on slam/impact)
export function getCameraShake(frame: number, triggerFrame: number, amplitude = 4, duration = 6): { x: number; y: number } {
  const local = frame - triggerFrame;
  if (local < 0 || local > duration) return { x: 0, y: 0 };
  const decay = 1 - local / duration;
  const x = Math.sin(local * 2.8) * amplitude * decay;
  const y = Math.cos(local * 3.5) * (amplitude * 0.75) * decay;
  return { x, y };
}

// 3. Continuous 3D Camera Drift (ensures 0 static frames anywhere)
export function getCameraDrift(frame: number, seed = 0): {
  translateZ: number;
  rotateX: number;
  rotateY: number;
  translateX: number;
  translateY: number;
} {
  const t = (frame + seed * 37) / 30;
  return {
    translateZ: Math.sin(t * 0.9) * 18 + (frame % 180) * 0.25,
    rotateX: Math.sin(t * 0.7) * 2.2,
    rotateY: Math.cos(t * 0.55) * 3.4,
    translateX: Math.sin(t * 0.8) * 10,
    translateY: Math.cos(t * 0.65) * 8,
  };
}

// 4. Rack Focus helper (interpolates real Gaussian blur in px)
export function getRackFocusBlur(frame: number, focusStart: number, focusEnd: number, maxBlur = 18): number {
  return interpolate(frame, [focusStart, focusEnd], [maxBlur, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASINGS.smoothOut,
  });
}

// 5. Dark Glassmorphism Panel with Traveling Neon Border & Specular Top Highlight
export const GlassPanel: React.FC<{
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  blurPx?: number;
  dofBlurPx?: number;
  borderColor?: string;
  glowColor?: string;
  glowSpread?: number;
  sweepAngle?: number;
  active?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  width = 'auto',
  height = 'auto',
  borderRadius = 36,
  blurPx = 32,
  dofBlurPx = 0,
  borderColor = COLORS.neonIce,
  glowColor = 'rgba(59, 108, 255, 0.42)',
  glowSpread = 56,
  sweepAngle,
  active = false,
  style,
}) => {
  const borderBackground =
    typeof sweepAngle === 'number'
      ? `conic-gradient(from ${sweepAngle}deg at 50% 50%, rgba(59,108,255,0.32) 0deg, ${COLORS.brandCyan} 65deg, #FFFFFF 95deg, ${COLORS.neonBlue} 135deg, rgba(59,108,255,0.32) 360deg)`
      : `linear-gradient(135deg, ${borderColor} 0%, rgba(59, 108, 255, 0.35) 55%, rgba(34, 171, 227, 0.72) 100%)`;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        borderRadius,
        padding: 1.5,
        background: borderBackground,
        boxShadow: `0 20px ${glowSpread}px ${glowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.35)`,
        filter: dofBlurPx > 0.2 ? `blur(${dofBlurPx.toFixed(1)}px)` : undefined,
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: borderRadius - 1.5,
          background: active
            ? 'linear-gradient(165deg, rgba(16, 32, 82, 0.94) 0%, rgba(7, 13, 38, 0.96) 100%)'
            : 'linear-gradient(165deg, rgba(15, 25, 62, 0.92) 0%, rgba(6, 11, 32, 0.95) 100%)',
          boxShadow: 'inset 0 1px 24px rgba(111, 168, 255, 0.12)',
          backdropFilter: `blur(${blurPx}px)`,
          WebkitBackdropFilter: `blur(${blurPx}px)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top-edge inner specular highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '8%',
            right: '8%',
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.68) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
        {children}
      </div>
    </div>
  );
};

// 6. Blur-In Kinetic Gradient Text (word-by-word with optional yellow accent & selection handles)
export const KineticHeadline: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startFrame?: number;
  staggerFrames?: number;
  fontSize?: number;
  accentWords?: string[];
  selectedWord?: string;
  selectionProgress?: number;
  lightSweepFrame?: number;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}> = ({
  text,
  frame,
  fps,
  startFrame = 0,
  staggerFrames = 4,
  fontSize = 76,
  accentWords = [],
  selectedWord,
  selectionProgress = 0,
  lightSweepFrame,
  align = 'center',
  style,
}) => {
  const words = text.split(' ');
  const accentSet = new Set(accentWords.map((w) => w.toLowerCase()));

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        gap: `${Math.round(fontSize * 0.24)}px`,
        lineHeight: 1.12,
        letterSpacing: '-0.03em',
        fontWeight: 800,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const wStart = startFrame + i * staggerFrames;
        const p = spring({
          frame: frame - wStart,
          fps,
          config: SPRINGS.snappy,
        });
        const blur = interpolate(p, [0, 1], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const y = interpolate(p, [0, 1], [24, 0]);
        const opacity = interpolate(p, [0, 0.6, 1], [0, 0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        const cleanWord = word.replace(/[.,?!:]/g, '').toLowerCase();
        const isAccent = accentSet.has(cleanWord) || accentSet.has(word.toLowerCase());
        const isSelected =
          selectedWord && (cleanWord === selectedWord.toLowerCase() || word.toLowerCase() === selectedWord.toLowerCase());

        return (
          <span
            key={`${word}-${i}`}
            style={{
              position: 'relative',
              display: 'inline-block',
              transform: `translateY(${y}px) scale(${0.92 + 0.08 * p})`,
              opacity,
              filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
              padding: isSelected ? '0 10px' : undefined,
            }}
          >
            {isSelected && selectionProgress > 0.01 && (
              <span
                style={{
                  position: 'absolute',
                  inset: '-4px -6px',
                  width: `${Math.min(100, selectionProgress * 100)}%`,
                  background: 'rgba(244, 235, 42, 0.18)',
                  borderLeft: `3px solid ${COLORS.brandYellow}`,
                  borderRight: selectionProgress > 0.9 ? `3px solid ${COLORS.brandYellow}` : 'none',
                  borderRadius: 8,
                  boxShadow: '0 0 28px rgba(244, 235, 42, 0.35)',
                  pointerEvents: 'none',
                }}
              >
                {/* Top & bottom selection drag handles */}
                <span
                  style={{
                    position: 'absolute',
                    top: -7,
                    left: -7,
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    background: COLORS.brandYellow,
                    boxShadow: `0 0 12px ${COLORS.brandYellow}`,
                  }}
                />
                {selectionProgress > 0.9 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -7,
                      right: -7,
                      width: 11,
                      height: 11,
                      borderRadius: '50%',
                      background: COLORS.brandYellow,
                      boxShadow: `0 0 12px ${COLORS.brandYellow}`,
                    }}
                  />
                )}
              </span>
            )}
            <span
              style={{
                fontSize,
                background:
                  isAccent || (isSelected && selectionProgress > 0.5)
                    ? `linear-gradient(180deg, #FFFDE0 0%, ${COLORS.brandYellow} 75%)`
                    : 'linear-gradient(180deg, #FFFFFF 0%, #D8E8FF 52%, #6FA8FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter:
                  isAccent || (isSelected && selectionProgress > 0.5)
                    ? 'drop-shadow(0 0 22px rgba(244, 235, 42, 0.45))'
                    : 'drop-shadow(0 0 24px rgba(59, 108, 255, 0.42))',
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// 7. TAGA Heron Mark Inside a Glowing Spinning Ring
export const HeronRingMark: React.FC<{
  frame: number;
  size?: number;
  pulse?: number;
}> = ({ frame, size = 84, pulse = 1 }) => {
  const angle = (frame * 3.2) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${pulse})`,
        boxShadow: `0 0 ${Math.round(size * 0.55)}px rgba(34, 171, 227, 0.65), inset 0 0 ${Math.round(size * 0.25)}px rgba(59, 108, 255, 0.55)`,
      }}
    >
      {/* Spinning neon conic ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: Math.max(3, Math.round(size * 0.055)),
          background: `conic-gradient(from ${angle}deg, ${COLORS.neonBlue}, ${COLORS.brandCyan}, ${COLORS.brandYellow}, ${COLORS.neonIce}, ${COLORS.neonBlue})`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <Img
        src={staticFile('logo-layers/layer_heron.png')}
        style={{
          width: size * 0.76,
          height: size * 0.76,
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 10px rgba(244, 235, 42, 0.65))',
        }}
      />
    </div>
  );
};

// 8. Soft Glowing Pointer Cursor along Bezier Curve with Click Ripple
export const GlowingCursor: React.FC<{
  x: number;
  y: number;
  clicking?: boolean;
  rippleProgress?: number; // 0 to 1
  visible?: boolean;
}> = ({ x, y, clicking = false, rippleProgress = 0, visible = true }) => {
  if (!visible) return null;
  const scale = clicking ? 0.86 : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-6px, -6px)',
        pointerEvents: 'none',
        zIndex: 80,
      }}
    >
      {rippleProgress > 0.01 && rippleProgress < 0.99 && (
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            width: 120 * rippleProgress,
            height: 120 * rippleProgress,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            border: `2.5px solid ${COLORS.brandCyan}`,
            background: `radial-gradient(circle, rgba(34,171,227,${0.35 * (1 - rippleProgress)}) 0%, transparent 70%)`,
            boxShadow: `0 0 32px ${COLORS.brandCyan}`,
            opacity: 1 - rippleProgress,
          }}
        />
      )}
      <svg
        width="42"
        height="42"
        viewBox="0 0 36 36"
        style={{
          transform: `scale(${scale})`,
          filter: `drop-shadow(0 0 16px ${COLORS.brandCyan}) drop-shadow(0 4px 12px rgba(0,0,0,0.6))`,
        }}
      >
        <path
          d="M6 4L28 15L17 18.5L13.5 29.5L6 4Z"
          fill="#FFFFFF"
          stroke={COLORS.brandCyan}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// 9. Ring Portal Transition Overlay (expands from a point and washes with neon blue light)
export const RingPortalOverlay: React.FC<{
  progress: number; // 0 to 1
  centerX?: string;
  centerY?: string;
}> = ({ progress, centerX = '50%', centerY = '50%' }) => {
  if (progress <= 0.01 || progress >= 0.99) return null;
  const radius = interpolate(progress, [0, 0.5, 1], [0, 110, 220]);
  const ringOpacity = interpolate(progress, [0, 0.35, 0.7, 1], [0, 0.95, 0.65, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 90,
        background: `radial-gradient(circle at ${centerX} ${centerY}, transparent ${Math.max(0, radius - 22)}%, rgba(34, 171, 227, ${ringOpacity * 0.75}) ${radius}%, rgba(59, 108, 255, ${ringOpacity * 0.45}) ${radius + 14}%, transparent ${radius + 32}%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

// 10. Right-Angle Neon Connector Line with Animated Endpoint Node
export const NeonConnector: React.FC<{
  pathD: string;
  progress: number; // 0 to 1
  endX: number;
  endY: number;
  color?: string;
  width?: number;
  height?: number;
}> = ({ pathD, progress, endX, endY, color = COLORS.brandCyan, width = 600, height = 300 }) => {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped <= 0.01) return null;
  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        overflow: 'visible',
        pointerEvents: 'none',
        filter: `drop-shadow(0 0 12px ${color})`,
      }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - clamped * 100}
      />
      {clamped > 0.85 && (
        <g transform={`translate(${endX}, ${endY}) scale(${Math.min(1.1, (clamped - 0.85) * 7)})`}>
          <circle r={9} fill={color} opacity={0.35} />
          <circle r={5} fill="#FFFFFF" stroke={color} strokeWidth={2.5} />
        </g>
      )}
    </svg>
  );
};

// 11. Deterministic Frame-Driven Vector Icons (paired with Lottie for 100% crisp headless visibility)
export const AnimatedCheckIcon: React.FC<{
  size?: number;
  progress?: number;
  color?: string;
}> = ({ size = 36, progress = 1, color = COLORS.brandCyan }) => {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        filter: `drop-shadow(0 0 10px ${color})`,
        overflow: 'visible',
      }}
    >
      <circle
        cx="20"
        cy="20"
        r="17"
        fill="rgba(34, 171, 227, 0.22)"
        stroke={color}
        strokeWidth="2.8"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - p * 100}
      />
      <path
        d="M 12.5 20.5 L 17.8 25.8 L 28 14.8"
        fill="none"
        stroke={COLORS.brandYellow}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - p * 100}
      />
    </svg>
  );
};

export const AnimatedMapPinIcon: React.FC<{
  size?: number;
  frame?: number;
}> = ({ size = 64, frame = 0 }) => {
  const pulse = 1 + Math.sin(frame * 0.16) * 0.08;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{
        filter: `drop-shadow(0 0 14px ${COLORS.brandYellow})`,
        overflow: 'visible',
      }}
    >
      <ellipse
        cx="32"
        cy="54"
        rx={14 * pulse}
        ry={5 * pulse}
        fill="rgba(34, 171, 227, 0.35)"
        stroke={COLORS.brandCyan}
        strokeWidth="2"
      />
      <path
        d="M32 8 C21 8 13 16.5 13 27 C13 39.5 32 53 32 53 C32 53 51 39.5 51 27 C51 16.5 43 8 32 8 Z"
        fill="rgba(244, 235, 42, 0.24)"
        stroke={COLORS.brandYellow}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="26" r="7.5" fill={COLORS.brandYellow} />
      <circle cx="32" cy="26" r="3.5" fill="#060B20" />
    </svg>
  );
};

export const AnimatedUploadRingIcon: React.FC<{
  size?: number;
  progress?: number;
}> = ({ size = 68, progress = 1 }) => {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 68 68"
      style={{
        filter: `drop-shadow(0 0 12px ${COLORS.brandCyan})`,
        overflow: 'visible',
      }}
    >
      <circle
        cx="34"
        cy="34"
        r="27"
        fill="rgba(15, 25, 62, 0.8)"
        stroke="rgba(111, 168, 255, 0.3)"
        strokeWidth="4"
      />
      <circle
        cx="34"
        cy="34"
        r="27"
        fill="none"
        stroke={COLORS.brandCyan}
        strokeWidth="4.5"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - p * 100}
        transform="rotate(-90 34 34)"
      />
      <path
        d="M34 44 L34 23 M25 31 L34 22 L43 31"
        fill="none"
        stroke={COLORS.brandYellow}
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const AnimatedShieldIcon: React.FC<{
  size?: number;
  progress?: number;
}> = ({ size = 92, progress = 1 }) => {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 92 92"
      style={{
        filter: `drop-shadow(0 0 18px ${COLORS.brandCyan})`,
        overflow: 'visible',
      }}
    >
      <path
        d="M46 10 L76 22 V45 C76 64.5 63.2 77.8 46 84 C28.8 77.8 16 64.5 16 45 V22 L46 10 Z"
        fill="rgba(34, 171, 227, 0.2)"
        stroke={COLORS.brandCyan}
        strokeWidth="3.8"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - p * 100}
      />
      <path
        d="M34 46.5 L42.5 55 L59 37.5"
        fill="none"
        stroke={COLORS.brandYellow}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        strokeDasharray={100}
        strokeDashoffset={100 - p * 100}
      />
    </svg>
  );
};

// 12. 3D Intertwined Multi-Ring Gyroscope (glowing 3D orbital ring with Heron option)
export const OrbitalRingMark: React.FC<{
  frame: number;
  size?: number;
  showHeron?: boolean;
}> = ({ frame, size = 84, showHeron = true }) => {
  const pulse = 1 + Math.sin(frame * 0.14) * 0.06;
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${pulse})`,
        filter: `drop-shadow(0 0 ${Math.round(size * 0.35)}px ${COLORS.neonBlue}) drop-shadow(0 0 ${Math.round(size * 0.2)}px ${COLORS.brandCyan})`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <g transform={`translate(50,50) rotate(${frame * 2.8})`}>
          <ellipse
            cx="0"
            cy="0"
            rx="42"
            ry="24"
            fill="none"
            stroke={COLORS.neonIce}
            strokeWidth="3.2"
            opacity="0.92"
          />
        </g>
        <g transform={`translate(50,50) rotate(${-frame * 2.2 + 60})`}>
          <ellipse
            cx="0"
            cy="0"
            rx="42"
            ry="22"
            fill="none"
            stroke={COLORS.brandCyan}
            strokeWidth="2.8"
            opacity="0.85"
          />
        </g>
        <g transform={`translate(50,50) rotate(${frame * 1.6 + 120})`}>
          <ellipse
            cx="0"
            cy="0"
            rx="38"
            ry="30"
            fill="none"
            stroke={COLORS.neonBlue}
            strokeWidth="2.4"
            opacity="0.75"
          />
        </g>
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="rgba(59, 108, 255, 0.16)"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.5"
        />
      </svg>
      {showHeron && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile('logo-layers/layer_heron.png')}
            style={{
              width: size * 0.85,
              height: size * 0.85,
              objectFit: 'contain',
              transform: 'translateX(-12%)',
              filter: `drop-shadow(0 0 8px ${COLORS.brandYellow})`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// 13. Full-Screen Shockwave Ring on Send Click
export const FullScreenShockwave: React.FC<{
  progress: number; // 0 to 1
  centerX?: string;
  centerY?: string;
}> = ({ progress, centerX = '50%', centerY = '50%' }) => {
  if (progress <= 0.01 || progress >= 0.99) return null;
  const r = interpolate(progress, [0, 1], [2, 135]);
  const thickness = interpolate(progress, [0, 0.5, 1], [8, 18, 26]);
  const alpha = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 0.75, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 95,
        background: `radial-gradient(circle at ${centerX} ${centerY}, transparent ${Math.max(0, r - thickness)}%, rgba(34, 171, 227, ${alpha * 0.9}) ${r - thickness * 0.3}%, rgba(186, 230, 255, ${alpha}) ${r}%, rgba(59, 108, 255, ${alpha * 0.8}) ${r + thickness * 0.4}%, transparent ${r + thickness}%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

// 14. Live Glowing Audio/Data Waveform Bar along bottom of Glass Cards
export const NeonWaveformBar: React.FC<{
  frame: number;
  color?: string;
  width?: number;
  height?: number;
}> = ({ frame, color = COLORS.brandCyan, width = 680, height = 44 }) => {
  const points: string[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * width;
    const envelope = Math.sin(t * Math.PI);
    const wave =
      Math.sin(t * 18 + frame * 0.28) * 0.55 +
      Math.cos(t * 31 - frame * 0.21) * 0.45;
    const y = height / 2 + wave * (height * 0.38) * envelope;
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const d = points.join(' ');
  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{
        overflow: 'visible',
        filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 24px ${COLORS.neonBlue})`,
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d={d}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
};

// 15. Macro 3D Camera Rig with Peripheral Depth-of-Field Edge Blur Vignette
export const MacroCameraRig: React.FC<{
  children: React.ReactNode;
  scale?: number;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  perspective?: number;
  edgeVignetteStrength?: number;
}> = ({
  children,
  scale = 1,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  perspective = 1350,
  edgeVignetteStrength = 0.55,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        perspective,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Optical Lens Edge Vignette & Top/Corner Blue Bloom */}
      {edgeVignetteStrength > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 60,
            background: `radial-gradient(circle at 50% 50%, transparent 48%, rgba(2, 5, 18, ${0.55 * edgeVignetteStrength}) 82%, rgba(1, 3, 12, ${0.88 * edgeVignetteStrength}) 100%)`,
          }}
        />
      )}
    </div>
  );
};


