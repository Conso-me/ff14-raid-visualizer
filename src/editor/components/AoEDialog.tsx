import React, { useState, useMemo } from 'react';
import type { Position, AoEType, AoESourceType, AoETrackingMode, Enemy, Player, GimmickObject } from '../../data/types';
import type { AoESettings } from '../context/editorReducer';
import { useEditor } from '../context/EditorContext';
import { useLanguage } from '../context/LanguageContext';
import { getActiveObjects } from '../utils/getActiveObjects';

interface AoEDialogProps {
  isOpen: boolean;
  position: Position;
  type: AoEType;
  currentFrame: number;
  fps: number;
  onConfirm: (settings: AoESettings) => void;
  onCancel: () => void;
}

function getDefaultParams(type: AoEType): Record<string, number> {
  switch (type) {
    case 'circle':
      return { radius: 5 };
    case 'cone':
      return { angle: 90, direction: 0, length: 15 };
    case 'line':
      return { width: 4, length: 20, direction: 0 };
    case 'donut':
      return { innerRadius: 5, outerRadius: 12 };
    case 'cross':
      return { width: 4, length: 20 };
    default:
      return {};
  }
}

export function AoEDialog({
  isOpen,
  position,
  type,
  currentFrame,
  fps,
  onConfirm,
  onCancel,
}: AoEDialogProps) {
  const { state } = useEditor();
  const { t } = useLanguage();
  const [params, setParams] = useState<Record<string, number>>(getDefaultParams(type));
  const [color, setColor] = useState('#ff6600');
  const [opacity, setOpacity] = useState(0.5);
  const [startFrame, setStartFrame] = useState(currentFrame);
  const [duration, setDuration] = useState(60);
  const [fadeInDuration, setFadeInDuration] = useState(10);
  const [fadeOutDuration, setFadeOutDuration] = useState(15);

  // 新規: 起点・追従設定
  const [sourceType, setSourceType] = useState<AoESourceType>('fixed');
  const [sourceId, setSourceId] = useState<string>('');
  const [sourceDebuffId, setSourceDebuffId] = useState<string>('');
  const [trackingMode, setTrackingMode] = useState<AoETrackingMode>('static');
  const [targetPlayerId, setTargetPlayerId] = useState<string>('');
  const [placementDelay, setPlacementDelay] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [autoDirection, setAutoDirection] = useState(false);

  if (!isOpen) return null;

  // タイムラインからオブジェクト一覧を取得
  const availableObjects = useMemo(() => {
    const activeObjects = getActiveObjects(state.mechanic.timeline, currentFrame);
    return activeObjects;
  }, [state.mechanic.timeline, currentFrame]);

  const typeNames: Record<AoEType, string> = {
    circle: t('aoeDialog.circle'),
    cone: t('aoeDialog.cone'),
    line: t('aoeDialog.line'),
    donut: t('aoeDialog.donut'),
    cross: t('aoeDialog.cross'),
  };

  const handleConfirm = () => {
    onConfirm({
      type,
      position,
      ...params,
      color,
      opacity,
      startFrame,
      duration,
      fadeInDuration,
      fadeOutDuration,
      sourceType,
      sourceId: sourceId || undefined,
      sourceDebuffId: sourceDebuffId || undefined,
      trackingMode,
      targetPlayerId: targetPlayerId || undefined,
      placementDelay,
      offsetFromSource: (sourceType !== 'fixed' && (offsetX !== 0 || offsetY !== 0))
        ? { x: offsetX, y: offsetY }
        : undefined,
      autoDirection: (type === 'line' || type === 'cone') && sourceType !== 'fixed' && targetPlayerId && autoDirection
        ? true
        : undefined,
    });
  };

  const inputStyle = {
    width: '100%',
    marginTop: '4px',
    padding: '6px 8px',
    background: '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  };

  const sectionTitleStyle = {
    fontSize: '13px',
    fontWeight: 'bold' as const,
    color: '#ccc',
    marginBottom: '8px',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          padding: '24px',
          width: '480px',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: '1px solid #3a3a5a',
        }}
      >
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#fff' }}>
          {t('aoeDialog.title', { type: typeNames[type] })}
        </h2>

        {/* Position (read-only) */}
        <div
          style={{
            padding: '8px 12px',
            background: '#2a2a4a',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('common.position')}</label>
          <p style={{ margin: '4px 0 0', color: '#fff', fontSize: '13px' }}>
            X: {position.x.toFixed(1)}, Y: {position.y.toFixed(1)}
          </p>
        </div>

        {/* 起点設定 */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('aoeDialog.sourceSettings')}</div>

          <label style={labelStyle}>
            {t('aoeDialog.sourceType')}
            <select
              value={sourceType}
              onChange={(e) => {
                setSourceType(e.target.value as AoESourceType);
                setSourceId('');
                setSourceDebuffId('');
              }}
              style={selectStyle}
            >
              <option value="fixed">{t('aoeDialog.fixed')}</option>
              <option value="boss">{t('aoeDialog.boss')}</option>
              <option value="object">{t('aoeDialog.object')}</option>
              <option value="player">{t('aoeDialog.player')}</option>
              <option value="debuff">{t('aoeDialog.debuffPlayer')}</option>
            </select>
          </label>

          {sourceType === 'boss' && (
            <label style={labelStyle}>
              {t('aoeDialog.bossSelect')}
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('common.selectPlease')}</option>
                {state.mechanic.enemies.map((enemy: Enemy) => (
                  <option key={enemy.id} value={enemy.id}>
                    {enemy.name || enemy.id}
                  </option>
                ))}
              </select>
            </label>
          )}

          {sourceType === 'player' && (
            <label style={labelStyle}>
              {t('aoeDialog.playerSelect')}
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('common.selectPlease')}</option>
                {state.mechanic.initialPlayers.map((player: Player) => (
                  <option key={player.id} value={player.id}>
                    {player.name || player.role} ({player.role})
                  </option>
                ))}
              </select>
            </label>
          )}

          {sourceType === 'debuff' && (
            <label style={labelStyle}>
              {t('aoeDialog.debuffId')}
              <input
                type="text"
                value={sourceDebuffId}
                onChange={(e) => setSourceDebuffId(e.target.value)}
                placeholder={t('aoeDialog.debuffIdPlaceholder')}
                style={inputStyle}
              />
            </label>
          )}

          {sourceType === 'object' && (
            <label style={labelStyle}>
              {t('aoeDialog.objectSelect')}
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('common.selectPlease')}</option>
                {availableObjects.map((obj: GimmickObject) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.name || obj.id}
                  </option>
                ))}
              </select>
            </label>
          )}

          {sourceType !== 'fixed' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                <label style={labelStyle}>
                  {t('aoeDialog.offsetX')}
                  <input
                    type="number"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseFloat(e.target.value) || 0)}
                    step={0.5}
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>
                  {t('aoeDialog.offsetY')}
                  <input
                    type="number"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseFloat(e.target.value) || 0)}
                    step={0.5}
                    style={inputStyle}
                  />
                </label>
              </div>
            </>
          )}
        </div>

        {/* 追従モード設定 */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('aoeDialog.trackingMode')}</div>

          <label style={labelStyle}>
            {t('aoeDialog.mode')}
            <select
              value={trackingMode}
              onChange={(e) => {
                setTrackingMode(e.target.value as AoETrackingMode);
                if (e.target.value !== 'track_target') {
                  setTargetPlayerId('');
                }
              }}
              style={selectStyle}
            >
              <option value="static">
                {t('aoeDialog.static')}
              </option>
              <option value="track_source">
                {t('aoeDialog.trackSource')}
              </option>
              <option value="track_target">
                {t('aoeDialog.trackTarget')}
              </option>
            </select>
          </label>

          {trackingMode === 'track_target' && (
            <label style={labelStyle}>
              {t('aoeDialog.trackTargetPlayer')}
              <select
                value={targetPlayerId}
                onChange={(e) => setTargetPlayerId(e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('common.selectPlease')}</option>
                {state.mechanic.initialPlayers.map((player: Player) => (
                  <option key={player.id} value={player.id}>
                    {player.name || player.role} ({player.role})
                  </option>
                ))}
              </select>
            </label>
          )}

          {(type === 'line' || type === 'cone') && sourceType !== 'fixed' && targetPlayerId && (
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoDirection}
                onChange={(e) => setAutoDirection(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>{t('aoeDialog.autoDirection')}</span>
            </label>
          )}

          {trackingMode === 'static' && (
            <label style={labelStyle}>
              {t('aoeDialog.placementDelay')}
              <input
                type="number"
                value={placementDelay}
                onChange={(e) => setPlacementDelay(parseInt(e.target.value) || 0)}
                min={0}
                step={1}
                style={inputStyle}
              />
              <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {t('aoeDialog.placementDelayDesc')}
              </p>
            </label>
          )}
        </div>

        {/* Size settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('aoeDialog.sizeSettings')}</div>

          {type === 'circle' && (
            <label style={labelStyle}>
              {t('aoeDialog.radius')}
              <input
                type="number"
                value={params.radius || 5}
                onChange={(e) => setParams({ ...params, radius: parseFloat(e.target.value) || 0 })}
                min={1}
                max={30}
                step={0.5}
                style={inputStyle}
              />
            </label>
          )}

          {type === 'cone' && (
            <>
              <label style={labelStyle}>
                {t('aoeDialog.angle')}
                <input
                  type="number"
                  value={params.angle || 90}
                  onChange={(e) => setParams({ ...params, angle: parseFloat(e.target.value) || 0 })}
                  min={10}
                  max={360}
                  step={5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('aoeDialog.direction')}
                <input
                  type="number"
                  value={params.direction ?? 0}
                  onChange={(e) => setParams({ ...params, direction: parseFloat(e.target.value) || 0 })}
                  min={-180}
                  max={180}
                  step={5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('aoeDialog.length')}
                <input
                  type="number"
                  value={params.length || 15}
                  onChange={(e) => setParams({ ...params, length: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={40}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
            </>
          )}

          {type === 'line' && (
            <>
              <label style={labelStyle}>
                {t('aoeDialog.lineWidth')}
                <input
                  type="number"
                  value={params.width || 4}
                  onChange={(e) => setParams({ ...params, width: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={20}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('aoeDialog.length')}
                <input
                  type="number"
                  value={params.length || 20}
                  onChange={(e) => setParams({ ...params, length: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={50}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('aoeDialog.direction')}
                <input
                  type="number"
                  value={params.direction ?? 0}
                  onChange={(e) => setParams({ ...params, direction: parseFloat(e.target.value) || 0 })}
                  min={-180}
                  max={180}
                  step={5}
                  style={inputStyle}
                />
              </label>
            </>
          )}

          {type === 'donut' && (
            <>
              <label style={labelStyle}>
                {t('aoeDialog.innerRadius')}
                <input
                  type="number"
                  value={params.innerRadius || 5}
                  onChange={(e) => setParams({ ...params, innerRadius: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={20}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('aoeDialog.outerRadius')}
                <input
                  type="number"
                  value={params.outerRadius || 12}
                  onChange={(e) => setParams({ ...params, outerRadius: parseFloat(e.target.value) || 0 })}
                  min={2}
                  max={30}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
            </>
          )}

          {type === 'cross' && (
            <>
              <label style={labelStyle}>
                {t('aoeDialog.lineWidth')}
                <input
                  type="number"
                  value={params.width || 4}
                  onChange={(e) => setParams({ ...params, width: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={20}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                {t('aoeDialog.length')}
                <input
                  type="number"
                  value={params.length || 20}
                  onChange={(e) => setParams({ ...params, length: parseFloat(e.target.value) || 0 })}
                  min={1}
                  max={40}
                  step={0.5}
                  style={inputStyle}
                />
              </label>
            </>
          )}
        </div>

        {/* Appearance settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('aoeDialog.appearance')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={labelStyle}>
              {t('common.color')}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ ...inputStyle, padding: '2px', height: '36px' }}
              />
            </label>
            <label style={labelStyle}>
              {t('aoeDialog.aoeOpacity')}
              <input
                type="number"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value) || 0)}
                min={0.1}
                max={1}
                step={0.1}
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        {/* Timing settings */}
        <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px', marginBottom: '16px' }}>
          <div style={sectionTitleStyle}>{t('aoeDialog.timing')}</div>

          <label style={labelStyle}>
            {t('aoeDialog.startFrame')}
            <input
              type="number"
              value={startFrame}
              onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
              min={0}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
            {t('aoeDialog.startFrameDesc', { seconds: (startFrame / fps).toFixed(2) })}
          </p>

          <label style={labelStyle}>
            {t('aoeDialog.duration')}
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              min={1}
              step={1}
              style={inputStyle}
            />
          </label>
          <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px', marginBottom: '8px' }}>
            {t('aoeDialog.durationDesc', { seconds: (duration / fps).toFixed(2) })}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                {t('aoeDialog.fadeIn')}
                <input
                  type="number"
                  value={fadeInDuration}
                  onChange={(e) => setFadeInDuration(parseInt(e.target.value) || 0)}
                  min={0}
                  step={1}
                  style={inputStyle}
                />
              </label>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px' }}>
                {t('aoeDialog.secondsLabel', { seconds: (fadeInDuration / fps).toFixed(2) })}
              </p>
            </div>
            <div>
              <label style={labelStyle}>
                {t('aoeDialog.fadeOut')}
                <input
                  type="number"
                  value={fadeOutDuration}
                  onChange={(e) => setFadeOutDuration(parseInt(e.target.value) || 0)}
                  min={0}
                  step={1}
                  style={inputStyle}
                />
              </label>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '-4px' }}>
                {t('aoeDialog.secondsLabel', { seconds: (fadeOutDuration / fps).toFixed(2) })}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              background: '#3a3a5a',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 16px',
              background: '#ff6600',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {t('common.add')}
          </button>
        </div>
      </div>
    </div>
  );
}
