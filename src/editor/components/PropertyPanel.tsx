import React from 'react';
import { useEditor } from '../context/EditorContext';
import { PlayerProperties } from './properties/PlayerProperties';
import { EnemyProperties } from './properties/EnemyProperties';
import { MarkerProperties } from './properties/MarkerProperties';
import { AoEProperties } from './properties/AoEProperties';
import { TextAnnotationProperties } from './properties/TextAnnotationProperties';
import { ObjectProperties } from './properties/ObjectProperties';
import { getAnnotationEventPairs } from '../utils/getActiveAnnotations';
import { getObjectEventPairs } from '../utils/getActiveObjects';

export function PropertyPanel() {
  const {
    state,
    updatePlayer,
    deletePlayer,
    updateEnemy,
    deleteEnemy,
    updateMarker,
    deleteMarker,
    updateAoE,
    deleteAoE,
    getAoEsAtFrame,
    setTool,
    deleteTimelineEvent,
    updateTextAnnotation,
    deleteTextAnnotation,
    updateObject,
    deleteObject,
  } = useEditor();

  const { selectedObjectId, selectedObjectType, mechanic, currentFrame } = state;

  const renderProperties = () => {
    if (!selectedObjectId || !selectedObjectType) {
      return (
        <div style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
          Select an object to edit its properties
        </div>
      );
    }

    switch (selectedObjectType) {
      case 'player': {
        const player = mechanic.initialPlayers.find((p) => p.id === selectedObjectId);
        if (!player) return null;
        return (
          <PlayerProperties
            player={player}
            onUpdate={(updates) => updatePlayer(selectedObjectId, updates)}
            onDelete={() => deletePlayer(selectedObjectId)}
            timeline={mechanic.timeline}
            fps={mechanic.fps}
            onSetTool={setTool}
            onDeleteTimelineEvent={deleteTimelineEvent}
          />
        );
      }

      case 'enemy': {
        const enemy = mechanic.enemies.find((e) => e.id === selectedObjectId);
        if (!enemy) return null;
        return (
          <EnemyProperties
            enemy={enemy}
            onUpdate={(updates) => updateEnemy(selectedObjectId, updates)}
            onDelete={() => deleteEnemy(selectedObjectId)}
          />
        );
      }

      case 'marker': {
        const marker = mechanic.markers.find((m) => m.type === selectedObjectId);
        if (!marker) return null;
        return (
          <MarkerProperties
            marker={marker}
            onUpdate={(updates) => updateMarker(marker.type, updates)}
            onDelete={() => deleteMarker(marker.type)}
          />
        );
      }

      case 'aoe': {
        const aoes = getAoEsAtFrame(currentFrame);
        const aoe = aoes.find((a) => a.id === selectedObjectId);
        if (!aoe) {
          // Try to find in timeline
          const event = mechanic.timeline.find(
            (e) => e.type === 'aoe_show' && e.aoe.id === selectedObjectId
          );
          if (event && event.type === 'aoe_show') {
            return (
              <AoEProperties
                aoe={event.aoe}
                onUpdate={(updates) => updateAoE(selectedObjectId, updates)}
                onDelete={() => deleteAoE(selectedObjectId)}
                players={mechanic.initialPlayers}
              />
            );
          }
          return null;
        }
        return (
          <AoEProperties
            aoe={aoe}
            onUpdate={(updates) => updateAoE(selectedObjectId, updates)}
            onDelete={() => deleteAoE(selectedObjectId)}
            players={mechanic.initialPlayers}
          />
        );
      }

      case 'text': {
        const annotationPairs = getAnnotationEventPairs(mechanic.timeline);
        const pair = annotationPairs.find((p) => p.annotation.id === selectedObjectId);
        if (!pair) return null;
        return (
          <TextAnnotationProperties
            annotation={pair.annotation}
            showFrame={pair.showFrame}
            hideFrame={pair.hideFrame}
            fps={mechanic.fps}
            onUpdate={(updates) => updateTextAnnotation(selectedObjectId, updates)}
            onDelete={() => deleteTextAnnotation(selectedObjectId)}
          />
        );
      }

      case 'object': {
        const objectPairs = getObjectEventPairs(mechanic.timeline);
        const pair = objectPairs.find((p) => p.object.id === selectedObjectId);
        if (!pair) return null;
        return (
          <ObjectProperties
            object={pair.object}
            showFrame={pair.showFrame}
            hideFrame={pair.hideFrame}
            fps={mechanic.fps}
            onUpdate={(updates) => updateObject(selectedObjectId, updates)}
            onDelete={() => deleteObject(selectedObjectId)}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '280px',
        background: '#1a1a2e',
        borderLeft: '1px solid #3a3a5a',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#fff' }}>Properties</h2>
      {renderProperties()}
    </div>
  );
}
