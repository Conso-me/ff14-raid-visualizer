import React from 'react';
import { RoleText, Role } from '../../data/types';
import { ROLE_COLORS } from '../../data/constants';

interface RoleExplanationProps {
  roleTexts: RoleText[];
  position: 'top' | 'bottom';
  opacity?: number;
}

// ロールをラベル用にフォーマット
function formatRoles(roles: Role[]): string {
  if (roles.length === 0) return '';

  // タンク、ヒーラー、DPSでグループ化
  const tanks = roles.filter((r) => r === 'MT' || r === 'ST');
  const healers = roles.filter((r) => r === 'H1' || r === 'H2');
  const dps = roles.filter((r) => r.startsWith('D'));

  const parts: string[] = [];

  if (tanks.length > 0) {
    parts.push(tanks.join('/'));
  }
  if (healers.length > 0) {
    parts.push(healers.join('/'));
  }
  if (dps.length > 0) {
    if (dps.length === 4) {
      parts.push('D1-D4');
    } else {
      parts.push(dps.join('/'));
    }
  }

  return parts.join(', ');
}

// ロールの代表色を取得
function getRoleColor(roles: Role[]): string {
  if (roles.length === 0) return '#ffffff';

  // 最初のロールの色を使用
  const firstRole = roles[0];
  return ROLE_COLORS[firstRole];
}

export const RoleExplanation: React.FC<RoleExplanationProps> = ({
  roleTexts,
  position,
  opacity = 1,
}) => {
  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  if (position === 'top') {
    positionStyles.top = 100;
  } else {
    positionStyles.bottom = 120; // タイムラインバーの上
  }

  return (
    <div
      style={{
        ...positionStyles,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: '12px 24px',
        borderRadius: 8,
        opacity,
        pointerEvents: 'none',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {roleTexts.map((roleText, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* ロールラベル */}
          <span
            style={{
              backgroundColor: getRoleColor(roleText.roles),
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              padding: '4px 8px',
              borderRadius: 4,
              minWidth: 80,
              textAlign: 'center',
            }}
          >
            {formatRoles(roleText.roles)}
          </span>
          {/* テキスト */}
          <span
            style={{
              color: 'white',
              fontSize: 20,
              fontFamily: 'sans-serif',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {roleText.text}
          </span>
        </div>
      ))}
    </div>
  );
};
