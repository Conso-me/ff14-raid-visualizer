import React, { useMemo } from 'react';
import type { TimelineEvent } from '../../../data/types';
import { ROLE_COLORS } from '../../../data/constants';
import { TimelineTrack } from './TimelineTrack';

interface TimelineTracksProps {
  events: TimelineEvent[];
  playerIds: string[];
  enemyIds: string[];
  pixelsPerFrame: number;
  offset: number;
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onEventDragStart: (e: React.MouseEvent, eventId: string) => void;
}

export function TimelineTracks({
  events,
  playerIds,
  enemyIds,
  pixelsPerFrame,
  offset,
  selectedEventId,
  onSelectEvent,
  onEventDragStart,
}: TimelineTracksProps) {
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {
      aoe: [],
      text: [],
      cast: [],
    };

    // Initialize player tracks
    playerIds.forEach((id) => {
      groups[id] = [];
    });

    // Initialize enemy tracks
    enemyIds.forEach((id) => {
      groups[`enemy_${id}`] = [];
    });

    // Group events
    events.forEach((event) => {
      switch (event.type) {
        case 'move':
          if (groups[event.targetId]) {
            groups[event.targetId].push(event);
          }
          break;
        case 'aoe_show':
        case 'aoe_hide':
          groups.aoe.push(event);
          break;
        case 'debuff_add':
        case 'debuff_remove':
          if (event.targetId === 'all') {
            playerIds.forEach((id) => {
              if (groups[id]) groups[id].push(event);
            });
          } else if (groups[event.targetId]) {
            groups[event.targetId].push(event);
          }
          break;
        case 'text':
          groups.text.push(event);
          break;
        case 'cast':
          groups.cast.push(event);
          break;
        case 'boss_move':
          const enemyKey = `enemy_${event.targetId}`;
          if (groups[enemyKey]) {
            groups[enemyKey].push(event);
          }
          break;
      }
    });

    return groups;
  }, [events, playerIds, enemyIds]);

  const tracks = useMemo(() => {
    const result: { id: string; label: string; color: string; events: TimelineEvent[] }[] = [];

    // System tracks
    if (groupedEvents.cast.length > 0 || true) {
      result.push({ id: 'cast', label: 'Cast Bars', color: '#ffcc00', events: groupedEvents.cast });
    }
    if (groupedEvents.text.length > 0 || true) {
      result.push({ id: 'text', label: 'Text', color: '#00cc00', events: groupedEvents.text });
    }
    if (groupedEvents.aoe.length > 0 || true) {
      result.push({ id: 'aoe', label: 'AoE', color: '#ff6600', events: groupedEvents.aoe });
    }

    // Enemy tracks
    enemyIds.forEach((id) => {
      const key = `enemy_${id}`;
      result.push({
        id: key,
        label: `Boss: ${id.replace('enemy_', '')}`,
        color: '#ff0000',
        events: groupedEvents[key] || [],
      });
    });

    // Player tracks
    playerIds.forEach((id) => {
      const role = id.replace('player_', '') as keyof typeof ROLE_COLORS;
      result.push({
        id,
        label: role,
        color: ROLE_COLORS[role] || '#888',
        events: groupedEvents[id] || [],
      });
    });

    return result;
  }, [groupedEvents, playerIds, enemyIds]);

  return (
    <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
      {tracks.map((track) => (
        <TimelineTrack
          key={track.id}
          label={track.label}
          color={track.color}
          events={track.events}
          pixelsPerFrame={pixelsPerFrame}
          offset={offset}
          selectedEventId={selectedEventId}
          onSelectEvent={onSelectEvent}
          onEventDragStart={onEventDragStart}
        />
      ))}
    </div>
  );
}
