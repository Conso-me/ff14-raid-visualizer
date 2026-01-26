import React from 'react';
import type { Position, TimelineEvent, MoveEvent } from '../../data/types';
import { gameToScreen } from '../../utils/coordinates';

interface MovementPathsProps {
  playerId: string;
  timeline: TimelineEvent[];
  initialPosition: Position;
  fieldSize: number;
  screenSize: number;
}

export function MovementPaths({
  playerId,
  timeline,
  initialPosition,
  fieldSize,
  screenSize,
}: MovementPathsProps) {
  // このプレイヤーの移動イベントを取得
  const moveEvents = timeline
    .filter((e): e is MoveEvent => e.type === 'move' && e.targetId === playerId)
    .sort((a, b) => a.frame - b.frame);

  if (moveEvents.length === 0) return null;

  // パスのポイントを計算
  const points: Position[] = [initialPosition];
  moveEvents.forEach(event => {
    points.push(event.to);
  });

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenSize,
        height: screenSize,
        pointerEvents: 'none',
      }}
    >
      {/* 移動パスの線 */}
      {points.slice(0, -1).map((point, index) => {
        const nextPoint = points[index + 1];
        const screenFrom = gameToScreen(point, fieldSize, screenSize);
        const screenTo = gameToScreen(nextPoint, fieldSize, screenSize);
        const event = moveEvents[index];

        // 線の中点
        const midX = (screenFrom.x + screenTo.x) / 2;
        const midY = (screenFrom.y + screenTo.y) / 2;

        return (
          <g key={index}>
            {/* 移動線（点線） */}
            <line
              x1={screenFrom.x}
              y1={screenFrom.y}
              x2={screenTo.x}
              y2={screenTo.y}
              stroke="rgba(0, 255, 255, 0.5)"
              strokeWidth={2}
              strokeDasharray="6,4"
            />
            {/* 移動先のマーカー */}
            <circle
              cx={screenTo.x}
              cy={screenTo.y}
              r={6}
              fill="rgba(0, 255, 255, 0.3)"
              stroke="rgba(0, 255, 255, 0.8)"
              strokeWidth={2}
            />
            {/* 移動番号 */}
            <text
              x={screenTo.x + 12}
              y={screenTo.y - 8}
              fill="#00ffff"
              fontSize={11}
              fontWeight="bold"
            >
              {index + 1}
            </text>
            {/* フレーム情報 */}
            <text
              x={midX}
              y={midY - 8}
              fill="rgba(255, 255, 255, 0.7)"
              fontSize={10}
              textAnchor="middle"
            >
              {event.frame}f-{event.frame + event.duration}f
            </text>
          </g>
        );
      })}

      {/* 開始位置マーカー */}
      {points.length > 0 && (
        <g>
          <circle
            cx={gameToScreen(points[0], fieldSize, screenSize).x}
            cy={gameToScreen(points[0], fieldSize, screenSize).y}
            r={4}
            fill="#00ffff"
          />
          <text
            x={gameToScreen(points[0], fieldSize, screenSize).x + 10}
            y={gameToScreen(points[0], fieldSize, screenSize).y - 10}
            fill="#00ffff"
            fontSize={10}
          >
            Start
          </text>
        </g>
      )}
    </svg>
  );
}
