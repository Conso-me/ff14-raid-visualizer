import React from 'react';
import type { TimelineEvent } from '../../../data/types';
import { TimelineEventBlock } from './TimelineEventBlock';

interface TimelineTrackProps {
  label: string;
  color: string;
  events: TimelineEvent[];
  pixelsPerFrame: number;
  offset: number;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onEventDragStart: (e: React.MouseEvent, eventId: string) => void;
}

export function TimelineTrack({
  label,
  color,
  events,
  pixelsPerFrame,
  offset,
  selectedEventId,
  onSelectEvent,
  onEventDragStart,
}: TimelineTrackProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid #2a2a4a',
        minHeight: '32px',
      }}
    >
      {/* Track label */}
      <div
        style={{
          width: '100px',
          minWidth: '100px',
          padding: '4px 8px',
          background: '#1a1a2e',
          borderRight: '1px solid #3a3a5a',
          fontSize: '11px',
          color: '#888',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: color,
          }}
        />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>

      {/* Track content */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: '#0f0f1f',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -offset,
            top: '4px',
            height: 'calc(100% - 8px)',
          }}
        >
          {events.map((event) => (
            <TimelineEventBlock
              key={event.id}
              event={event}
              pixelsPerFrame={pixelsPerFrame}
              isSelected={selectedEventId === event.id}
              onClick={() => onSelectEvent(event.id)}
              onDragStart={(e) => onEventDragStart(e, event.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
