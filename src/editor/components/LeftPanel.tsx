import React from 'react';
import { ToolPanelContent } from './ToolPanelContent';
import { ObjectListPanel } from './ObjectListPanel';
import { TimelinePanel } from './TimelinePanel';

export function LeftPanel() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1a1a2e',
    }}>
      {/* Section 1: Tools */}
      <div style={{
        flex: '0 0 auto',
        maxHeight: '35%',
        overflow: 'auto',
        borderBottom: '1px solid #3a3a5a',
      }}>
        <div style={{
          padding: '8px 12px',
          background: '#252540',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#fff',
          borderBottom: '1px solid #3a3a5a',
        }}>
          ツール
        </div>
        <ToolPanelContent />
      </div>

      {/* Section 2: Objects */}
      <div style={{
        flex: '0 0 auto',
        maxHeight: '35%',
        overflow: 'auto',
        borderBottom: '1px solid #3a3a5a',
      }}>
        <div style={{
          padding: '8px 12px',
          background: '#252540',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#fff',
          borderBottom: '1px solid #3a3a5a',
        }}>
          オブジェクト
        </div>
        <ObjectListPanel />
      </div>

      {/* Section 3: Timeline */}
      <div style={{
        flex: '1 1 auto',
        overflow: 'auto',
        minHeight: '30%',
      }}>
        <div style={{
          padding: '8px 12px',
          background: '#252540',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#fff',
          borderBottom: '1px solid #3a3a5a',
        }}>
          タイムライン
        </div>
        <TimelinePanel />
      </div>
    </div>
  );
}
