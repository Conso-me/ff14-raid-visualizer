import React from 'react';

interface TimelineRulerProps {
  durationFrames: number;
  fps: number;
  pixelsPerFrame: number;
}

export function TimelineRuler({ durationFrames, fps, pixelsPerFrame }: TimelineRulerProps) {
  const duration = durationFrames / fps;
  const marks: { frame: number; label: string; major: boolean }[] = [];

  // Calculate tick interval based on zoom level
  let tickInterval = 1; // seconds
  if (pixelsPerFrame * fps < 30) tickInterval = 5;
  if (pixelsPerFrame * fps < 10) tickInterval = 10;
  if (pixelsPerFrame * fps > 100) tickInterval = 0.5;
  if (pixelsPerFrame * fps > 200) tickInterval = 0.25;

  for (let sec = 0; sec <= duration; sec += tickInterval) {
    const frame = Math.round(sec * fps);
    const isMajor = sec % (tickInterval >= 1 ? 1 : tickInterval * 4) === 0;
    marks.push({
      frame,
      label: isMajor ? `${sec.toFixed(sec % 1 === 0 ? 0 : 1)}s` : '',
      major: isMajor,
    });
  }

  return (
    <div
      style={{
        height: '24px',
        background: '#1a1a2e',
        borderBottom: '1px solid #3a3a5a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          display: 'flex',
          height: '100%',
        }}
      >
        {marks.map(({ frame, label, major }) => (
          <div
            key={frame}
            style={{
              position: 'absolute',
              left: frame * pixelsPerFrame,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '1px',
                height: major ? '10px' : '5px',
                background: major ? '#666' : '#444',
                marginTop: 'auto',
              }}
            />
            {label && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  fontSize: '10px',
                  color: '#888',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
