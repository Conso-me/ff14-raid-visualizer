import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { TimelineEvent, TimelineEventType } from '../../data/types';

interface TimelineImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (events: Partial<TimelineEvent>[]) => void;
  fps: number;
}

interface ParsedImportEvent {
  time: number;
  name: string;
  type: TimelineEventType;
  rawData: Record<string, string | number>;
  phaseName?: string;
}

type ImportFormat = 'csv' | 'tsv' | 'json' | 'text' | null;
type InputMode = 'text' | 'structured';

const VALID_EVENT_TYPES: TimelineEventType[] = [
  'text',
  'cast',
  'aoe_show',
  'debuff_add',
  'aoe_hide',
  'debuff_remove',
  'move',
  'boss_move',
  'text_show',
  'text_hide',
  'object_show',
  'object_hide',
];

// Parse MM:SS format to seconds
function parseTimeToSeconds(timeStr: string): number | null {
  const mmssMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (mmssMatch) {
    const minutes = parseInt(mmssMatch[1], 10);
    const seconds = parseInt(mmssMatch[2], 10);
    if (seconds < 60) {
      return minutes * 60 + seconds;
    }
  }

  const secondsNum = parseFloat(timeStr);
  if (!isNaN(secondsNum) && secondsNum >= 0) {
    return secondsNum;
  }

  return null;
}

// Parse text format with phase groups
function parseTextFormat(content: string): ParsedImportEvent[] {
  const lines = content.split('\n');
  const events: ParsedImportEvent[] = [];
  let currentPhase: string | undefined;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    const timestampMatch = trimmedLine.match(/^(\d{1,2}:\d{2})\s+(.+)$/);

    if (timestampMatch) {
      const timeStr = timestampMatch[1];
      const name = timestampMatch[2].trim();
      const seconds = parseTimeToSeconds(timeStr);

      if (seconds !== null) {
        events.push({
          time: seconds,
          name,
          type: 'text',
          rawData: { time: seconds, name },
          phaseName: currentPhase,
        });
      }
    } else {
      currentPhase = trimmedLine;
    }
  }

  return events;
}

// Detect file format from content and filename
function detectFormat(content: string, filename?: string): ImportFormat {
  const trimmed = content.trim();

  if (filename) {
    const lowerName = filename.toLowerCase();
    if (lowerName.endsWith('.json')) return 'json';
    if (lowerName.endsWith('.csv')) return 'csv';
    if (lowerName.endsWith('.tsv')) return 'tsv';
  }

  const lines = trimmed.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.match(/^\d{1,2}:\d{2}\s+/)) {
      return 'text';
    }
  }

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // Not valid JSON, continue detection
    }
  }

  const firstLine = trimmed.split('\n')[0];
  if (firstLine.includes('\t')) {
    return 'tsv';
  }

  if (firstLine.includes(',')) {
    return 'csv';
  }

  return null;
}

// Parse CSV/TSV content
function parseDelimited(
  content: string,
  delimiter: ',' | '\t'
): ParsedImportEvent[] {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());
  const events: ParsedImportEvent[] = [];

  const timeIndex = headers.findIndex(
    (h) => h === 'time' || h === 'timestamp' || h === 't'
  );
  const nameIndex = headers.findIndex(
    (h) => h === 'name' || h === 'event' || h === 'title' || h === 'text'
  );
  const typeIndex = headers.findIndex(
    (h) => h === 'type' || h === 'event_type' || h === 'kind'
  );

  if (timeIndex === -1 || nameIndex === -1) {
    throw new Error(
      `Missing required columns. Found: ${headers.join(', ')}. Need at least 'time' and 'name' columns.`
    );
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(delimiter);
    const timeStr = values[timeIndex]?.trim();
    const name = values[nameIndex]?.trim();
    const typeStr = typeIndex !== -1 ? values[typeIndex]?.trim() : undefined;

    if (!timeStr || !name) continue;

    const seconds = parseTimeToSeconds(timeStr);
    if (seconds === null) {
      console.warn(`Invalid time format: ${timeStr}`);
      continue;
    }

    const type: TimelineEventType =
      typeStr && VALID_EVENT_TYPES.includes(typeStr as TimelineEventType)
        ? (typeStr as TimelineEventType)
        : 'text';

    const rawData: Record<string, string | number> = {};
    headers.forEach((header, idx) => {
      if (values[idx]) {
        rawData[header] = values[idx].trim();
      }
    });
    rawData.time = seconds;

    events.push({
      time: seconds,
      name,
      type,
      rawData,
    });
  }

  return events;
}

