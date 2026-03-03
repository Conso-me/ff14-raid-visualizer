import React from 'react';
import { useEditor } from '../context/EditorContext';
import { useLanguage } from '../context/LanguageContext';
import type { Role, MarkerType, AoEType, AoEIndicator, MechanicMarkerType } from '../../data/types';
import { generateUniqueName } from '../../utils/naming';

const TOOLS = [
  { id: 'select', icon: '\u2196', shortcut: '1' },
  { id: 'add_move_event', icon: '\u2192', shortcut: '2' },
] as const;

const ROLES: Role[] = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];

interface AoEEntry {
  type: AoEType;
  icon: string;
  indicator?: AoEIndicator;
  labelKey: string;
}

const AOE_ENTRIES: AoEEntry[] = [
  { type: 'circle', icon: '\u25CB', labelKey: 'tools.aoeCircle' },
  { type: 'circle', icon: '\u2295', indicator: 'stack', labelKey: 'tools.aoeCircleStack' },
  { type: 'circle', icon: '\u2297', indicator: 'knockback', labelKey: 'tools.aoeCircleKnockback' },
  { type: 'circle', icon: '\uD83D\uDC41', indicator: 'eye', labelKey: 'tools.aoeCircleEye' },
  { type: 'circle', icon: '\u2460', indicator: 'stack_count', labelKey: 'tools.aoeCircleStackCount' },
  { type: 'circle', icon: '\u25BC', indicator: 'proximity', labelKey: 'tools.aoeCircleProximity' },
  { type: 'circle', icon: '\u2694', indicator: 'tankbuster', labelKey: 'tools.aoeCircleTankbuster' },
  { type: 'circle', icon: '\u25CE', indicator: 'target', labelKey: 'tools.aoeCircleTarget' },
  { type: 'circle', icon: '\u00BB', indicator: 'chase', labelKey: 'tools.aoeCircleChase' },
  { type: 'circle', icon: '\u21D4', indicator: 'knockback_radial', labelKey: 'tools.aoeCircleKnockbackRadial' },
  { type: 'circle', icon: '\u21D1', indicator: 'knockback_line', labelKey: 'tools.aoeCircleKnockbackLine' },
  { type: 'cone', icon: '\u25D7', labelKey: 'tools.aoeCone' },
  { type: 'line', icon: '\u2502', labelKey: 'tools.aoeLine' },
  { type: 'line', icon: '\u21E5', indicator: 'stack', labelKey: 'tools.aoeLineStack' },
  { type: 'line', icon: '\u21E4', indicator: 'knockback', labelKey: 'tools.aoeLineKnockback' },
  { type: 'donut', icon: '\u25CE', labelKey: 'tools.aoeDonut' },
  { type: 'cross', icon: '\u271A', labelKey: 'tools.aoeCross' },
  { type: 'distance_decay', icon: '\u25BD', labelKey: 'tools.aoeDistanceDecay' },
  { type: 'rectangle', icon: '\u25AD', labelKey: 'tools.aoeRectangle' },
];

interface MechanicMarkerEntry {
  type: MechanicMarkerType;
  icon: string;
  labelKey: string;
}

const MECHANIC_MARKER_ENTRIES: MechanicMarkerEntry[] = [
  { type: 'eye', icon: '\uD83D\uDC41', labelKey: 'tools.markerEye' },
  { type: 'stack', icon: '\u21E8', labelKey: 'tools.markerStack' },
  { type: 'stack_count', icon: '\u2460', labelKey: 'tools.markerStackCount' },
  { type: 'proximity', icon: '\u25BC', labelKey: 'tools.markerProximity' },
  { type: 'tankbuster', icon: '\u2694', labelKey: 'tools.markerTankbuster' },
  { type: 'target', icon: '\u25CE', labelKey: 'tools.markerTarget' },
  { type: 'chase', icon: '\u00BB', labelKey: 'tools.markerChase' },
  { type: 'knockback_radial', icon: '\u21D4', labelKey: 'tools.markerKnockbackRadial' },
  { type: 'knockback_line', icon: '\u21D1', labelKey: 'tools.markerKnockbackLine' },
  { type: 'telegraph', icon: '\u26A0', labelKey: 'tools.markerTelegraph' },
];

