import React from 'react';
import type { TimelineEvent } from '../../../data/types';

interface TimelineEventBlockProps {
  event: TimelineEvent;
  pixelsPerFrame: number;
  isSelected: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

function getEventColor(event: TimelineEvent): string {
  switch (event.type) {
    case 'move':
      return '#3753c7';
    case 'aoe_show':
      return '#ff6600';
    case 'aoe_hide':
      return '#ff660080';
    case 'debuff_add':
      return '#ff00ff';
    case 'debuff_remove':
      return '#ff00ff80';
    case 'text':
      return '#00cc00';
    case 'cast':
      return '#ffcc00';
    case 'boss_move':
      return '#ff0000';
    case 'text_show':
      return '#00aaff';
    case 'text_hide':
      return '#00aaff80';
    case 'object_show':
      return '#ffaa00';
    case 'object_hide':
      return '#ffaa0080';
    default:
      return '#888';
  }
}

function getEventDuration(event: TimelineEvent): number {
  switch (event.type) {
    case 'move':
      return event.duration;
    case 'aoe_show':
      return event.fadeInDuration || 1;
    case 'aoe_hide':
      return event.fadeOutDuration || 1;
    case 'text':
      return event.duration;
    case 'cast':
      return event.duration;
    case 'boss_move':
      return event.duration;
    case 'object_show':
      return event.fadeInDuration || 1;
    case 'object_hide':
      return event.fadeOutDuration || 1;
    default:
      return 10; // Default width for instant events
  }
}

function getEventLabel(event: TimelineEvent): string {
  switch (event.type) {
    case 'move':
      return `Move: ${event.targetId}`;
    case 'aoe_show':
      return `AoE: ${event.aoe.type}`;
    case 'aoe_hide':
      return `Hide: ${event.aoeId}`;
    case 'debuff_add':
      return `Debuff: ${event.debuff.name}`;
    case 'debuff_remove':
      return `Remove: ${event.debuffId}`;
    case 'text':
      return event.textType === 'main' ? 'Text' : 'Role Text';
    case 'cast':
      return `Cast: ${event.skillName}`;
    case 'boss_move':
      return `Boss Move`;
    case 'text_show':
      return `Text: ${event.annotation.text.slice(0, 15)}`;
    case 'text_hide':
      return `Hide Text: ${event.annotationId}`;
    case 'object_show':
      return `Obj: ${event.object.name}`;
    case 'object_hide':
      return `Hide Obj: ${event.objectId}`;
    case 'field_change':
      return `BG Change`;
    case 'field_revert':
      return `BG Revert`;
  }
}

export function TimelineEventBlock({
  event,
  pixelsPerFrame,
  isSelected,
  onClick,
  onDragStart,
}: TimelineEventBlockProps) {
  const duration = getEventDuration(event);
  const width = Math.max(duration * pixelsPerFrame, 20);
  const left = event.frame * pixelsPerFrame;
  const color = getEventColor(event);
  const label = getEventLabel(event);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={onDragStart}
      style={{
        position: 'absolute',
        left,
        width,
        height: '24px',
        background: color,
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '10px',
        color: '#fff',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        boxShadow: isSelected ? '0 0 0 2px #00ffff' : 'none',
        display: 'flex',
        alignItems: 'center',
      }}
      title={`${label} @ frame ${event.frame}`}
    >
      {label}
    </div>
  );
}
