import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useEditor } from '../context/EditorContext';
import { useLanguage } from '../context/LanguageContext';
import { TimelineImportDialog } from './TimelineImportDialog';
import { CastEventDialog } from './CastEventDialog';
import { FieldChangeDialog, type FieldChangeSettings } from './FieldChangeDialog';
import type { TimelineEvent, Role, ObjectShowEvent, CastEvent } from '../../data/types';

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
  sourceEventIds: string[];
}

// タイムラインパネルに表示するイベントタイプ
const DISPLAY_EVENT_TYPES = new Set(['text', 'cast', 'field_change']);

// イベントから表示名を取得
function getEventDisplayName(event: TimelineEvent): string | null {
  switch (event.type) {
    case 'text':
      return typeof event.content === 'string' ? event.content : 'Text';
    case 'cast':
      return event.skillName || 'Cast';
    case 'field_change':
      return '🎨 ' + (event.override.backgroundColor ? event.override.backgroundColor : 'Background Change');
    default:
      return null;
  }
}

export function TimelinePanel() {
  const { t } = useLanguage();
  const { state, setCurrentFrame, addTimelineEvent, deleteTimelineEvent, updateMechanicMeta, addPlayer, addEnemy, selectObject, completeFieldChange } = useEditor();
  const { mechanic, currentFrame } = state;
  const [showImport, setShowImport] = useState(false);
  const [showCastDialog, setShowCastDialog] = useState(false);
  const [showFieldChangeDialog, setShowFieldChangeDialog] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fps = mechanic.fps;

  // mechanic.timelineから表示用エントリを派生
  const timelineEntries = useMemo(() => {
    const displayEvents = mechanic.timeline
      .filter((e) => DISPLAY_EVENT_TYPES.has(e.type))
      .sort((a, b) => a.frame - b.frame);

    // 同じ秒数のイベントをグループ化
    const groupMap = new Map<number, { names: string[]; frame: number; type: string; sourceEventIds: string[] }>();
    for (const event of displayEvents) {
      const name = getEventDisplayName(event);
      if (!name) continue;

      const seconds = Math.floor(event.frame / fps);
      if (!groupMap.has(seconds)) {
        groupMap.set(seconds, { names: [], frame: event.frame, type: event.type, sourceEventIds: [] });
      }
      const group = groupMap.get(seconds)!;
      group.names.push(name);
      group.sourceEventIds.push(event.id);
      // グループ内の最小フレームを保持
      if (event.frame < group.frame) {
        group.frame = event.frame;
      }
    }

    return Array.from(groupMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([seconds, group]) => ({
        id: `entry-${seconds}`,
        time: group.frame / fps,
        name: group.names.join('\n'),
        type: group.type,
        sourceEventIds: group.sourceEventIds,
      }));
  }, [mechanic.timeline, fps]);

  // 表示時間
  const currentSeconds = currentFrame / fps;
  const displayTime = Math.max(0, currentSeconds);
  const displayTimeStr = formatTime(displayTime * fps, fps);

  // 現在のエントリーを特定
  const currentEntryIndex = timelineEntries.findIndex(
    (entry, index) => {
      const nextEntry = timelineEntries[index + 1];
      return displayTime >= entry.time && (nextEntry ? displayTime < nextEntry.time : true);
    }
  );

  // TimelineImportDialogからのインポートを処理
  const handleImport = useCallback((events: Partial<TimelineEvent>[]) => {
    // プレイヤーが未配置なら8人プリセット配置
    if (mechanic.initialPlayers.length === 0) {
      const positions: { role: Role; x: number; y: number }[] = [
        { role: 'T1', x: 0, y: -8 },
        { role: 'T2', x: 0, y: 8 },
        { role: 'H1', x: -8, y: 0 },
        { role: 'H2', x: 8, y: 0 },
        { role: 'D1', x: -6, y: 6 },
        { role: 'D2', x: 6, y: 6 },
        { role: 'D3', x: -6, y: -6 },
        { role: 'D4', x: 6, y: -6 },
      ];
      positions.forEach(({ role, x, y }) => {
        addPlayer({ id: `player_${role}`, role, position: { x, y } });
      });
    }

    // ボスが未配置なら中央に自動追加
    if (mechanic.enemies.length === 0) {
      addEnemy({ id: 'boss', name: t('tools.defaultEnemyName'), position: { x: 0, y: 0 } });
    }

    // object_showイベントからオブジェクトを事前生成してタイムラインに追加
    // （object_showイベント自体にオブジェクト定義が含まれるため、先に追加する）
    const objectShowEvents = events.filter(
      (e): e is Partial<ObjectShowEvent> => e.type === 'object_show' && !!(e as Partial<ObjectShowEvent>).object
    );
    const nonObjectEvents = events.filter(
      (e) => e.type !== 'object_show' && e.type !== 'object_hide'
    );
    const objectHideEvents = events.filter((e) => e.type === 'object_hide');

    // オブジェクト系イベント → その他のイベントの順にソートして処理
    const sortedEvents = [...objectShowEvents, ...objectHideEvents, ...nonObjectEvents];

    // 最小フレームを計算（0秒スタートに調整するため）
    let minFrame = Infinity;
    for (const event of events) {
      if (typeof event.frame === 'number' && event.frame >= 0 && event.frame < minFrame) {
        minFrame = event.frame;
      }
    }
    if (!isFinite(minFrame)) minFrame = 0;

    // ビデオ長さを自動調整（最後のイベント時間 + 2秒余白）
    let maxFrame = 0;
    for (const event of events) {
      if (typeof event.frame === 'number' && event.frame > maxFrame) {
        maxFrame = event.frame;
      }
    }
    if (maxFrame > minFrame && updateMechanicMeta) {
      const newDurationSeconds = (maxFrame - minFrame) / fps + 2;
      const newDurationFrames = Math.ceil(newDurationSeconds * fps);
      updateMechanicMeta({ durationFrames: newDurationFrames });
    }

    // 実際のタイムラインにイベントを追加（オブジェクト系を先に、時間を0秒スタートに調整）
    if (addTimelineEvent) {
      sortedEvents.forEach(event => {
        if (event.type && typeof event.frame === 'number') {
          // frameからオフセットを引いて0秒スタートに調整
          const adjustedFrame = Math.round(event.frame - minFrame);
          const adjustedEvent = {
            ...event,
            frame: Math.max(0, adjustedFrame)
          };
          addTimelineEvent(adjustedEvent as TimelineEvent);
        }
      });
    }

    setShowImport(false);
  }, [addTimelineEvent, fps, mechanic.initialPlayers.length, mechanic.enemies.length, addPlayer, addEnemy, updateMechanicMeta]);

  const handleEntryClick = useCallback((entry: TimelineEntry) => {
    if (setCurrentFrame) {
      setCurrentFrame(Math.round(entry.time * fps));
    }
    // castイベント/field_changeイベントの場合、PropertyPanelに連携
    if (entry.sourceEventIds.length > 0) {
      const firstEventId = entry.sourceEventIds[0];
      const event = mechanic.timeline.find(e => e.id === firstEventId);
      if (event && event.type === 'cast') {
        selectObject(event.id, 'cast');
      } else if (event && event.type === 'field_change') {
        selectObject(event.fieldChangeId, 'field_change');
      }
    }
  }, [setCurrentFrame, fps, mechanic.timeline, selectObject]);

  // タイムライン全クリア
  const handleClearTimeline = useCallback(() => {
    if (!confirm(t('timeline.confirmClear'))) return;

    mechanic.timeline.forEach((event) => {
      deleteTimelineEvent(event.id);
    });
  }, [mechanic.timeline, deleteTimelineEvent]);

  // タイムラインエントリ個別削除
  const handleDeleteEntry = useCallback((entry: TimelineEntry) => {
    // 該当秒数のイベントをmechanic.timelineから特定して削除
    const entrySeconds = Math.floor(entry.time);
    mechanic.timeline.forEach((event) => {
      if (!DISPLAY_EVENT_TYPES.has(event.type)) return;
      const eventSeconds = Math.floor(event.frame / fps);
      if (eventSeconds === entrySeconds) {
        deleteTimelineEvent(event.id);
      }
    });
  }, [mechanic.timeline, deleteTimelineEvent, fps]);

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
              {t('timeline.empty')}
              <br />
              <br />
              {t('timeline.emptyHint')}
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
                  onClick={() => handleEntryClick(entry)}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isCurrent ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '0 4px',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                      title={t('timeline.deleteEntry')}
                    >
                      ×
                    </button>
                  </div>

                  {isCurrent && (
                    <div style={{
                      fontSize: '11px',
                      color: '#ff6b6b',
                      marginTop: '4px',
                      fontWeight: 'bold',
                    }}>
                      {t('timeline.currentMarker')}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ボタンエリア */}
        <div style={{
          padding: '8px',
          borderTop: '1px solid #3a3a5a',
        }}>
          <button
            onClick={() => setShowCastDialog(true)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '8px',
            }}
          >
            {t('timeline.addCast')}
          </button>

          <button
            onClick={() => setShowFieldChangeDialog(true)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '8px',
            }}
          >
            {t('timeline.addFieldChange')}
          </button>

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
              marginBottom: '8px',
            }}
          >
            {t('timeline.importTimeline')}
          </button>

          {timelineEntries.length > 0 && (
            <>
              <button
                onClick={handleClearTimeline}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#5a2a2a',
                  border: '1px solid #7a3a3a',
                  borderRadius: '4px',
                  color: '#ff8888',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {t('timeline.clearTimeline')}
              </button>
            </>
          )}
        </div>
      </div>

      <TimelineImportDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
        fps={fps}
        players={mechanic.initialPlayers}
      />

      <CastEventDialog
        isOpen={showCastDialog}
        currentFrame={currentFrame}
        fps={fps}
        enemies={mechanic.enemies}
        onConfirm={(settings) => {
          const castEvent: CastEvent = {
            id: `cast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'cast',
            frame: settings.startFrame,
            casterId: settings.casterId,
            skillName: settings.skillName,
            duration: settings.durationFrames,
          };
          addTimelineEvent(castEvent);
          selectObject(castEvent.id, 'cast');
          setShowCastDialog(false);
        }}
        onCancel={() => setShowCastDialog(false)}
      />

      <FieldChangeDialog
        isOpen={showFieldChangeDialog}
        currentFrame={currentFrame}
        fps={fps}
        onConfirm={(settings: FieldChangeSettings) => {
          completeFieldChange(settings);
          setShowFieldChangeDialog(false);
        }}
        onCancel={() => setShowFieldChangeDialog(false)}
      />
    </>
  );
}
