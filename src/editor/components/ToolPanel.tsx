import React, { useState } from 'react';
import { ToolPanelContent } from './ToolPanelContent';
import { SettingsPanelContent } from './SettingsPanelContent';
import { useLanguage } from '../context/LanguageContext';

type TabType = 'tools' | 'settings';

export function ToolPanel() {
  const { t } = useLanguage();
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
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #3a3a5a',
        flexShrink: 0,
      }}>
        <button
          style={tabStyle(activeTab === 'tools')}
          onClick={() => setActiveTab('tools')}
        >
          {t('tools.tabTools')}
        </button>
        <button
          style={tabStyle(activeTab === 'settings')}
          onClick={() => setActiveTab('settings')}
        >
          {t('tools.tabSettings')}
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'tools' ? <ToolPanelContent /> : <SettingsPanelContent />}
      </div>
    </div>
  );
}
