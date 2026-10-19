// Layout & Theme Source of Truth (8px base grid, 12-column layout, 96px safe margins)

export const GRID_BASE = 8;

export const SPACING = {
  xs: GRID_BASE, // 8px
  sm: GRID_BASE * 2, // 16px
  md: GRID_BASE * 3, // 24px
  lg: GRID_BASE * 4, // 32px
  xl: GRID_BASE * 6, // 48px
  xxl: GRID_BASE * 8, // 64px
  safe: GRID_BASE * 12, // 96px
} as const;

export const COLORS = {
  bgDeep: '#03061A',
  bgMid: '#070E2B',
  bgNavy: '#0B1230',
  brandNavy: '#2A3990',
  brandCyan: '#22ABE3',
  brandYellow: '#F4EB2A',
  neonBlue: '#3B6CFF',
  neonIce: '#6FA8FF',
  glassFill: 'rgba(255, 255, 255, 0.08)',
  glassFillStrong: 'rgba(14, 25, 68, 0.72)',
  glassBorder: 'rgba(111, 168, 255, 0.52)',
  textWhite: '#F8FAFC',
  textSilver: '#CBD5E1',
  textMuted: '#94A3B8',
  dangerRed: '#FF4D6D',
  successCyan: '#22ABE3',
} as const;

export interface ViewportLayout {
  width: number;
  height: number;
  isVertical: boolean;
  safeMargin: number;
  contentWidth: number;
  contentHeight: number;
  columns: number;
  columnGap: number;
  colWidth: number;
  centerX: number;
  centerY: number;
  captionBottom: number;
  captionMaxWidth: number;
  captionFontSize: number;
  headlineSize: number;
  subheadlineSize: number;
  bodySize: number;
  perspective: number;
}

export function getViewportLayout(width: number, height: number): ViewportLayout {
  const isVertical = height > width;
  const safeMargin = SPACING.safe; // 96px strict safe margin on both 16:9 and 9:16
  const contentWidth = width - safeMargin * 2;
  const contentHeight = height - safeMargin * 2;
  const columns = 12;
  const columnGap = SPACING.md; // 24px
  const colWidth = (contentWidth - columnGap * (columns - 1)) / columns;

  return {
    width,
    height,
    isVertical,
    safeMargin,
    contentWidth,
    contentHeight,
    columns,
    columnGap,
    colWidth,
    centerX: width / 2,
    centerY: isVertical ? height * 0.45 : height * 0.46,
    captionBottom: safeMargin, // Lower-third sits right above 96px safe margin
    captionMaxWidth: isVertical ? contentWidth : Math.min(1360, contentWidth),
    captionFontSize: isVertical ? 44 : 48, // 44 to 52px per spec
    headlineSize: isVertical ? 68 : 84,
    subheadlineSize: isVertical ? 36 : 44,
    bodySize: isVertical ? 30 : 32, // 28px+ at 1080p per spec
    perspective: 1500, // 1200 to 1800px 3D scene perspective
  };
}
