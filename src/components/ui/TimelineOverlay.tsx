import React, { useMemo } from 'react';
import { TimelineEvent } from '../../data/types';
import { FONT_FAMILY } from '../../utils/font';

interface TimelineOverlayProps {
  timeline: TimelineEvent[];
  currentFrame: number;
  fps: number;
  title?: string;
}

interface TimelineEntry {
  time: number;
  frame: number;
  name: string;
}

const BUFFER_SECONDS = 2;

export const TimelineOverlay: React.FC<TimelineOverlayProps> = ({
  timeline,
  currentFrame,
  fps,
  title,
}) => {
  const displayTime = currentFrame / fps;
  const displayMinutes = Math.floor(displayTime / 60);
  const displaySeconds = Math.floor(displayTime % 60);
  const displayTimeStr = `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;

  // 同じ秒数のイベントをグループ化
  const timelineEntries: TimelineEntry[] = useMemo(() => {
    const secondsMap = new Map<number, { names: string[]; frame: number }>();
    let minFrame = Infinity;

    timeline.forEach((event) => {
      if (event.frame < minFrame) minFrame = event.frame;
    });

    const bufferFrames = BUFFER_SECONDS * fps;

    timeline.forEach((event) => {
      const adjustedFrame = Math.max(0, event.frame - minFrame + bufferFrames);

      let name = '';
      switch (event.type) {
        case 'cast':
          name = event.skillName || 'Cast';
          break;
        case 'text':
          name = typeof event.content === 'string' ? event.content : 'Role Text';
          break;
        default:
          // 技術的なイベント（aoe_show/hide, object_show/hide, move, boss_move, debuff等）は表示しない
          return;
      }

      if (name) {
        // 秒数単位でグループ化
        const seconds = Math.floor(adjustedFrame / fps);
        if (!secondsMap.has(seconds)) {
          secondsMap.set(seconds, { names: [], frame: adjustedFrame });
        }
        const group = secondsMap.get(seconds)!;
        group.names.push(name);
        // グループ内の最小フレームを保持
        if (adjustedFrame < group.frame) {
          group.frame = adjustedFrame;
        }
      }
    });

    // Mapをエントリー配列に変換（同じ秒数のイベントは改行で結合）
    const entries: TimelineEntry[] = [];
    secondsMap.forEach(({ names, frame }, seconds) => {
      entries.push({
        time: seconds,
        frame,
        name: names.join('\n'),
      });
    });

    // 時間順にソート
    return entries.sort((a, b) => a.frame - b.frame);
  }, [timeline, fps]);

  const adjustedCurrentFrame = Math.max(0, currentFrame + (BUFFER_SECONDS * fps) - (timelineEntries[0]?.frame || 0));

  const currentEntryIndex = timelineEntries.findIndex((entry, index) => {
    if (adjustedCurrentFrame < entry.frame) return false;
    const nextEntry = timelineEntries[index + 1];
    if (!nextEntry) return true;
    return adjustedCurrentFrame < nextEntry.frame;
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 200,
        backgroundColor: 'rgba(26, 26, 46, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
        borderRight: '2px solid rgba(58, 58, 90, 0.8)',
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* タイトル表示 */}
      {title && (
        <div
          style={{
            padding: '8px',
            backgroundColor: 'rgba(26, 26, 46, 0.95)',
            borderBottom: '1px solid rgba(58, 58, 90, 0.6)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: '#ccc',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </div>
        </div>
      )}

      {/* Current Time Display */}
      <div
        style={{
          padding: '12px 8px',
          backgroundColor: 'rgba(26, 26, 46, 0.95)',
          borderBottom: '2px solid rgba(58, 58, 90, 0.8)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#fff',
            fontFamily: 'monospace',
          }}
        >
          {displayTimeStr}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#888',
            marginTop: 2,
          }}
        >
          Frame: {currentFrame}
        </div>
      </div>

      {/* Timeline Events List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 4px',
        }}
      >
        {timelineEntries.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: '#666',
              textAlign: 'center',
              padding: '20px 8px',
            }}
          >
            タイムラインがありません
          </div>
        ) : (
          timelineEntries.map((entry, index) => {
            const isCurrent = index === currentEntryIndex;
            const minutes = Math.floor(entry.time / 60);
            const seconds = Math.floor(entry.time % 60);
            const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            return (
              <div
                key={index}
                style={{
                  padding: isCurrent ? '10px 8px' : '6px 6px',
                  marginBottom: 4,
                  background: isCurrent ? '#3753c7' : 'transparent',
                  borderRadius: 6,
                  border: isCurrent ? '2px solid #5a7aff' : '2px solid transparent',
                  boxShadow: isCurrent ? '0 0 10px rgba(55, 83, 199, 0.5)' : 'none',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                {isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      right: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderLeft: '10px solid #ff6b6b',
                    }}
                  />
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: isCurrent ? 14 : 12,
                      fontWeight: 'bold',
                      color: isCurrent ? '#fff' : '#888',
                      minWidth: 45,
                      flexShrink: 0,
                      fontFamily: 'monospace',
                    }}
                  >
                    {timeStr}
                  </span>
                  <span
                    style={{
                      fontSize: isCurrent ? 13 : 11,
                      color: isCurrent ? '#fff' : '#ccc',
                      flex: 1,
                      lineHeight: 1.5,
                      fontWeight: isCurrent ? 'bold' : 'normal',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-line', // 改行を有効化
                    }}
                  >
                    {entry.name}
                  </span>
                </div>

                {isCurrent && (
                  <div
                    style={{
                      fontSize: 10,
                      color: '#ff6b6b',
                      marginTop: 4,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>▶</span>
                    <span>Now</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};