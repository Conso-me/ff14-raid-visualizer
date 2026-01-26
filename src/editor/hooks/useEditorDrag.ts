import { useState, useCallback, useRef, useEffect } from 'react';
import type { Position } from '../../data/types';

interface DragState {
  isDragging: boolean;
  startPos: Position | null;
  currentPos: Position | null;
  objectId: string | null;
  objectType: string | null;
}

interface UseDragOptions {
  onDragStart?: (id: string, type: string, pos: Position) => void;
  onDrag?: (id: string, type: string, pos: Position, delta: Position) => void;
  onDragEnd?: (id: string, type: string, pos: Position) => void;
  toGameCoords: (screenPos: Position) => Position;
}

export function useEditorDrag({ onDragStart, onDrag, onDragEnd, toGameCoords }: UseDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPos: null,
    currentPos: null,
    objectId: null,
    objectType: null,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const getRelativePos = useCallback(
    (e: MouseEvent | React.MouseEvent): Position => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const startDrag = useCallback(
    (e: React.MouseEvent, objectId: string, objectType: string) => {
      e.preventDefault();
      e.stopPropagation();

      const screenPos = getRelativePos(e);
      const gamePos = toGameCoords(screenPos);

      setDragState({
        isDragging: true,
        startPos: gamePos,
        currentPos: gamePos,
        objectId,
        objectType,
      });

      onDragStart?.(objectId, objectType, gamePos);
    },
    [getRelativePos, toGameCoords, onDragStart]
  );

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const screenPos = getRelativePos(e);
      const gamePos = toGameCoords(screenPos);

      setDragState((prev) => ({
        ...prev,
        currentPos: gamePos,
      }));

      if (dragState.objectId && dragState.objectType && dragState.startPos) {
        const delta = {
          x: gamePos.x - dragState.startPos.x,
          y: gamePos.y - dragState.startPos.y,
        };
        onDrag?.(dragState.objectId, dragState.objectType, gamePos, delta);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const screenPos = getRelativePos(e);
      const gamePos = toGameCoords(screenPos);

      if (dragState.objectId && dragState.objectType) {
        onDragEnd?.(dragState.objectId, dragState.objectType, gamePos);
      }

      setDragState({
        isDragging: false,
        startPos: null,
        currentPos: null,
        objectId: null,
        objectType: null,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, dragState.objectId, dragState.objectType, dragState.startPos, getRelativePos, toGameCoords, onDrag, onDragEnd]);

  return {
    containerRef,
    dragState,
    startDrag,
    isDragging: dragState.isDragging,
  };
}
