import React from 'react';
import { useCurrentFrame } from 'remotion';
import { MechanicData, RoleText } from '../data/types';
import { SCREEN_BACKGROUND, FIELD_DEFAULTS } from '../data/constants';
import { useTimeline } from '../hooks/useTimeline';
import { Field } from '../components/field/Field';
import { FieldMarker } from '../components/marker/FieldMarker';
import { Player } from '../components/player/Player';
import { Enemy } from '../components/enemy/Enemy';
import { AoE } from '../components/aoe/AoE';
import { GimmickObjectRenderer } from '../components/object/GimmickObjectRenderer';
import {
  ExplanationText,
  RoleExplanation,
  CastBar,
  TimelineBar,
  TimelineOverlay,
} from '../components/ui';

export interface MechanicCompositionProps {
  mechanic: MechanicData;
}

export const MechanicComposition: React.FC<MechanicCompositionProps> = ({
  mechanic,
}) => {
  // mechanicが未定義の場合のガード（Remotionの型システム対応）
  if (!mechanic) {
    return <div>Loading...</div>;
  }
  const frame = useCurrentFrame();
  const state = useTimeline(mechanic);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: SCREEN_BACKGROUND,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* フィールド */}
      <Field
        type={mechanic.field.type}
        size={mechanic.field.size}
        width={mechanic.field.width}
        height={mechanic.field.height}
        screenSize={FIELD_DEFAULTS.screenSize}
        backgroundColor={state.fieldState.backgroundColor}
        gridEnabled={mechanic.field.gridEnabled}
        backgroundImage={state.fieldState.backgroundImage}
        backgroundOpacity={state.fieldState.backgroundOpacity}
      >
        {/* フィールドマーカー */}
        {mechanic.markers.map((marker) => (
          <FieldMarker
            key={marker.type}
            type={marker.type}
            position={marker.position}
            fieldSize={mechanic.field.size}
            screenSize={FIELD_DEFAULTS.screenSize}
          />
        ))}

        {/* AoE（プレイヤーの下に表示） */}
        {state.activeAoEs.map((aoe) => (
          <AoE
            key={aoe.id}
            type={aoe.type}
            position={aoe.position}
            color={aoe.color}
            opacity={aoe.opacity}
            radius={aoe.radius}
            innerRadius={aoe.innerRadius}
            outerRadius={aoe.outerRadius}
            angle={aoe.angle}
            direction={aoe.direction}
            length={aoe.length}
            width={aoe.width}
            armWidth={aoe.armWidth}
            armLength={aoe.armLength}
            rotation={aoe.rotation}
            fieldSize={mechanic.field.size}
            screenSize={FIELD_DEFAULTS.screenSize}
          />
        ))}

        {/* ギミックオブジェクト */}
        {state.activeObjects.map((obj) => (
          <GimmickObjectRenderer
            key={obj.id}
            object={obj}
            fieldSize={mechanic.field.size}
            screenSize={FIELD_DEFAULTS.screenSize}
          />
        ))}

        {/* 敵（ボス） */}
        {state.enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            name={enemy.name}
            position={enemy.position}
            size={enemy.size}
            color={enemy.color}
            fieldSize={mechanic.field.size}
            screenSize={FIELD_DEFAULTS.screenSize}
          />
        ))}

        {/* プレイヤー */}
        {state.players.map((player) => (
          <Player
            key={player.id}
            role={player.role}
            position={player.position}
            name={player.name}
            debuffs={player.debuffs}
            currentFrame={frame}
            fps={mechanic.fps}
            fieldSize={mechanic.field.size}
            screenSize={FIELD_DEFAULTS.screenSize}
          />
        ))}
      </Field>

      {/* 詠唱バー */}
      {state.activeCasts.map((cast) => {
        const enemy = state.enemies.find((e) => e.id === cast.casterId);
        return (
          <CastBar
            key={cast.id}
            skillName={cast.skillName}
            progress={cast.progress}
            casterName={enemy?.name}
          />
        );
      })}

      {/* テキスト表示 */}
      {state.activeTexts.map((text) => {
        if (text.textType === 'main' && typeof text.content === 'string') {
          return (
            <ExplanationText
              key={text.id}
              text={text.content}
              position={text.position}
              opacity={text.opacity}
            />
          );
        } else if (text.textType === 'role' && Array.isArray(text.content)) {
          return (
            <RoleExplanation
              key={text.id}
              roleTexts={text.content as RoleText[]}
              position={text.position === 'center' ? 'bottom' : text.position}
              opacity={text.opacity}
            />
          );
        }
        return null;
      })}

      {/* タイムラインオーバーレイ */}
      <TimelineOverlay
        timeline={mechanic.timeline}
        currentFrame={frame}
        fps={mechanic.fps}
        title={mechanic.name}
      />

      {/* タイムラインバー */}
      <TimelineBar
        currentFrame={frame}
        totalFrames={mechanic.durationFrames}
        fps={mechanic.fps}
      />
    </div>
  );
};
