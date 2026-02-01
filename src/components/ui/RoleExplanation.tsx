import React from 'react';
import { RoleText, Role } from '../../data/types';
import { ROLE_COLORS } from '../../data/constants';
import { FONT_FAMILY } from '../../utils/font';

interface RoleExplanationProps {
  roleTexts: RoleText[];
  position: 'top' | 'bottom';
  opacity?: number;
}

// ロールをラベル用にフォーマット
function formatRoles(roles: Role[]): string {
  if (roles.length === 0) return '';

  // タンク、ヒーラー、DPSでグループ化
  const tanks = roles.filter((r) => r === 'T1' || r === 'T2');
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
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 220,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: '14px 24px',
        borderRadius: 8,
        borderLeft: '4px solid #5a7aff',
        opacity,
        pointerEvents: 'none',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
      }}
    >
      {roleTexts.map((roleText, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {/* ロールラベル */}
          <span
            style={{
              backgroundColor: getRoleColor(roleText.roles),
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: FONT_FAMILY,
              padding: '5px 10px',
              borderRadius: 4,
              minWidth: 90,
              textAlign: 'center',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {formatRoles(roleText.roles)}
          </span>
          {/* テキスト */}
          <span
            style={{
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 'bold',
              fontFamily: FONT_FAMILY,
              textShadow: '0 2px 6px rgba(0,0,0,0.6)',
              letterSpacing: '0.3px',
            }}
          >
            {roleText.text}
          </span>
        </div>
      ))}
    </div>
  );
};
