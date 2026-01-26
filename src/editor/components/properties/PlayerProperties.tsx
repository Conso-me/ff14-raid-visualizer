import React from 'react';
import type { Player, Role, MoveEvent, TimelineEvent, DebuffAddEvent } from '../../../data/types';
import { PositionInput } from './inputs/PositionInput';
import { SelectInput } from './inputs/SelectInput';
import { TextInput } from './inputs/TextInput';
import { getPlayerDebuffEvents } from '../../utils/getPlayerDebuffs';

interface PlayerPropertiesProps {
  player: Player;
  onUpdate: (updates: Partial<Player>) => void;
  onDelete: () => void;
  timeline: TimelineEvent[];
  fps: number;
  onSetTool: (tool: 'add_move_event' | 'add_debuff') => void;
  onDeleteTimelineEvent: (id: string) => void;
}

const ROLE_OPTIONS = [
  { value: 'T1', label: 'T1 (Tank 1)' },
  { value: 'T2', label: 'T2 (Tank 2)' },
  { value: 'H1', label: 'H1 (Healer 1)' },
  { value: 'H2', label: 'H2 (Healer 2)' },
  { value: 'D1', label: 'D1 (Melee DPS)' },
  { value: 'D2', label: 'D2 (Melee DPS)' },
  { value: 'D3', label: 'D3 (Ranged DPS)' },
  { value: 'D4', label: 'D4 (Ranged DPS)' },
];

export function PlayerProperties({
  player,
  onUpdate,
  onDelete,
  timeline,
  fps,
  onSetTool,
  onDeleteTimelineEvent,
}: PlayerPropertiesProps) {
  // Get move events for this player
  const moveEvents = timeline.filter(
    (e): e is MoveEvent => e.type === 'move' && e.targetId === player.id
  ).sort((a, b) => a.frame - b.frame);

  // Get debuff events for this player
  const debuffEvents = getPlayerDebuffEvents(timeline, player.id);

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fff', borderBottom: '1px solid #3a3a5a', paddingBottom: '8px' }}>
        Player: {player.role}
      </h3>

      <SelectInput
        label="Role"
        value={player.role}
        onChange={(value) => onUpdate({ role: value as Role })}
        options={ROLE_OPTIONS}
      />

      <TextInput
        label="Name"
        value={player.name || ''}
        onChange={(value) => onUpdate({ name: value || undefined })}
        placeholder="Optional name"
      />

      <TextInput
        label="Job"
        value={player.job || ''}
        onChange={(value) => onUpdate({ job: value || undefined })}
        placeholder="e.g., WAR, WHM"
      />

      <PositionInput
        label="Initial Position"
        value={player.position}
        onChange={(value) => onUpdate({ position: value })}
      />

      {/* Move Events Section */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #3a3a5a', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>
            移動イベント ({moveEvents.length})
          </label>
          <button
            onClick={() => onSetTool('add_move_event')}
            style={{
              padding: '4px 8px',
              background: '#3753c7',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            + 追加
          </button>
        </div>

        {moveEvents.length === 0 ? (
          <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>移動イベントなし</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {moveEvents.map((event, index) => (
              <MoveEventItem
                key={event.id}
                event={event}
                index={index}
                fps={fps}
                onDelete={() => onDeleteTimelineEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Debuffs Section */}
      <div style={{ marginTop: '20px', borderTop: '1px solid #3a3a5a', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>
            デバフイベント ({debuffEvents.length})
          </label>
          <button
            onClick={() => onSetTool('add_debuff')}
            style={{
              padding: '4px 8px',
              background: '#9c27b0',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            + 追加
          </button>
        </div>

        {debuffEvents.length === 0 ? (
          <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>デバフイベントなし</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {debuffEvents.map((event, index) => (
              <DebuffEventItem
                key={`${event.debuffId}-${event.startFrame}`}
                event={event}
                index={index}
                fps={fps}
                onDelete={() => {
                  // Find and delete both add and remove events
                  const addEvent = timeline.find(
                    (e): e is DebuffAddEvent =>
                      e.type === 'debuff_add' &&
                      e.targetId === player.id &&
                      e.debuff.id === event.debuffId &&
                      e.frame === event.startFrame
                  );
                  if (addEvent) {
                    onDeleteTimelineEvent(addEvent.id);
                    // Also delete corresponding remove event
                    const removeEvent = timeline.find(
                      e => e.type === 'debuff_remove' &&
                        e.targetId === player.id &&
                        (e as any).debuffId === event.debuffId &&
                        e.frame === event.endFrame
                    );
                    if (removeEvent) {
                      onDeleteTimelineEvent(removeEvent.id);
                    }
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onDelete}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '8px',
          background: '#c73737',
          border: 'none',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Delete Player
      </button>
    </div>
  );
}

interface MoveEventItemProps {
  event: MoveEvent;
  index: number;
  fps: number;
  onDelete: () => void;
}

function MoveEventItem({ event, index, fps, onDelete }: MoveEventItemProps) {
  const startTime = (event.frame / fps).toFixed(2);
  const endTime = ((event.frame + event.duration) / fps).toFixed(2);

  return (
    <div
      style={{
        padding: '8px',
        background: '#2a2a4a',
        borderRadius: '4px',
        fontSize: '11px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 'bold' }}>移動 {index + 1}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: '2px 6px',
            background: 'transparent',
            border: '1px solid #c73737',
            borderRadius: '3px',
            color: '#c73737',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          削除
        </button>
      </div>
      <div style={{ color: '#888', marginTop: '4px' }}>
        {startTime}s → {endTime}s ({event.duration}f)
      </div>
      <div style={{ color: '#666', marginTop: '2px' }}>
        ({event.from?.x.toFixed(1)}, {event.from?.y.toFixed(1)}) → ({event.to.x.toFixed(1)}, {event.to.y.toFixed(1)})
      </div>
      <div style={{ color: '#666', marginTop: '2px' }}>
        Easing: {event.easing || 'linear'}
      </div>
    </div>
  );
}

interface DebuffEventItemProps {
  event: {
    debuffId: string;
    debuffName: string;
    debuffColor?: string;
    startFrame: number;
    endFrame: number | null;
    duration: number;
  };
  index: number;
  fps: number;
  onDelete: () => void;
}

function DebuffEventItem({ event, index, fps, onDelete }: DebuffEventItemProps) {
  const startTime = (event.startFrame / fps).toFixed(2);
  const endTime = event.endFrame !== null ? (event.endFrame / fps).toFixed(2) : '---';

  return (
    <div
      style={{
        padding: '8px',
        background: '#2a2a4a',
        borderRadius: '4px',
        fontSize: '11px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              background: event.debuffColor || '#ff6600',
            }}
          />
          <span style={{ color: '#fff', fontWeight: 'bold' }}>{event.debuffName}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: '2px 6px',
            background: 'transparent',
            border: '1px solid #c73737',
            borderRadius: '3px',
            color: '#c73737',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          削除
        </button>
      </div>
      <div style={{ color: '#888', marginTop: '4px' }}>
        {startTime}s → {endTime}s ({event.duration}秒間)
      </div>
    </div>
  );
}