export function ToolPanelContent() {
  const {
    state,
    setTool,
    setGridSnap,
    addPlayer,
    addEnemy,
    addMarker,
    setAoEType,
    setAoEIndicator,
    setMechanicMarkerType,
  } = useEditor();
  const { t } = useLanguage();

  const toolLabels: Record<string, string> = {
    select: t('tools.select'),
    add_move_event: t('tools.addMoveEvent'),
  };

  const buttonStyle = (active: boolean) => ({
    padding: '10px 14px',
    background: active ? '#4a4a7a' : '#2a2a4a',
    border: '1px solid #3a3a5a',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  });

  const sectionStyle = {
    marginBottom: '16px',
  };

  const sectionTitleStyle = {
    fontSize: '12px',
    color: '#888',
    textTransform: 'uppercase' as const,
    marginBottom: '10px',
    letterSpacing: '0.5px',
  };

  const shortcutStyle: React.CSSProperties = {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#666',
    background: '#1a1a2e',
    padding: '2px 6px',
    borderRadius: '3px',
    border: '1px solid #3a3a5a',
  };

  const handleAddEnemy = () => {
    const id = `enemy_${Date.now()}`;
    const existingNames = state.mechanic.enemies.map((e) => e.name);
    addEnemy({
      id,
      name: generateUniqueName(t('tools.defaultEnemyName'), existingNames),
      position: { x: 0, y: 0 },
      size: 3,
      color: '#ff0000',
    });
  };

  const handleSelectAoETool = () => {
    setTool('add_aoe');
  };

  const handleSelectAoEEntry = (entry: AoEEntry) => {
    setAoEType(entry.type);
    setAoEIndicator(entry.indicator ?? null);
  };

  const isAoEEntryActive = (entry: AoEEntry) => {
    return state.selectedAoEType === entry.type
      && state.selectedAoEIndicator === (entry.indicator ?? null);
  };

  const handlePreset8Players = () => {
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
      if (!state.mechanic.initialPlayers.find((p) => p.role === role)) {
        addPlayer({
          id: `player_${role}`,
          role,
          position: { x, y },
        });
      }
    });
  };

  const handlePresetMarkers = () => {
    const markerPositions: { type: MarkerType; x: number; y: number }[] = [
      { type: 'A', x: 0, y: -15 },
      { type: 'B', x: 15, y: 0 },
      { type: 'C', x: 0, y: 15 },
      { type: 'D', x: -15, y: 0 },
      { type: '1', x: -10.6, y: -10.6 },
      { type: '2', x: 10.6, y: -10.6 },
      { type: '3', x: 10.6, y: 10.6 },
      { type: '4', x: -10.6, y: 10.6 },
    ];

    markerPositions.forEach(({ type, x, y }) => {
      addMarker({ type, position: { x, y } });
    });
  };

  return (
    <div
      style={{
        background: '#1a1a2e',
        padding: '16px',
      }}
    >
      {/* Tools */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tools.sectionTitle')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              style={buttonStyle(state.tool === tool.id)}
            >
              <span>{tool.icon}</span>
              <span>{toolLabels[tool.id]}</span>
              <span style={shortcutStyle}>{tool.shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Snap */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tools.grid')}</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={state.gridSnap}
            onChange={(e) => setGridSnap(e.target.checked)}
          />
          {t('tools.snapToGrid')}
        </label>
      </div>

      {/* Add Enemy */}
      <div style={sectionStyle}>
        <button onClick={handleAddEnemy} style={buttonStyle(false)}>
          {t('tools.addEnemy')}
        </button>
      </div>

      {/* Add AoE */}
      <div style={sectionStyle}>
        <button
          onClick={handleSelectAoETool}
          style={{
            ...buttonStyle(state.tool === 'add_aoe'),
            width: '100%',
            marginBottom: '10px',
            background: state.tool === 'add_aoe' ? '#ff6600' : '#2a2a4a',
          }}
        >
          <span>{state.tool === 'add_aoe' ? t('tools.aoePlacementModeOn') : t('tools.aoePlacementMode')}</span>
          <span style={shortcutStyle}>3</span>
        </button>

        {/* AoE type selection (shown when in add_aoe mode) */}
        {state.tool === 'add_aoe' && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              {t('tools.selectType')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {AOE_ENTRIES.map((entry, i) => (
                <button
                  key={`${entry.type}-${entry.indicator ?? 'none'}-${i}`}
                  onClick={() => handleSelectAoEEntry(entry)}
                  style={{
                    padding: '8px 10px',
                    background: isAoEEntryActive(entry) ? '#ff6600' : '#3a3a5a',
                    border: '1px solid #4a4a6a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{entry.icon}</span>
                  <span>{t(entry.labelKey as any)}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
              {t('tools.clickFieldToPlace')}
            </div>
          </div>
        )}
      </div>

      {/* Add Debuff */}
      <div style={sectionStyle}>
        {/* Debuff mode button */}
        <button
          onClick={() => setTool('add_debuff')}
          style={{
            ...buttonStyle(state.tool === 'add_debuff'),
            width: '100%',
            marginBottom: '10px',
            background: state.tool === 'add_debuff' ? '#ff00ff' : '#2a2a4a',
          }}
        >
          <span>{state.tool === 'add_debuff' ? t('tools.debuffModeOn') : t('tools.debuffMode')}</span>
          <span style={shortcutStyle}>4</span>
        </button>

        {state.tool === 'add_debuff' && (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
            {t('tools.clickPlayerToSelect')}
          </div>
        )}
      </div>

      {/* Add Text Annotation */}
      <div style={sectionStyle}>
        <button
          onClick={() => setTool('add_text')}
          style={{
            ...buttonStyle(state.tool === 'add_text'),
            width: '100%',
            background: state.tool === 'add_text' ? '#00aaff' : '#2a2a4a',
          }}
        >
          <span>{state.tool === 'add_text' ? t('tools.textModeOn') : t('tools.textMode')}</span>
          <span style={shortcutStyle}>5</span>
        </button>
        {state.tool === 'add_text' && (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '6px' }}>
            {t('tools.clickFieldToPlace')}
          </div>
        )}
      </div>

      {/* Add Object */}
      <div style={sectionStyle}>
        <button
          onClick={() => setTool('add_object')}
          style={{
            ...buttonStyle(state.tool === 'add_object'),
            width: '100%',
            background: state.tool === 'add_object' ? '#ffaa00' : '#2a2a4a',
          }}
        >
          <span>{state.tool === 'add_object' ? t('tools.objectModeOn') : t('tools.objectMode')}</span>
          <span style={shortcutStyle}>6</span>
        </button>
        {state.tool === 'add_object' && (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '6px' }}>
            {t('tools.clickFieldToPlace')}
          </div>
        )}
      </div>

      {/* Add Mechanic Marker */}
      <div style={sectionStyle}>
        <button
          onClick={() => setTool('add_mechanic_marker')}
          style={{
            ...buttonStyle(state.tool === 'add_mechanic_marker'),
            width: '100%',
            marginBottom: '10px',
            background: state.tool === 'add_mechanic_marker' ? '#ff4488' : '#2a2a4a',
          }}
        >
          <span>{state.tool === 'add_mechanic_marker' ? t('tools.mechanicMarkerModeOn') : t('tools.mechanicMarkerMode')}</span>
          <span style={shortcutStyle}>7</span>
        </button>

        {state.tool === 'add_mechanic_marker' && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              {t('tools.selectType')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {MECHANIC_MARKER_ENTRIES.map((entry) => (
                <button
                  key={entry.type}
                  onClick={() => setMechanicMarkerType(entry.type)}
                  style={{
                    padding: '8px 10px',
                    background: state.selectedMechanicMarkerType === entry.type ? '#ff4488' : '#3a3a5a',
                    border: '1px solid #4a4a6a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{entry.icon}</span>
                  <span>{t(entry.labelKey as any)}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
              {t('tools.clickFieldToPlace')}
            </div>
          </div>
        )}
      </div>

      {/* Presets */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>{t('tools.presets')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={handlePreset8Players} style={buttonStyle(false)}>
            {t('tools.preset8Player')}
          </button>
          <button onClick={handlePresetMarkers} style={buttonStyle(false)}>
            {t('tools.presetMarkers')}
          </button>
        </div>
      </div>


    </div>
  );
}
