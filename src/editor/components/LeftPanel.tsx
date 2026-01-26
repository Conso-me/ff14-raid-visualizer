import React, { useState } from 'react';
import { ToolPanelContent } from './ToolPanelContent';
import { ObjectListPanel } from './ObjectListPanel';

type TabType = 'tools' | 'objects';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 12px',
        background: active ? '#2a2a4a' : 'transparent',
        border: 'none',
        borderBottom: active ? '2px solid #4a4a7a' : '2px solid transparent',
        color: active ? '#fff' : '#888',
        fontSize: '12px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('tools');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#1a1a2e',
    }}>
      {/* タブヘッダー */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #3a3a5a',
      }}>
        <TabButton
          active={activeTab === 'tools'}
          onClick={() => setActiveTab('tools')}
        >
          ツール
        </TabButton>
        <TabButton
          active={activeTab === 'objects'}
          onClick={() => setActiveTab('objects')}
        >
          オブジェクト
        </TabButton>
      </div>

      {/* タブコンテンツ */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'tools' ? <ToolPanelContent /> : <ObjectListPanel />}
      </div>
    </div>
  );
}
