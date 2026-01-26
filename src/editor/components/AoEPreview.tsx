import React from 'react';
import type { Position, AoEType } from '../../data/types';

interface AoEPreviewProps {
  type: AoEType;
  position: Position;
  screenPos: { x: number; y: number };
}

export function AoEPreview({ type, position, screenPos }: AoEPreviewProps) {
  const defaultRadius = 50; // pixels
  const previewStyle = {
    fill: 'rgba(255, 102, 0, 0.5)',
    stroke: 'rgba(255, 102, 0, 0.9)',
    strokeWidth: 2,
    strokeDasharray: '5,5',
  };

  switch (type) {
    case 'circle':
      return (
        <circle
          cx={screenPos.x}
          cy={screenPos.y}
          r={defaultRadius}
          {...previewStyle}
        />
      );

    case 'cone':
      return (
        <path
          d={createConePreviewPath(screenPos, defaultRadius, 90, -90)}
          {...previewStyle}
        />
      );

    case 'line':
      return (
        <rect
          x={screenPos.x - 10}
          y={screenPos.y - defaultRadius}
          width={20}
          height={defaultRadius * 2}
          {...previewStyle}
        />
      );

    case 'donut':
      return (
        <g>
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r={defaultRadius}
            {...previewStyle}
          />
          <circle
            cx={screenPos.x}
            cy={screenPos.y}
            r={defaultRadius * 0.5}
            fill="rgba(30, 30, 60, 1)"
            stroke="rgba(255, 102, 0, 0.8)"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        </g>
      );

    case 'cross':
      return (
        <g>
          <rect
            x={screenPos.x - 10}
            y={screenPos.y - defaultRadius}
            width={20}
            height={defaultRadius * 2}
            {...previewStyle}
          />
          <rect
            x={screenPos.x - defaultRadius}
            y={screenPos.y - 10}
            width={defaultRadius * 2}
            height={20}
            {...previewStyle}
          />
        </g>
      );

    default:
      return null;
  }
}

function createConePreviewPath(
  center: { x: number; y: number },
  radius: number,
  angleDeg: number,
  directionDeg: number
): string {
  const startAngle = (directionDeg - angleDeg / 2) * (Math.PI / 180);
  const endAngle = (directionDeg + angleDeg / 2) * (Math.PI / 180);

  const x1 = center.x + radius * Math.cos(startAngle);
  const y1 = center.y + radius * Math.sin(startAngle);
  const x2 = center.x + radius * Math.cos(endAngle);
  const y2 = center.y + radius * Math.sin(endAngle);

  const largeArc = angleDeg > 180 ? 1 : 0;

  return `M ${center.x} ${center.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}
