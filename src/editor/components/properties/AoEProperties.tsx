import React from 'react';
import type { AoE, AoEType, Player, AoESourceType, AoETrackingMode, GimmickObject } from '../../../data/types';
import { PositionInput } from './inputs/PositionInput';
import { NumberInput } from './inputs/NumberInput';
import { ColorInput } from './inputs/ColorInput';
import { SelectInput } from './inputs/SelectInput';

interface AoEPropertiesProps {
  aoe: AoE;
  onUpdate: (updates: Partial<AoE>) => void;
  onDelete: () => void;
  players?: Player[];
  objects?: GimmickObject[];
}

const AOE_TYPE_OPTIONS = [
  { value: 'circle', label: 'Circle' },
  { value: 'donut', label: 'Donut' },
  { value: 'cone', label: 'Cone' },
  { value: 'line', label: 'Line' },
  { value: 'cross', label: 'Cross' },
];

const SOURCE_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed (None)' },
  { value: 'boss', label: 'Boss' },
  { value: 'object', label: 'Object' },
  { value: 'player', label: 'Player' },
  { value: 'debuff', label: 'Debuff' },
];

const TRACKING_MODE_OPTIONS = [
  { value: 'static', label: 'Static (Placement)' },
  { value: 'track_source', label: 'Track Source' },
  { value: 'track_target', label: 'Track Target Player' },
];

