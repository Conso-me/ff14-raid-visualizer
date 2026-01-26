import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { TimelineRuler } from './timeline/TimelineRuler';
import { TimelineTracks } from './timeline/TimelineTracks';

const DEFAULT_PIXELS_PER_FRAME = 3;

export function TimelineEditor() {
  const {
    state,
    setCurrentFrame,
    togglePlay,
    updateTimelineEvent,
    deleteTimelineEvent,
  } = useEditor();

  const { mechanic, currentFrame, isPlaying } = state;

  const [pixelsPerFrame, setPixelsPerFrame] = useState(DEFAULT_PIXELS_PER_FRAME);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dragStartFrame, setDragStartFrame] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackContentRef = useRef<HTMLDivElement>(null);

  const totalWidth = mechanic.durationFrames * pixelsPerFrame;
  const currentSeconds = (currentFrame / mechanic.fps).toFixed(2);
  const totalSeconds = (mechanic.durationFrames / mechanic.fps).toFixed(2);

  // Auto-scroll to follow playhead
  useEffect(() => {
    if (isPlaying && trackContentRef.current) {
      const playheadPos = currentFrame * pixelsPerFrame;
      const viewportWidth = trackContentRef.current.clientWidth - 100; // Subtract label width
      const margin = viewportWidth * 0.2;

      if (playheadPos - scrollOffset > viewportWidth - margin) {
        setScrollOffset(playheadPos - viewportWidth + margin);
      } else if (playheadPos - scrollOffset < margin) {
        setScrollOffset(Math.max(0, playheadPos - margin));
      }
    }
  }, [currentFrame, isPlaying, pixelsPerFrame, scrollOffset]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollOffset(e.currentTarget.scrollLeft);
  }, []);

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (!trackContentRef.current) return;
      const rect = trackContentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollOffset - 100; // Subtract label width
      const frame = Math.max(0, Math.min(Math.round(x / pixelsPerFrame), mechanic.durationFrames - 1));
      setCurrentFrame(frame);
    },
    [pixelsPerFrame, scrollOffset, mechanic.durationFrames, setCurrentFrame]
  );

  const handleEventDragStart = useCallback(
    (e: React.MouseEvent, eventId: string) => {
      e.stopPropagation();
      const event = mechanic.timeline.find((ev) => ev.id === eventId);
      if (event) {
        setDraggedEventId(eventId);
        setDragStartFrame(event.frame);
      }
    },
    [mechanic.timeline]
  );

  useEffect(() => {
    if (!draggedEventId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackContentRef.current) return;
      const rect = trackContentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollOffset - 100;
      const newFrame = Math.max(0, Math.min(Math.round(x / pixelsPerFrame), mechanic.durationFrames - 1));

      updateTimelineEvent(draggedEventId, { frame: newFrame });
    };

    const handleMouseUp = () => {
      setDraggedEventId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedEventId, scrollOffset, pixelsPerFrame, mechanic.durationFrames, updateTimelineEvent]);

  const handleZoomIn = () => setPixelsPerFrame((p) => Math.min(p * 1.5, 20));
  const handleZoomOut = () => setPixelsPerFrame((p) => Math.max(p / 1.5, 0.5));

  const handleDeleteEvent = useCallback(() => {
    if (selectedEventId) {
      deleteTimelineEvent(selectedEventId);
      setSelectedEventId(null);
    }
  }, [selectedEventId, deleteTimelineEvent]);

  const playerIds = mechanic.initialPlayers.map((p) => p.id);
  const enemyIds = mechanic.enemies.map((e) => e.id);

  return (
    <div
      ref={containerRef}
      style={{
        height: '280px',
        background: '#12121f',
        borderTop: '1px solid #3a3a5a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          gap: '12px',
          background: '#1a1a2e',
          borderBottom: '1px solid #3a3a5a',
        }}
      >
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            padding: '6px 16px',
            background: isPlaying ? '#c73737' : '#2c9c3c',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '13px',
            cursor: 'pointer',
            minWidth: '80px',
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Frame slider */}
        <input
          type="range"
          min={0}
          max={mechanic.durationFrames - 1}
          value={currentFrame}
          onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
          style={{ flex: 1, maxWidth: '300px' }}
        />

        {/* Time display */}
        <span style={{ fontSize: '12px', color: '#888', minWidth: '140px' }}>
          Frame {currentFrame} | {currentSeconds}s / {totalSeconds}s
        </span>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
          <button
            onClick={handleZoomOut}
            style={{
              padding: '4px 8px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            -
          </button>
          <span style={{ fontSize: '11px', color: '#888', minWidth: '60px', textAlign: 'center' }}>
            {pixelsPerFrame.toFixed(1)}px/f
          </span>
          <button
            onClick={handleZoomIn}
            style={{
              padding: '4px 8px',
              background: '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>

        {/* Delete button */}
        {selectedEventId && (
          <button
            onClick={handleDeleteEvent}
            style={{
              padding: '6px 12px',
              background: '#c73737',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Delete Event
          </button>
        )}
      </div>

      {/* Timeline content */}
      <div
        ref={trackContentRef}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
        onScroll={handleScroll}
        onClick={handleTimelineClick}
      >
        {/* Ruler */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, marginLeft: '100px' }}>
          <TimelineRuler
            durationFrames={mechanic.durationFrames}
            fps={mechanic.fps}
            pixelsPerFrame={pixelsPerFrame}
            offset={scrollOffset}
          />
        </div>

        {/* Tracks */}
        <div style={{ minWidth: totalWidth + 100 }}>
          <TimelineTracks
            events={mechanic.timeline}
            playerIds={playerIds}
            enemyIds={enemyIds}
            pixelsPerFrame={pixelsPerFrame}
            offset={scrollOffset}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            onEventDragStart={handleEventDragStart}
          />
        </div>

        {/* Playhead */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 100 + currentFrame * pixelsPerFrame - scrollOffset,
            width: '2px',
            height: '100%',
            background: '#ff0000',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: '4px 12px',
          fontSize: '10px',
          color: '#666',
          background: '#1a1a2e',
          borderTop: '1px solid #2a2a4a',
        }}
      >
        Space: Play/Pause | Arrow keys: Step frames (Shift for 10) | Click timeline to seek | Drag events to move
      </div>
    </div>
  );
}
