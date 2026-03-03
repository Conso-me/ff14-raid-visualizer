import React, { useId } from 'react';
import type { AoEIndicator, AoEType, Position } from '../../data/types';
import { FIELD_DEFAULTS } from '../../data/constants';
import { gameToScreen } from '../../utils/coordinates';

interface IndicatorOverlayProps {
  position: Position;
  baseType: AoEType;
  indicator: AoEIndicator;
  indicatorCount?: number;
  // circle 用
  radius?: number;
  // line / rectangle 用
  width?: number;
  length?: number;
  direction?: number;
  // rectangle 用
  rectWidth?: number;
  rectHeight?: number;
  rotation?: number;
  fieldSize?: number;
  screenSize?: number;
}

/**
 * 三角矢印を生成するヘルパー（line/rectangle用の既存ロジック）
 */
function createArrowPath(tipX: number, tipY: number, angle: number, arrowSize: number): string {
  const baseAngle = Math.PI * 0.35;
  const leftX = tipX - arrowSize * Math.cos(angle - baseAngle);
  const leftY = tipY - arrowSize * Math.sin(angle - baseAngle);
  const rightX = tipX - arrowSize * Math.cos(angle + baseAngle);
  const rightY = tipY - arrowSize * Math.sin(angle + baseAngle);
  return `M ${tipX} ${tipY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`;
}

// ============================================
// Circle用インジケーターSVG（HTMLモックアップ準拠）
// viewBox="0 0 120 120" → center=(60,60) を基準にスケーリング
// ============================================