export function AoEProperties({ aoe, onUpdate, onDelete, players = [], objects = [] }: AoEPropertiesProps) {
  // Get source options based on sourceType
  const getSourceOptions = () => {
    switch (aoe.sourceType) {
      case 'boss':
        return [];
      case 'player':
        return players.map(p => ({
          value: p.id,
          label: `${p.role}${p.name ? ` (${p.name})` : ''}`,
        }));
      case 'object':
        return objects.map(obj => ({
          value: obj.id,
          label: obj.name || obj.id,
        }));
      case 'debuff':
        return [];
      default:
        return [];
    }
  };

  const renderTypeSpecificProps = () => {
    switch (aoe.type) {
      case 'circle':
        return (
          <NumberInput
            label="Radius"
            value={aoe.radius || 5}
            onChange={(value) => onUpdate({ radius: value })}
            min={0.5}
            max={40}
            step={0.5}
          />
        );

      case 'donut':
        return (
          <>
            <NumberInput
              label="Inner Radius"
              value={aoe.innerRadius || 3}
              onChange={(value) => onUpdate({ innerRadius: value })}
              min={0.5}
              max={40}
              step={0.5}
            />
            <NumberInput
              label="Outer Radius"
              value={aoe.outerRadius || 8}
              onChange={(value) => onUpdate({ outerRadius: value })}
              min={1}
              max={40}
              step={0.5}
            />
          </>
        );

      case 'cone':
        return (
          <>
            <NumberInput
              label="Angle (degrees)"
              value={aoe.angle || 90}
              onChange={(value) => onUpdate({ angle: value })}
              min={10}
              max={360}
              step={5}
            />
            <NumberInput
              label="Direction (degrees)"
              value={aoe.direction || 0}
              onChange={(value) => onUpdate({ direction: value })}
              min={0}
              max={360}
              step={5}
            />
            <NumberInput
              label="Length"
              value={aoe.length || 10}
              onChange={(value) => onUpdate({ length: value })}
              min={1}
              max={40}
              step={0.5}
            />
          </>
        );

      case 'line':
        return (
          <>
            <NumberInput
              label="Width"
              value={aoe.width || 4}
              onChange={(value) => onUpdate({ width: value })}
              min={0.5}
              max={20}
              step={0.5}
            />
            <NumberInput
              label="Length"
              value={aoe.length || 40}
              onChange={(value) => onUpdate({ length: value })}
              min={1}
              max={80}
              step={1}
            />
            <NumberInput
              label="Rotation (degrees)"
              value={aoe.rotation || 0}
              onChange={(value) => onUpdate({ rotation: value })}
              min={0}
              max={360}
              step={5}
            />
          </>
        );

      case 'cross':
        return (
          <>
            <NumberInput
              label="Arm Width"
              value={aoe.armWidth || 4}
              onChange={(value) => onUpdate({ armWidth: value })}
              min={0.5}
              max={20}
              step={0.5}
            />
            <NumberInput
              label="Arm Length"
              value={aoe.armLength || 40}
              onChange={(value) => onUpdate({ armLength: value })}
              min={1}
              max={80}
              step={1}
            />
            <NumberInput
              label="Rotation (degrees)"
              value={aoe.rotation || 0}
              onChange={(value) => onUpdate({ rotation: value })}
              min={0}
              max={360}
              step={5}
            />
          </>
        );

      default:
        return null;
    }
  };

  const sourceOptions = getSourceOptions();

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '14px', color: '#fff', borderBottom: '1px solid #3a3a5a', paddingBottom: '8px' }}>
        AoE: {aoe.type}
      </h3>

      <SelectInput
        label="Type"
        value={aoe.type}
        onChange={(value) => onUpdate({ type: value as AoEType })}
        options={AOE_TYPE_OPTIONS}
      />

      <PositionInput
        label="Position"
        value={aoe.position}
        onChange={(value) => onUpdate({ position: value })}
      />

      <ColorInput
        label="Color"
        value={aoe.color || '#ff6600'}
        onChange={(value) => onUpdate({ color: value })}
      />

      <NumberInput
        label="Opacity"
        value={aoe.opacity || 0.5}
        onChange={(value) => onUpdate({ opacity: value })}
        min={0.1}
        max={1}
        step={0.1}
      />

      <div style={{ marginTop: '16px', borderTop: '1px solid #3a3a5a', paddingTop: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
          Type-specific Properties
        </label>
        {renderTypeSpecificProps()}
      </div>

      <div style={{ marginTop: '16px', borderTop: '1px solid #3a3a5a', paddingTop: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
          Source & Tracking Settings
        </label>

        <SelectInput
          label="Source Type"
          value={aoe.sourceType || 'fixed'}
          onChange={(value) => onUpdate({ sourceType: value as AoESourceType, sourceId: undefined })}
          options={SOURCE_TYPE_OPTIONS}
        />

        {aoe.sourceType && aoe.sourceType !== 'fixed' && (
          <>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                Source
              </label>
              {sourceOptions.length > 0 ? (
                <select
                  value={aoe.sourceId || ''}
                  onChange={(e) => onUpdate({ sourceId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Select {aoe.sourceType}...</option>
                  {sourceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={aoe.sourceId || ''}
                  onChange={(e) => onUpdate({ sourceId: e.target.value })}
                  placeholder={`Enter ${aoe.sourceType} ID...`}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              )}
            </div>

            {aoe.sourceType === 'debuff' && (
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
                  Debuff ID
                </label>
                <input
                  type="text"
                  value={aoe.sourceDebuffId || ''}
                  onChange={(e) => onUpdate({ sourceDebuffId: e.target.value })}
                  placeholder="Enter debuff ID..."
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: '#2a2a4a',
                    border: '1px solid #3a3a5a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>
            )}
          </>
        )}

        <SelectInput
          label="Tracking Mode"
          value={aoe.trackingMode || 'static'}
          onChange={(value) => onUpdate({ trackingMode: value as AoETrackingMode })}
          options={TRACKING_MODE_OPTIONS}
        />

        {/* 
        // [COMMENTED OUT] Debuff target player feature - to be temporarily disabled per Issue #4
        {aoe.trackingMode === 'track_target' && players.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>
              Target Player
            </label>
            <select
              value={aoe.targetPlayerId || ''}
              onChange={(e) => onUpdate({ targetPlayerId: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 8px',
                background: '#2a2a4a',
                border: '1px solid #3a3a5a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <option value="">Select a player...</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name || player.role} ({player.role})
                </option>
              ))}
            </select>
          </div>
        )}
        */}

        {aoe.trackingMode === 'static' && (
          <NumberInput
            label="Placement Delay (frames)"
            value={aoe.placementDelay || 0}
            onChange={(value) => onUpdate({ placementDelay: value })}
            min={0}
            max={300}
            step={1}
          />
        )}

        {aoe.sourceType && aoe.sourceType !== 'fixed' && (
          <>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px', marginTop: '8px' }}>
              Offset from Source
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <NumberInput
                label="X"
                value={aoe.offsetFromSource?.x || 0}
                onChange={(value) => onUpdate({
                  offsetFromSource: { x: value, y: aoe.offsetFromSource?.y || 0 }
                })}
                min={-50}
                max={50}
                step={0.5}
              />
              <NumberInput
                label="Y"
                value={aoe.offsetFromSource?.y || 0}
                onChange={(value) => onUpdate({
                  offsetFromSource: { x: aoe.offsetFromSource?.x || 0, y: value }
                })}
                min={-50}
                max={50}
                step={0.5}
              />
            </div>
          </>
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
        Delete AoE
      </button>
    </div>
  );
}
