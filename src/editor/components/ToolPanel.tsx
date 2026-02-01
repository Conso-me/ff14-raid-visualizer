import React from 'react';
import { ToolPanelContent } from './ToolPanelContent';

export function ToolPanel() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1a1a2e',
      overflow: 'auto',
    }}>
      <div style={{
        padding: '8px 12px',
        background: '#252540',
        fontSize: '13px',
        fontWeight: 'bold',
        color: '#fff',
        borderBottom: '1px solid #3a3a5a',
        flexShrink: 0,
      }}>
        ツール
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ToolPanelContent />
      </div>
    </div>
  );
}