/** 視線攻撃（eye） */
function renderEye(uid: string): React.ReactElement {
  return (
    <g>
      <defs>
        <radialGradient id={`eye-glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 100, 150, 0.6)"/>
          <stop offset="100%" stopColor="rgba(255, 50, 100, 0)"/>
        </radialGradient>
      </defs>
      {/* グロー */}
      <ellipse cx="60" cy="60" rx="55" ry="40" fill={`url(#eye-glow-${uid})`}/>
      {/* 放射線 */}
      <g stroke="rgba(255, 80, 120, 0.7)" strokeWidth="2">
        <line x1="60" y1="5" x2="60" y2="20"/>
        <line x1="60" y1="100" x2="60" y2="115"/>
        <line x1="5" y1="60" x2="15" y2="60"/>
        <line x1="105" y1="60" x2="115" y2="60"/>
        <line x1="20" y1="25" x2="28" y2="33"/>
        <line x1="92" y1="87" x2="100" y2="95"/>
        <line x1="100" y1="25" x2="92" y2="33"/>
        <line x1="20" y1="95" x2="28" y2="87"/>
        <line x1="35" y1="12" x2="40" y2="25"/>
        <line x1="85" y1="12" x2="80" y2="25"/>
        <line x1="35" y1="108" x2="40" y2="95"/>
        <line x1="85" y1="108" x2="80" y2="95"/>
      </g>
      {/* アーモンド形 */}
      <path
        d="M 5 60 Q 30 35, 60 35 Q 90 35, 115 60 Q 90 85, 60 85 Q 30 85, 5 60 Z"
        fill="rgba(80, 0, 30, 0.9)"
        stroke="rgba(200, 50, 80, 0.9)"
        strokeWidth="3"
      />
      <path
        d="M 20 60 Q 38 45, 60 45 Q 82 45, 100 60 Q 82 75, 60 75 Q 38 75, 20 60 Z"
        fill="none"
        stroke="rgba(255, 80, 120, 0.6)"
        strokeWidth="1.5"
      />
      {/* 虹彩・瞳孔 */}
      <circle cx="60" cy="60" r="18" fill="rgba(150, 30, 60, 0.9)"/>
      <circle cx="60" cy="60" r="8" fill="#1a0510"/>
      <circle cx="60" cy="60" r="5" fill="rgba(255, 220, 200, 0.9)"/>
      <circle cx="54" cy="54" r="3" fill="rgba(255, 255, 255, 0.7)"/>
    </g>
  );
}

/** 頭割り（stack） - 4方向シェブロン */
function renderStack(uid: string): React.ReactElement {
  return (
    <g>
      <defs>
        <linearGradient id={`chevron-grad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff6600"/>
          <stop offset="50%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ffdd44"/>
        </linearGradient>
      </defs>
      {/* 上から下 */}
      <g fill={`url(#chevron-grad-${uid})`} stroke="#ff8800" strokeWidth="1">
        <path d="M 45 8 L 60 22 L 75 8 L 75 14 L 60 28 L 45 14 Z"/>
        <path d="M 48 22 L 60 34 L 72 22 L 72 28 L 60 40 L 48 28 Z"/>
      </g>
      {/* 下から上 */}
      <g fill={`url(#chevron-grad-${uid})`} stroke="#ff8800" strokeWidth="1">
        <path d="M 45 112 L 60 98 L 75 112 L 75 106 L 60 92 L 45 106 Z"/>
        <path d="M 48 98 L 60 86 L 72 98 L 72 92 L 60 80 L 48 92 Z"/>
      </g>
      {/* 左から右 */}
      <g fill={`url(#chevron-grad-${uid})`} stroke="#ff8800" strokeWidth="1">
        <path d="M 8 45 L 22 60 L 8 75 L 14 75 L 28 60 L 14 45 Z"/>
        <path d="M 22 48 L 34 60 L 22 72 L 28 72 L 40 60 L 28 48 Z"/>
      </g>
      {/* 右から左 */}
      <g fill={`url(#chevron-grad-${uid})`} stroke="#ff8800" strokeWidth="1">
        <path d="M 112 45 L 98 60 L 112 75 L 106 75 L 92 60 L 106 45 Z"/>
        <path d="M 98 48 L 86 60 L 98 72 L 92 72 L 80 60 L 92 48 Z"/>
      </g>
      {/* 中央シェブロン */}
      <g fill={`url(#chevron-grad-${uid})`} stroke="#ff8800" strokeWidth="1">
        <path d="M 52 52 L 60 60 L 68 52 L 68 56 L 60 64 L 52 56 Z"/>
      </g>
    </g>
  );
}

/** 人数指定（stack_count） */
function renderStackCount(count: number): React.ReactElement {
  const c = Math.max(1, Math.min(4, count));
  // 各人数に応じたドット配置
  const dotPositions: Record<number, Array<{cx: number; cy: number}>> = {
    1: [{cx: 60, cy: 60}],
    2: [{cx: 45, cy: 60}, {cx: 75, cy: 60}],
    3: [{cx: 60, cy: 45}, {cx: 45, cy: 70}, {cx: 75, cy: 70}],
    4: [{cx: 45, cy: 45}, {cx: 75, cy: 45}, {cx: 45, cy: 75}, {cx: 75, cy: 75}],
  };
  return (
    <g>
      <circle cx="60" cy="60" r="45" fill="rgba(255, 100, 200, 0.3)" stroke="rgba(255, 100, 200, 0.9)" strokeWidth="3"/>
      {dotPositions[c].map((pos, i) => (
        <circle key={i} cx={pos.cx} cy={pos.cy} r="8" fill="rgba(255, 100, 200, 0.9)"/>
      ))}
    </g>
  );
}

/** 距離減衰（proximity） */
function renderProximity(): React.ReactElement {
  return (
    <g>
      <polygon points="60,90 20,30 100,30" fill="rgba(50, 150, 255, 0.5)" stroke="rgba(50, 150, 255, 0.9)" strokeWidth="3"/>
      <polygon points="60,70 40,40 80,40" fill="rgba(50, 150, 255, 0.8)"/>
    </g>
  );
}

/** 強攻撃（tankbuster） */
function renderTankbuster(uid: string): React.ReactElement {
  return (
    <g>
      <defs>
        <mask id={`tb-mask-${uid}`}>
          <circle cx="60" cy="60" r="45" fill="white"/>
          <circle cx="60" cy="60" r="30" fill="black"/>
        </mask>
      </defs>
      <circle cx="60" cy="60" r="45" fill="rgba(255, 0, 0, 0.5)" mask={`url(#tb-mask-${uid})`}/>
      <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255, 0, 0, 0.9)" strokeWidth="4"/>
      <circle cx="60" cy="60" r="30" fill="none" stroke="rgba(255, 0, 0, 0.9)" strokeWidth="4"/>
      <line x1="45" y1="45" x2="75" y2="75" stroke="rgba(255, 0, 0, 0.9)" strokeWidth="4"/>
      <line x1="75" y1="45" x2="45" y2="75" stroke="rgba(255, 0, 0, 0.9)" strokeWidth="4"/>
    </g>
  );
}

/** ターゲット（target） */
function renderTarget(): React.ReactElement {
  return (
    <g>
      <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255, 150, 0, 0.9)" strokeWidth="3"/>
      <circle cx="60" cy="60" r="25" fill="none" stroke="rgba(255, 150, 0, 0.9)" strokeWidth="2"/>
      <circle cx="60" cy="60" r="4" fill="rgba(255, 150, 0, 0.9)"/>
      <line x1="60" y1="10" x2="60" y2="30" stroke="rgba(255, 150, 0, 0.9)" strokeWidth="2"/>
      <line x1="60" y1="90" x2="60" y2="110" stroke="rgba(255, 150, 0, 0.9)" strokeWidth="2"/>
      <line x1="10" y1="60" x2="30" y2="60" stroke="rgba(255, 150, 0, 0.9)" strokeWidth="2"/>
      <line x1="90" y1="60" x2="110" y2="60" stroke="rgba(255, 150, 0, 0.9)" strokeWidth="2"/>
    </g>
  );
}

/** 追尾型（chase） */
function renderChase(uid: string): React.ReactElement {
  return (
    <g>
      <defs>
        <linearGradient id={`chase-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff4444"/>
          <stop offset="50%" stopColor="#ff6666"/>
          <stop offset="100%" stopColor="#ff8888"/>
        </linearGradient>
      </defs>
      <g fill={`url(#chase-grad-${uid})`} stroke="#ff3333" strokeWidth="2">
        <path d="M 25 35 L 50 60 L 25 85 L 35 85 L 60 60 L 35 35 Z"/>
        <path d="M 55 35 L 80 60 L 55 85 L 65 85 L 90 60 L 65 35 Z"/>
      </g>
    </g>
  );
}

/** 放射状ノックバック（knockback_radial） */
function renderKnockbackRadial(uid: string): React.ReactElement {
  return (
    <g>
      <defs>
        <linearGradient id={`kb-grad-up-${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff6600"/>
          <stop offset="50%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ffdd44"/>
        </linearGradient>
        <linearGradient id={`kb-grad-down-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff6600"/>
          <stop offset="50%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ffdd44"/>
        </linearGradient>
        <linearGradient id={`kb-grad-left-${uid}`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff6600"/>
          <stop offset="50%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ffdd44"/>
        </linearGradient>
        <linearGradient id={`kb-grad-right-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff6600"/>
          <stop offset="50%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ffdd44"/>
        </linearGradient>
      </defs>
      {/* 上方向 */}
      <g fill={`url(#kb-grad-up-${uid})`} stroke="#ff8800" strokeWidth="0.5">
        <path d="M 52 38 L 60 30 L 68 38 L 68 34 L 60 26 L 52 34 Z"/>
        <path d="M 52 26 L 60 18 L 68 26 L 68 22 L 60 14 L 52 22 Z"/>
      </g>
      {/* 下方向 */}
      <g fill={`url(#kb-grad-down-${uid})`} stroke="#ff8800" strokeWidth="0.5">
        <path d="M 52 82 L 60 90 L 68 82 L 68 86 L 60 94 L 52 86 Z"/>
        <path d="M 52 94 L 60 102 L 68 94 L 68 98 L 60 106 L 52 98 Z"/>
      </g>
      {/* 左方向 */}
      <g fill={`url(#kb-grad-left-${uid})`} stroke="#ff8800" strokeWidth="0.5">
        <path d="M 38 52 L 30 60 L 38 68 L 34 68 L 26 60 L 34 52 Z"/>
        <path d="M 26 52 L 18 60 L 26 68 L 22 68 L 14 60 L 22 52 Z"/>
      </g>
      {/* 右方向 */}
      <g fill={`url(#kb-grad-right-${uid})`} stroke="#ff8800" strokeWidth="0.5">
        <path d="M 82 52 L 90 60 L 82 68 L 86 68 L 94 60 L 86 52 Z"/>
        <path d="M 94 52 L 102 60 L 94 68 L 98 68 L 106 60 L 98 52 Z"/>
      </g>
      {/* 右上 */}
      <g fill={`url(#kb-grad-right-${uid})`} stroke="#ff8800" strokeWidth="0.5" transform="rotate(-45 60 60)">
        <path d="M 82 52 L 90 60 L 82 68 L 86 68 L 94 60 L 86 52 Z"/>
        <path d="M 94 52 L 102 60 L 94 68 L 98 68 L 106 60 L 98 52 Z"/>
      </g>
      {/* 右下 */}
      <g fill={`url(#kb-grad-right-${uid})`} stroke="#ff8800" strokeWidth="0.5" transform="rotate(45 60 60)">
        <path d="M 82 52 L 90 60 L 82 68 L 86 68 L 94 60 L 86 52 Z"/>
        <path d="M 94 52 L 102 60 L 94 68 L 98 68 L 106 60 L 98 52 Z"/>
      </g>
      {/* 左上 */}
      <g fill={`url(#kb-grad-left-${uid})`} stroke="#ff8800" strokeWidth="0.5" transform="rotate(45 60 60)">
        <path d="M 38 52 L 30 60 L 38 68 L 34 68 L 26 60 L 34 52 Z"/>
        <path d="M 26 52 L 18 60 L 26 68 L 22 68 L 14 60 L 22 52 Z"/>
      </g>
      {/* 左下 */}
      <g fill={`url(#kb-grad-left-${uid})`} stroke="#ff8800" strokeWidth="0.5" transform="rotate(-45 60 60)">
        <path d="M 38 52 L 30 60 L 38 68 L 34 68 L 26 60 L 34 52 Z"/>
        <path d="M 26 52 L 18 60 L 26 68 L 22 68 L 14 60 L 22 52 Z"/>
      </g>
      {/* 中央の円 */}
      <circle cx="60" cy="60" r="8" fill="rgba(255, 150, 50, 0.8)" stroke="#ff8800" strokeWidth="1"/>
    </g>
  );
}

/** 方向ノックバック（knockback_line） */
function renderKnockbackLine(uid: string): React.ReactElement {
  return (
    <g>
      <defs>
        <linearGradient id={`kb-line-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff6600"/>
          <stop offset="50%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ffdd44"/>
        </linearGradient>
      </defs>
      <g fill={`url(#kb-line-grad-${uid})`} stroke="#ff8800" strokeWidth="0.5">
        {/* 1行目 */}
        <path d="M 15 25 L 28 35 L 15 45 L 20 45 L 33 35 L 20 25 Z"/>
        <path d="M 45 25 L 58 35 L 45 45 L 50 45 L 63 35 L 50 25 Z"/>
        <path d="M 75 25 L 88 35 L 75 45 L 80 45 L 93 35 L 80 25 Z"/>
        {/* 2行目 */}
        <path d="M 15 50 L 28 60 L 15 70 L 20 70 L 33 60 L 20 50 Z"/>
        <path d="M 45 50 L 58 60 L 45 70 L 50 70 L 63 60 L 50 50 Z"/>
        <path d="M 75 50 L 88 60 L 75 70 L 80 70 L 93 60 L 80 50 Z"/>
        {/* 3行目 */}
        <path d="M 15 75 L 28 85 L 15 95 L 20 95 L 33 85 L 20 75 Z"/>
        <path d="M 45 75 L 58 85 L 45 95 L 50 95 L 63 85 L 50 75 Z"/>
        <path d="M 75 75 L 88 85 L 75 95 L 80 95 L 93 85 L 80 75 Z"/>
      </g>
    </g>
  );
}

// ============================================
// 新インジケーターをcircleに適用するかの判定
// ============================================
const CIRCLE_ONLY_INDICATORS: AoEIndicator[] = [
  'eye', 'stack_count', 'proximity', 'tankbuster', 'target', 'chase',
  'knockback_radial', 'knockback_line',
];

function isCircleOnlyIndicator(indicator: AoEIndicator): boolean {
  return CIRCLE_ONLY_INDICATORS.includes(indicator);
}

export const IndicatorOverlay: React.FC<IndicatorOverlayProps> = ({
  position,
  baseType,
  indicator,
  indicatorCount,
  radius,
  width,
  length,
  direction,
  rectWidth,
  rectHeight,
  rotation,
  fieldSize = FIELD_DEFAULTS.gameSize,
  screenSize = FIELD_DEFAULTS.screenSize,
}) => {
  const uid = useId().replace(/:/g, '');
  const screenPos = gameToScreen(position, fieldSize, screenSize);
  const scale = screenSize / fieldSize;

  // Circle用の新インジケーター（SVGオーバーレイ方式）
  if (baseType === 'circle' && radius) {
    const effectiveIndicator = indicator === 'knockback' ? 'knockback_radial' : indicator;

    // 新SVGインジケーター or stack/knockback_radialのcircle版
    if (isCircleOnlyIndicator(effectiveIndicator) || effectiveIndicator === 'stack') {
      const screenRadius = radius * scale;
      // SVGは120x120のviewBoxで描かれている → screenRadius*2の正方形にフィット
      const svgSize = screenRadius * 2;

      let content: React.ReactElement | null = null;
      switch (effectiveIndicator) {
        case 'eye':
          content = renderEye(uid);
          break;
        case 'stack':
          content = renderStack(uid);
          break;
        case 'stack_count':
          content = renderStackCount(indicatorCount ?? 1);
          break;
        case 'proximity':
          content = renderProximity();
          break;
        case 'tankbuster':
          content = renderTankbuster(uid);
          break;
        case 'target':
          content = renderTarget();
          break;
        case 'chase':
          content = renderChase(uid);
          break;
        case 'knockback_radial':
          content = renderKnockbackRadial(uid);
          break;
        case 'knockback_line':
          content = renderKnockbackLine(uid);
          break;
      }

      if (!content) return null;

      return (
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 120 120"
          style={{
            position: 'absolute',
            left: screenPos.x - screenRadius,
            top: screenPos.y - screenRadius,
            width: svgSize,
            height: svgSize,
            pointerEvents: 'none',
          }}
        >
          {content}
        </svg>
      );
    }
  }

  // 既存ロジック: line / rectangle / circle用の矢印（stack/knockback）
  const arrows: string[] = [];

  if (baseType === 'circle' && radius) {
    // ここに来るのは knockback_radial に変換されなかった場合（＝実質なし）
    // 後方互換のために残す
    const screenRadius = radius * scale;
    const arrowSize = screenRadius * 0.35;
    const directions = [
      -Math.PI / 2, 0, Math.PI / 2, Math.PI,
    ];

    for (const dir of directions) {
      if (indicator === 'stack') {
        const tipDist = screenRadius * 0.3;
        const tipX = screenPos.x + tipDist * Math.cos(dir);
        const tipY = screenPos.y + tipDist * Math.sin(dir);
        arrows.push(createArrowPath(tipX, tipY, dir + Math.PI, arrowSize));
      } else {
        const tipDist = screenRadius * 0.7;
        const tipX = screenPos.x + tipDist * Math.cos(dir);
        const tipY = screenPos.y + tipDist * Math.sin(dir);
        arrows.push(createArrowPath(tipX, tipY, dir, arrowSize));
      }
    }
  } else if (baseType === 'rectangle' && rectWidth && rectHeight) {
    const screenRectW = rectWidth * scale;
    const screenRectH = rectHeight * scale;
    const arrowSize = Math.min(screenRectW, screenRectH) * 0.4;
    const rotRad = ((rotation ?? 0) * Math.PI) / 180;

    if (indicator === 'stack') {
      const perpRad1 = rotRad + Math.PI / 2;
      const perpRad2 = rotRad - Math.PI / 2;
      const tipOffset = screenRectW * 0.1;
      const tip1X = screenPos.x + tipOffset * Math.cos(perpRad1);
      const tip1Y = screenPos.y + tipOffset * Math.sin(perpRad1);
      arrows.push(createArrowPath(tip1X, tip1Y, perpRad2, arrowSize));
      const tip2X = screenPos.x + tipOffset * Math.cos(perpRad2);
      const tip2Y = screenPos.y + tipOffset * Math.sin(perpRad2);
      arrows.push(createArrowPath(tip2X, tip2Y, perpRad1, arrowSize));
    } else {
      const tipDist = screenRectH * 0.35;
      const dirRad = rotRad - Math.PI / 2;
      const tipX = screenPos.x + tipDist * Math.cos(dirRad);
      const tipY = screenPos.y + tipDist * Math.sin(dirRad);
      arrows.push(createArrowPath(tipX, tipY, dirRad, arrowSize));
    }
  } else if (baseType === 'line' && width && length && direction !== undefined) {
    const screenWidth = width * scale;
    const screenLength = length * scale;
    const arrowSize = screenWidth * 0.6;
    const dirRad = ((direction - 90) * Math.PI) / 180;

    if (indicator === 'stack') {
      const perpRad1 = dirRad + Math.PI / 2;
      const perpRad2 = dirRad - Math.PI / 2;
      const centerX = screenPos.x + (screenLength / 2) * Math.cos(dirRad);
      const centerY = screenPos.y + (screenLength / 2) * Math.sin(dirRad);
      const tipOffset = screenWidth * 0.1;
      const tip1X = centerX + tipOffset * Math.cos(perpRad1);
      const tip1Y = centerY + tipOffset * Math.sin(perpRad1);
      arrows.push(createArrowPath(tip1X, tip1Y, perpRad2, arrowSize));
      const tip2X = centerX + tipOffset * Math.cos(perpRad2);
      const tip2Y = centerY + tipOffset * Math.sin(perpRad2);
      arrows.push(createArrowPath(tip2X, tip2Y, perpRad1, arrowSize));
    } else {
      const tipDist = screenLength * 0.7;
      const tipX = screenPos.x + tipDist * Math.cos(dirRad);
      const tipY = screenPos.y + tipDist * Math.sin(dirRad);
      arrows.push(createArrowPath(tipX, tipY, dirRad, arrowSize));
    }
  }

  if (arrows.length === 0) return null;

  return (
    <svg
      width={screenSize}
      height={screenSize}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenSize,
        height: screenSize,
        pointerEvents: 'none',
      }}
    >
      {arrows.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="#ffffff"
          fillOpacity={0.8}
          stroke="#ffffff"
          strokeOpacity={0.9}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
};
