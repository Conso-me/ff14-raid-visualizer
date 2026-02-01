import React, { useState, useRef, useCallback } from 'react';
import { useEditor } from '../context/EditorContext';
import { TimelineImportDialog } from './TimelineImportDialog';
import type { TimelineEvent } from '../../data/types';

// フレームを時間文字列に変換
function formatTime(frames: number, fps: number): string {
  const totalSeconds = frames / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
}

interface TimelineEntry {
  id: string;
  time: number;
  name: string;
  type: string;
}

export function TimelinePanel() {
  const { state, setCurrentFrame, addTimelineEvent } = useEditor();
  const { mechanic, currentFrame } = state;
  const [showImport, setShowImport] = useState(false);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fps = mechanic.fps;

  const currentSeconds = currentFrame / fps;
  const currentEntryIndex = timelineEntries.findIndex(
    (entry, index) => {
      const nextEntry = timelineEntries[index + 1];
      return currentSeconds >= entry.time && 
             (!nextEntry || currentSeconds < nextEntry.time);
    }
  );

  const displayTimeStr = formatTime(currentFrame, fps);

  // TimelineImportDialogからのインポートを処理
  const handleImport = useCallback((events: Partial<TimelineEvent>[]) => {
    // ローカル表示用エントリーを作成
    const displayEntries: TimelineEntry[] = events
      .filter((e): e is TimelineEvent & { frame: number } => 
        typeof e.frame === 'number' && e.frame >= 0
      )
      .map((e, i) => {
        const time = e.frame / fps;
        let name = '';
        
        switch (e.type) {
          case 'text':
            name = typeof e.content === 'string' ? e.content : 'Text';
            break;
          case 'cast':
            name = e.skillName || 'Cast';
            break;
          case 'aoe_show':
            name = 'AoE';
            break;
          default:
            name = e.type || 'Event';
        }
        
        return {
          id: `entry-${i}-${Date.now()}`,
          time,
          name,
          type: e.type || 'text',
        };
      })
      .sort((a, b) => a.time - b.time);
    
    setTimelineEntries(displayEntries);
    
    // 実際のタイムラインにイベントを追加
    if (addTimelineEvent) {
      events.forEach(event => {
        if (event.type && typeof event.frame === 'number') {
          addTimelineEvent(event as TimelineEvent);
        }
      });
    }
    
    setShowImport(false);
  }, [addTimelineEvent, fps]);

  const handleEntryClick = useCallback((time: number) => {
    if (setCurrentFrame) {
      setCurrentFrame(Math.round(time * fps));
    }
  }, [setCurrentFrame, fps]);

  return (
    <>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 現在時間表示 */}
        <div style={{
          padding: '8px 12px',
          background: '#1a1a2e',
          borderBottom: '1px solid #3a3a5a',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
            {displayTimeStr}
          </div>
        </div>

        {/* タイムラインリスト */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {timelineEntries.length === 0 ? (
            <div style={{ 
              fontSize: '13px', 
              color: '#666', 
              textAlign: 'center', 
              padding: '40px 20px' 
            }}>
              タイムラインが空です
              <br />
              <br />
              「タイムラインをインポート」ボタンから
              <br />
              インポートしてください
            </div>
          ) : (
            timelineEntries.map((entry, index) => {
              const isCurrent = index === currentEntryIndex;
              
              return (
                <div
                  key={entry.id}
                  ref={(el) => {
                    if (el) entryRefs.current.set(entry.id, el);
                  }}
                  style={{
                    padding: isCurrent ? '12px' : '8px',
                    marginBottom: '4px',
                    background: isCurrent ? '#3753c7' : 'transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isCurrent ? '2px solid #5a7aff' : '2px solid transparent',
                  }}
                  onClick={() => handleEntryClick(entry.time)}
                >
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      left: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderLeft: '10px solid #ff6b6b',
                    }} />
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '8px',
                    position: 'relative',
                  }}>
                    <span style={{
                      fontSize: isCurrent ? '14px' : '13px',
                      fontWeight: 'bold',
                      color: isCurrent ? '#fff' : '#888',
                      minWidth: '50px',
                    }}>
                      {formatTime(entry.time * fps, fps)}
                    </span>
                    <span style={{
                      fontSize: isCurrent ? '14px' : '13px',
                      color: isCurrent ? '#fff' : '#ccc',
                      flex: 1,
                      whiteSpace: 'pre-line',
                      lineHeight: 1.4,
                    }}>
                      {entry.name}
                    </span>
                  </div>
                  
                  {isCurrent && (
                    <div style={{
                      fontSize: '11px',
                      color: '#ff6b6b',
                      marginTop: '4px',
                      fontWeight: 'bold',
                    }}>
                      ▶ 今ここ！
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* インポートボタン */}
        <div style={{
          padding: '8px',
          borderTop: '1px solid #3a3a5a',
        }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            タイムラインをインポート
          </button>
        </div>
      </div>

      <TimelineImportDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        fps={fps}
      />
    </>
  );
}