// Parse JSON content
function parseJSON(content: string): ParsedImportEvent[] {
  const trimmed = content.trim();
  let data: unknown;

  try {
    data = JSON.parse(trimmed);
  } catch (err) {
    throw new Error(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array of event objects');
  }

  const events: ParsedImportEvent[] = [];

  for (const item of data) {
    if (typeof item !== 'object' || item === null) {
      console.warn('Skipping non-object item in JSON array');
      continue;
    }

    const obj = item as Record<string, unknown>;

    const timeValue = obj.time ?? obj.timestamp ?? obj.t;
    const nameValue = obj.name ?? obj.event ?? obj.title ?? obj.text;
    const typeValue = obj.type ?? obj.event_type ?? obj.kind;

    if (timeValue === undefined || nameValue === undefined) {
      console.warn('Skipping item missing time or name:', obj);
      continue;
    }

    let seconds: number | null = null;
    if (typeof timeValue === 'string') {
      seconds = parseTimeToSeconds(timeValue);
    } else if (typeof timeValue === 'number') {
      seconds = timeValue;
    }

    if (seconds === null) {
      console.warn(`Invalid time format: ${timeValue}`);
      continue;
    }

    const typeStr = typeof typeValue === 'string' ? typeValue : undefined;
    const type: TimelineEventType =
      typeStr && VALID_EVENT_TYPES.includes(typeStr as TimelineEventType)
        ? (typeStr as TimelineEventType)
        : 'text';

    events.push({
      time: seconds,
      name: String(nameValue),
      type,
      rawData: obj as Record<string, string | number>,
    });
  }

  return events;
}

// Convert parsed events to TimelineEvent partials
function convertToTimelineEvents(
  events: ParsedImportEvent[],
  fps: number
): Partial<TimelineEvent>[] {
  return events.map((event) => {
    const frame = Math.round(event.time * fps);

    const base = {
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: event.type,
      frame,
    };

    switch (event.type) {
      case 'text':
        return {
          ...base,
          textType: 'main',
          content: event.name,
          position: 'center',
          duration: Math.round(3 * fps),
        } as Partial<TimelineEvent>;

      case 'cast':
        return {
          ...base,
          casterId: 'boss',
          skillName: event.name,
          duration: Math.round(3 * fps),
        } as Partial<TimelineEvent>;

      case 'aoe_show':
        return {
          ...base,
          aoe: {
            id: `aoe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'circle',
            position: { x: 0, y: 0 },
            radius: 5,
          },
        } as Partial<TimelineEvent>;

      case 'debuff_add':
        return {
          ...base,
          targetId: 'all',
          debuff: {
            id: `debuff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: event.name,
            duration: 10,
            startFrame: frame,
          },
        } as Partial<TimelineEvent>;

      default:
        return {
          ...base,
          textType: 'main',
          content: event.name,
          position: 'center',
          duration: Math.round(3 * fps),
        } as Partial<TimelineEvent>;
    }
  });
}

const textPlaceholder = `ヴェナスリーチ (移動開始)
01:19 細胞落着
01:21 細胞落着
01:23 細胞落着

細胞付着・中期
02:00 細胞付着・中期
02:03 AA`;

const structuredPlaceholder = `CSV Example:
time,name,type
00:10,AoE,circle
00:20,Debuff,debuff_add

JSON Example:
[{"time":"00:10","name":"AoE","type":"aoe_show"}]`;

export function TimelineImportDialog({
  isOpen,
  onClose,
  onImport,
  fps,
}: TimelineImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [parsedEvents, setParsedEvents] = useState<ParsedImportEvent[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<ImportFormat>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('text');

  const resetState = useCallback(() => {
    setInputText('');
    setParsedEvents([]);
    setParseError(null);
    setDetectedFormat(null);
    setShowPreview(false);
    setInputMode('text');
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const parseContent = useCallback(
    (content: string, filename?: string) => {
      setParseError(null);
      setDetectedFormat(null);

      try {
        const format = detectFormat(content, filename);
        setDetectedFormat(format);

        let events: ParsedImportEvent[] = [];

        if (format === 'json') {
          events = parseJSON(content);
        } else if (format === 'csv') {
          events = parseDelimited(content, ',');
        } else if (format === 'tsv') {
          events = parseDelimited(content, '\t');
        } else if (format === 'text') {
          events = parseTextFormat(content);
        } else {
          if (inputMode === 'text') {
            events = parseTextFormat(content);
          } else {
            setParseError('Unable to detect format. Please ensure the file is CSV, TSV, or JSON.');
            setParsedEvents([]);
            setShowPreview(false);
            return;
          }
        }

        if (events.length === 0) {
          setParseError('No valid events found in the content.');
          setShowPreview(false);
        } else {
          events.sort((a, b) => a.time - b.time);
          setParsedEvents(events);
          setShowPreview(true);
        }
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse content');
        setParsedEvents([]);
        setShowPreview(false);
      }
    },
    [inputMode]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseContent(text, file.name);
      };
      reader.onerror = () => {
        setParseError('Failed to read file');
      };
      reader.readAsText(file);

      e.target.value = '';
    },
    [parseContent]
  );

  const handleTextParse = useCallback(() => {
    if (!inputText.trim()) {
      setParseError('Please paste content or select a file');
      return;
    }
    parseContent(inputText);
  }, [inputText, parseContent]);

  const handleImport = useCallback(() => {
    if (parsedEvents.length === 0) return;

    const timelineEvents = convertToTimelineEvents(parsedEvents, fps);
    onImport(timelineEvents);
    handleClose();
  }, [parsedEvents, fps, onImport, handleClose]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatTypeLabel = useCallback((type: TimelineEventType): string => {
    const labels: Record<TimelineEventType, string> = {
      text: 'Text',
      cast: 'Cast',
      aoe_show: 'AoE',
      debuff_add: 'Debuff',
      aoe_hide: 'AoE Hide',
      debuff_remove: 'Debuff Remove',
      move: 'Move',
      boss_move: 'Boss Move',
      text_show: 'Text Show',
      text_hide: 'Text Hide',
      object_show: 'Object',
      object_hide: 'Object Hide',
    };
    return labels[type] || type;
  }, []);

  const formatDisplay = useMemo(() => {
    if (!detectedFormat) return '';
    const labels: Record<'csv' | 'tsv' | 'json' | 'text', string> = {
      csv: 'CSV',
      tsv: 'TSV',
      json: 'JSON',
      text: 'テキスト形式',
    };
    return labels[detectedFormat] || '';
  }, [detectedFormat]);

  const groupedEvents = useMemo(() => {
    const groups: { phaseName?: string; events: ParsedImportEvent[] }[] = [];
    let currentGroup: { phaseName?: string; events: ParsedImportEvent[] } | null = null;

    for (const event of parsedEvents) {
      if (!currentGroup || currentGroup.phaseName !== event.phaseName) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = { phaseName: event.phaseName, events: [event] };
      } else {
        currentGroup.events.push(event);
      }
    }

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [parsedEvents]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '8px',
          border: '1px solid #3a3a5a',
          padding: '24px',
          width: '650px',
          maxHeight: '85vh',
          overflow: 'auto',
          color: '#fff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px' }}>Import Timeline Events</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Format Toggle */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <button
            onClick={() => setInputMode('text')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: inputMode === 'text' ? '#3753c7' : '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: inputMode === 'text' ? 'bold' : 'normal',
            }}
          >
            テキスト形式
          </button>
          <button
            onClick={() => setInputMode('structured')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: inputMode === 'structured' ? '#3753c7' : '#2a2a4a',
              border: '1px solid #3a3a5a',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: inputMode === 'structured' ? 'bold' : 'normal',
            }}
          >
            CSV/TSV/JSON
          </button>
        </div>

        {/* Format Info */}
        {inputMode === 'text' ? (
          <div
            style={{
              padding: '12px',
              background: '#2a2a4a',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#aaa',
            }}
          >
            <strong style={{ color: '#fff' }}>テキスト形式の書き方:</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li><strong>フェーズ名:</strong> タイムスタンプがない行はフェーズ名になります</li>
              <li><strong>イベント:</strong> MM:SS 形式で時刻を付けた行がイベントになります</li>
              <li><strong>空行:</strong> フェーズを区切るために使用します</li>
            </ul>
          </div>
        ) : (
          <div
            style={{
              padding: '12px',
              background: '#2a2a4a',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#aaa',
            }}
          >
            <strong style={{ color: '#fff' }}>Supported Formats:</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li>
                <strong>CSV/TSV:</strong> Columns: time (MM:SS or seconds), name/event, type
                (optional)
              </li>
              <li>
                <strong>JSON:</strong> Array of {'{'} time, name, type {'}'} objects
              </li>
            </ul>
          </div>
        )}

        {/* Error Display */}
        {parseError && (
          <div
            style={{
              padding: '12px',
              background: '#4a2a2a',
              border: '1px solid #6a3a3a',
              borderRadius: '4px',
              marginBottom: '16px',
              color: '#ff8888',
            }}
          >
            {parseError}
          </div>
        )}

        {/* Detected Format */}
        {detectedFormat && (
          <div
            style={{
              padding: '8px 12px',
              background: '#2a4a3a',
              border: '1px solid #3a5a4a',
              borderRadius: '4px',
              marginBottom: '16px',
              color: '#88ff88',
              fontSize: '13px',
            }}
          >
            Detected format: <strong>{formatDisplay}</strong> ({parsedEvents.length} events)
          </div>
        )}

        {!showPreview ? (
          <>
            {/* File Upload */}
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '10px 16px',
                  background: '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  width: '100%',
                }}
              >
                {inputMode === 'text'
                  ? 'Choose File (.txt)'
                  : 'Choose File (CSV, TSV, or JSON)'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={inputMode === 'text' ? '.txt' : '.csv,.tsv,.json,.txt'}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '16px', color: '#666', textAlign: 'center' }}>
              — or paste content below —
            </div>

            {/* Text Input */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={inputMode === 'text' ? textPlaceholder : structuredPlaceholder}
              style={{
                width: '100%',
                height: '200px',
                padding: '12px',
                background: '#2a2a4a',
                border: '1px solid #3a3a5a',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'monospace',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />

            {/* Parse Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={handleTextParse}
                style={{
                  padding: '10px 20px',
                  background: '#3753c7',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Parse Content
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Preview Table */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#aaa' }}>
                Preview ({parsedEvents.length} events)
              </h3>
              <div
                style={{
                  maxHeight: '350px',
                  overflow: 'auto',
                  background: '#12121f',
                  border: '1px solid #2a2a4a',
                  borderRadius: '4px',
                }}
              >
                {inputMode === 'text' && groupedEvents.length > 0 ? (
                  groupedEvents.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {group.phaseName && (
                        <div
                          style={{
                            padding: '8px 12px',
                            background: '#1a2a4a',
                            borderBottom: '1px solid #3a3a5a',
                            color: '#88aaff',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                        >
                          {group.phaseName}
                        </div>
                      )}
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '13px',
                        }}
                      >
                        <tbody>
                          {group.events.map((event, index) => (
                            <tr
                              key={index}
                              style={{
                                borderBottom: '1px solid #2a2a4a',
                              }}
                            >
                              <td
                                style={{
                                  padding: '8px 12px',
                                  color: '#88aaff',
                                  width: '70px',
                                }}
                              >
                                {formatTime(event.time)}
                              </td>
                              <td style={{ padding: '8px 12px' }}>{event.name}</td>
                              <td style={{ padding: '8px 12px', width: '80px' }}>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    background:
                                      event.type === 'text'
                                        ? '#3a4a6a'
                                        : event.type === 'cast'
                                          ? '#6a4a3a'
                                          : event.type === 'aoe_show'
                                            ? '#4a6a3a'
                                            : event.type === 'debuff_add'
                                              ? '#6a3a4a'
                                              : '#3a3a5a',
                                    borderRadius: '3px',
                                    fontSize: '11px',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {formatTypeLabel(event.type)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#1a1a2e' }}>
                      <tr>
                        <th
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            borderBottom: '1px solid #3a3a5a',
                            color: '#888',
                            fontWeight: 'normal',
                          }}
                        >
                          Time
                        </th>
                        <th
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            borderBottom: '1px solid #3a3a5a',
                            color: '#888',
                            fontWeight: 'normal',
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            borderBottom: '1px solid #3a3a5a',
                            color: '#888',
                            fontWeight: 'normal',
                          }}
                        >
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedEvents.map((event, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #2a2a4a' }}>
                          <td style={{ padding: '8px 12px', color: '#88aaff' }}>
                            {formatTime(event.time)}
                          </td>
                          <td style={{ padding: '8px 12px' }}>{event.name}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                background:
                                  event.type === 'text'
                                    ? '#3a4a6a'
                                    : event.type === 'cast'
                                      ? '#6a4a3a'
                                      : event.type === 'aoe_show'
                                        ? '#4a6a3a'
                                        : event.type === 'debuff_add'
                                          ? '#6a3a4a'
                                          : '#3a3a5a',
                                borderRadius: '3px',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {formatTypeLabel(event.type)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Type Legend */}
            <div
              style={{
                padding: '12px',
                background: '#1a1a2e',
                borderRadius: '4px',
                marginBottom: '20px',
                fontSize: '11px',
                color: '#888',
              }}
            >
              <strong>Event Types:</strong>{' '}
              <span style={{ color: '#88aaff' }}>Text</span>,{' '}
              <span style={{ color: '#ffaa66' }}>Cast</span>,{' '}
              <span style={{ color: '#88ff88' }}>AoE</span>,{' '}
              <span style={{ color: '#ff6688' }}>Debuff</span>, and more...
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setParsedEvents([]);
                  setDetectedFormat(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#2a2a4a',
                  border: '1px solid #3a3a5a',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Back
              </button>
              <button
                onClick={handleImport}
                style={{
                  padding: '10px 24px',
                  background: '#3753c7',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Import {parsedEvents.length} Events
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TimelineImportDialog;
