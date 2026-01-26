import { useCallback } from 'react';
import type { Position } from '../../data/types';
import { gameToScreen, screenToGame } from '../../utils/coordinates';

interface UseFieldCoordinatesOptions {
  fieldSize: number;
  screenSize: number;
  zoom: number;
  gridSnap: boolean;
  gridSize?: number;
}

export function useFieldCoordinates({
  fieldSize,
  screenSize,
  zoom,
  gridSnap,
  gridSize = 0.5,
}: UseFieldCoordinatesOptions) {
  const toScreen = useCallback(
    (gamePos: Position): Position => {
      const screenPos = gameToScreen(gamePos, fieldSize, screenSize);
      return {
        x: screenPos.x * zoom,
        y: screenPos.y * zoom,
      };
    },
    [fieldSize, screenSize, zoom]
  );

  const toGame = useCallback(
    (screenPos: Position): Position => {
      const adjustedPos = {
        x: screenPos.x / zoom,
        y: screenPos.y / zoom,
      };
      const gamePos = screenToGame(adjustedPos, fieldSize, screenSize);

      if (gridSnap) {
        return {
          x: Math.round(gamePos.x / gridSize) * gridSize,
          y: Math.round(gamePos.y / gridSize) * gridSize,
        };
      }

      return gamePos;
    },
    [fieldSize, screenSize, zoom, gridSnap, gridSize]
  );

  const clampToField = useCallback(
    (gamePos: Position): Position => {
      const halfSize = fieldSize / 2;
      return {
        x: Math.max(-halfSize, Math.min(halfSize, gamePos.x)),
        y: Math.max(-halfSize, Math.min(halfSize, gamePos.y)),
      };
    },
    [fieldSize]
  );

  const toGameClamped = useCallback(
    (screenPos: Position): Position => {
      return clampToField(toGame(screenPos));
    },
    [toGame, clampToField]
  );

  return {
    toScreen,
    toGame,
    toGameClamped,
    clampToField,
  };
}
