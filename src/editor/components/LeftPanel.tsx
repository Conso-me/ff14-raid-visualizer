import React, { useState } from 'react';
import { ToolPanelContent } from './ToolPanelContent';
import { SettingsPanelContent } from './SettingsPanelContent';
import { ObjectListPanel } from './ObjectListPanel';
import { TimelinePanel } from './TimelinePanel';

type TabType = 'tools' | 'settings';

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('tools');

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: '8px 12px',
    background: active ? '#3753c7' : '#252540',
    border: 'none',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    borderBottom: active ? '2px solid #4a7aff' : '2px solid transparent',
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1a1a2e',
    }}>
      {/* Section 1: Tools / Settings (tabbed) */}
      <div style={{
        flex: '0 0 auto',
        maxHeight: '35%',
        overflow: 'auto',
        borderBottom: '1px solid #3a3a5a',
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #3a3a5a',
        }}>
          <button
            style={tabStyle(activeTab === 'tools')}
            onClick={() => setActiveTab('tools')}
          >
            ツール
          </button>
          <button
            style={tabStyle(activeTab === 'settings')}
            onClick={() => setActiveTab('settings')}
          >
            設定
          </button>
        </div>
        {activeTab === 'tools' ? <ToolPanelContent /> : <SettingsPanelContent />}
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
