import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { TimelineEvent, TimelineEventType, AoEType, AoESourceType, AoETrackingMode, Player, GimmickObject } from '../../data/types';

interface TimelineImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (events: Partial<TimelineEvent>[]) => void;
  fps: number;
  players: Player[];
}

interface ParsedImportEvent {
  time: number;
  name: string;
  type: TimelineEventType;
  rawData: Record<string, string | number>;
  phaseName?: string;
  // AoE関連フィールド
  aoeShape?: AoEType;
  aoeSource?: AoESourceType;
  aoeCount?: number;
  aoeDuration?: number;
  aoeColor?: string;
  aoeRadius?: number;
  aoeAngle?: number;
  aoeDirection?: number;
  aoeLength?: number;
  aoeWidth?: number;
  aoeInnerRadius?: number;
  aoeOuterRadius?: number;
  aoeTarget?: string; // 対象プレイヤーID（指定時）
  // オブジェクト関連フィールド
  objectShape?: GimmickObject['shape'];
  objectSize?: number;
  objectColor?: string;
  objectIcon?: string;
  objectX?: number;
  objectY?: number;
  objectDuration?: number;
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

const VALID_AOE_SHAPES: AoEType[] = ['circle', 'cone', 'line', 'donut', 'cross'];
const VALID_AOE_SOURCES: AoESourceType[] = ['fixed', 'boss', 'player', 'object'];

// プレイヤー自動割り振りの優先順位
const PLAYER_ASSIGN_ORDER = ['T1', 'T2', 'H1', 'H2', 'D1', 'D2', 'D3', 'D4'];

// 形状別デフォルトパラメータ（AoEDialogと同じロジック）
function getAoEDefaultParams(shape: AoEType): Record<string, number> {
  switch (shape) {
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

  // AoE関連カラムのインデックス検出
  const shapeIndex = headers.findIndex((h) => h === 'shape');
  const sourceIndex = headers.findIndex((h) => h === 'source');
  const countIndex = headers.findIndex((h) => h === 'count');
  const durationIndex = headers.findIndex((h) => h === 'duration');
  const colorIndex = headers.findIndex((h) => h === 'color');
  const radiusIndex = headers.findIndex((h) => h === 'radius');
  const angleIndex = headers.findIndex((h) => h === 'angle');
  const directionIndex = headers.findIndex((h) => h === 'direction');
  const lengthIndex = headers.findIndex((h) => h === 'length');
  const widthIndex = headers.findIndex((h) => h === 'width');
  const innerRadiusIndex = headers.findIndex((h) => h === 'inner_radius');
  const outerRadiusIndex = headers.findIndex((h) => h === 'outer_radius');
  const targetIndex = headers.findIndex((h) => h === 'target');

  // 安全に数値を抽出するヘルパー
  const parseOptionalNumber = (values: string[], index: number): number | undefined => {
    if (index === -1) return undefined;
    const str = values[index]?.trim();
    if (!str) return undefined;
    const num = parseFloat(str);
    return isNaN(num) ? undefined : num;
  };

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

    let type: TimelineEventType =
      typeStr && VALID_EVENT_TYPES.includes(typeStr as TimelineEventType)
        ? (typeStr as TimelineEventType)
        : 'text';

    // AoEフィールド検出: shapeカラムに有効な値があればaoe_showとして扱う（object系は除外）
    const shapeStr = shapeIndex !== -1 ? values[shapeIndex]?.trim() : undefined;
    const isObjectEvent = type === 'object_show' || type === 'object_hide';
    const isAoE = !isObjectEvent && typeof shapeStr === 'string' && VALID_AOE_SHAPES.includes(shapeStr as AoEType);

    if (isAoE) {
      type = 'aoe_show';
    }

    const rawData: Record<string, string | number> = {};
    headers.forEach((header, idx) => {
      if (values[idx]) {
        rawData[header] = values[idx].trim();
      }
    });
    rawData.time = seconds;

    const parsed: ParsedImportEvent = {
      time: seconds,
      name,
      type,
      rawData,
    };

    // AoEパラメータの抽出
    if (isAoE) {
      parsed.aoeShape = shapeStr as AoEType;

      const sourceStr = sourceIndex !== -1 ? values[sourceIndex]?.trim() : undefined;
      if (typeof sourceStr === 'string' && VALID_AOE_SOURCES.includes(sourceStr as AoESourceType)) {
        parsed.aoeSource = sourceStr as AoESourceType;
      }

      parsed.aoeCount = parseOptionalNumber(values, countIndex);
      parsed.aoeDuration = parseOptionalNumber(values, durationIndex);
      parsed.aoeRadius = parseOptionalNumber(values, radiusIndex);
      parsed.aoeAngle = parseOptionalNumber(values, angleIndex);
      parsed.aoeDirection = parseOptionalNumber(values, directionIndex);
      parsed.aoeLength = parseOptionalNumber(values, lengthIndex);
      parsed.aoeWidth = parseOptionalNumber(values, widthIndex);
      parsed.aoeInnerRadius = parseOptionalNumber(values, innerRadiusIndex);
      parsed.aoeOuterRadius = parseOptionalNumber(values, outerRadiusIndex);

      const colorStr = colorIndex !== -1 ? values[colorIndex]?.trim() : undefined;
      if (colorStr) parsed.aoeColor = colorStr;

      const targetStr = targetIndex !== -1 ? values[targetIndex]?.trim() : undefined;
      if (targetStr) parsed.aoeTarget = targetStr;
    }

    // オブジェクトパラメータの抽出
    if (type === 'object_show') {
      const validShapes: GimmickObject['shape'][] = ['circle', 'square', 'triangle', 'diamond'];
      if (typeof shapeStr === 'string' && validShapes.includes(shapeStr as GimmickObject['shape'])) {
        parsed.objectShape = shapeStr as GimmickObject['shape'];
      }
      const sizeIndex = headers.findIndex((h) => h === 'size');
      parsed.objectSize = parseOptionalNumber(values, sizeIndex);
      parsed.objectDuration = parseOptionalNumber(values, durationIndex);

      const colorStr = colorIndex !== -1 ? values[colorIndex]?.trim() : undefined;
      if (colorStr) parsed.objectColor = colorStr;

      const iconIndex = headers.findIndex((h) => h === 'icon');
      const iconStr = iconIndex !== -1 ? values[iconIndex]?.trim() : undefined;
      if (iconStr) parsed.objectIcon = iconStr;

      const xIndex = headers.findIndex((h) => h === 'x');
      const yIndex = headers.findIndex((h) => h === 'y');
      parsed.objectX = parseOptionalNumber(values, xIndex);
      parsed.objectY = parseOptionalNumber(values, yIndex);
    }

    events.push(parsed);
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
    let type: TimelineEventType =
      typeStr && VALID_EVENT_TYPES.includes(typeStr as TimelineEventType)
        ? (typeStr as TimelineEventType)
        : 'text';

    // AoEフィールド検出: shapeがあれば自動的にaoe_showとして扱う（ただしobject系は除外）
    const shapeValue = obj.shape as string | undefined;
    const isObjectEvent = type === 'object_show' || type === 'object_hide';
    const isAoE = !isObjectEvent && typeof shapeValue === 'string' && VALID_AOE_SHAPES.includes(shapeValue as AoEType);

    // shapeフィールドがあれば自動的にaoe_showに設定（object系を除く）
    if (isAoE) {
      type = 'aoe_show';
    }

    const parsed: ParsedImportEvent = {
      time: seconds,
      name: String(nameValue),
      type,
      rawData: obj as Record<string, string | number>,
    };

    // AoEパラメータの抽出
    if (isAoE) {
      parsed.aoeShape = shapeValue as AoEType;

      const sourceValue = obj.source as string | undefined;
      if (typeof sourceValue === 'string' && VALID_AOE_SOURCES.includes(sourceValue as AoESourceType)) {
        parsed.aoeSource = sourceValue as AoESourceType;
      }

      if (typeof obj.count === 'number' && obj.count > 0) parsed.aoeCount = obj.count;
      if (typeof obj.duration === 'number' && obj.duration > 0) parsed.aoeDuration = obj.duration;
      if (typeof obj.color === 'string') parsed.aoeColor = obj.color;
      if (typeof obj.radius === 'number') parsed.aoeRadius = obj.radius;
      if (typeof obj.angle === 'number') parsed.aoeAngle = obj.angle;
      if (typeof obj.direction === 'number') parsed.aoeDirection = obj.direction;
      if (typeof obj.length === 'number') parsed.aoeLength = obj.length;
      if (typeof obj.width === 'number') parsed.aoeWidth = obj.width;
      if (typeof obj.inner_radius === 'number') parsed.aoeInnerRadius = obj.inner_radius;
      if (typeof obj.outer_radius === 'number') parsed.aoeOuterRadius = obj.outer_radius;
      if (typeof obj.target === 'string' && obj.target) parsed.aoeTarget = obj.target;
    }

    // オブジェクトパラメータの抽出
    if (type === 'object_show') {
      const validShapes: GimmickObject['shape'][] = ['circle', 'square', 'triangle', 'diamond'];
      const objShape = obj.shape as string | undefined;
      if (typeof objShape === 'string' && validShapes.includes(objShape as GimmickObject['shape'])) {
        parsed.objectShape = objShape as GimmickObject['shape'];
      }
      if (typeof obj.size === 'number') parsed.objectSize = obj.size;
      if (typeof obj.color === 'string') parsed.objectColor = obj.color;
      if (typeof obj.icon === 'string') parsed.objectIcon = obj.icon;
      if (typeof obj.x === 'number') parsed.objectX = obj.x;
      if (typeof obj.y === 'number') parsed.objectY = obj.y;
      if (typeof obj.duration === 'number' && obj.duration > 0) parsed.objectDuration = obj.duration;
    }

    events.push(parsed);
  }

  return events;
}

// ソースタイプに応じた追従モードを決定
function getTrackingMode(sourceType?: AoESourceType): AoETrackingMode {
  if (sourceType === 'player' || sourceType === 'boss') return 'track_source';
  return 'static';
}

// 一意ID生成ヘルパー
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// プレイヤーロール名からプレイヤーIDを解決
// playerIds: 実際のプレイヤーID一覧（例: ["player_T1", "player_T2", ...]）
// playerIdMap: ロール名 → ID のマッピング
function resolvePlayerId(
  target: string,
  playerIdMap: Map<string, string>
): string | undefined {
  // そのままIDとしてマッチするか
  for (const [, id] of playerIdMap) {
    if (id === target) return id;
  }
  // ロール名（大文字小文字無視）でマッチするか
  const upper = target.toUpperCase();
  return playerIdMap.get(upper);
}

// Convert parsed events to TimelineEvent partials
function convertToTimelineEvents(
  events: ParsedImportEvent[],
  fps: number,
  playerIdMap: Map<string, string>
): Partial<TimelineEvent>[] {
  return events.flatMap((event) => {
    const frame = Math.round(event.time * fps);

    switch (event.type) {
      case 'text':
        return [{
          id: generateId('imported'),
          type: 'text' as const,
          frame,
          textType: 'main',
          content: event.name,
          position: 'center',
          duration: Math.round(3 * fps),
        } as Partial<TimelineEvent>];

      case 'cast':
        return [{
          id: generateId('imported'),
          type: 'cast' as const,
          frame,
          casterId: 'boss',
          skillName: event.name,
          duration: Math.round(3 * fps),
        } as Partial<TimelineEvent>];

      case 'aoe_show': {
        // AoEパラメータの構築
        const shape: AoEType = event.aoeShape || 'circle';
        const defaults = getAoEDefaultParams(shape);
        const count = event.aoeCount || 1;
        const durationSec = event.aoeDuration ?? 2;
        const durationFrames = Math.round(durationSec * fps);
        const sourceType: AoESourceType = event.aoeSource || 'fixed';
        const trackingMode = getTrackingMode(event.aoeSource);
        const color = event.aoeColor || '#ff6600';

        const results: Partial<TimelineEvent>[] = [];

        for (let i = 0; i < count; i++) {
          const aoeId = generateId('aoe');

          // プレイヤー対象の決定
          let sourceId: string | undefined;
          if (sourceType === 'player') {
            if (event.aoeTarget) {
              // 明示指定されている場合はそれを使う
              sourceId = resolvePlayerId(event.aoeTarget, playerIdMap);
            } else {
              // 未指定の場合はT1,T2,H1,H2,D1,D2,D3,D4の順に自動割り振り
              const roleKey = PLAYER_ASSIGN_ORDER[i % PLAYER_ASSIGN_ORDER.length];
              sourceId = playerIdMap.get(roleKey);
            }
          }

          // 形状別パラメータ（インポート値 > デフォルト値）
          const aoeParams: Record<string, unknown> = {};
          if (shape === 'circle') {
            aoeParams.radius = event.aoeRadius ?? defaults.radius;
          } else if (shape === 'cone') {
            aoeParams.angle = event.aoeAngle ?? defaults.angle;
            aoeParams.direction = event.aoeDirection ?? defaults.direction;
            aoeParams.length = event.aoeLength ?? defaults.length;
          } else if (shape === 'line') {
            aoeParams.width = event.aoeWidth ?? defaults.width;
            aoeParams.length = event.aoeLength ?? defaults.length;
            aoeParams.direction = event.aoeDirection ?? defaults.direction;
          } else if (shape === 'donut') {
            aoeParams.innerRadius = event.aoeInnerRadius ?? defaults.innerRadius;
            aoeParams.outerRadius = event.aoeOuterRadius ?? defaults.outerRadius;
          } else if (shape === 'cross') {
            aoeParams.width = event.aoeWidth ?? defaults.width;
            aoeParams.length = event.aoeLength ?? defaults.length;
          }

          // aoe_show イベント
          results.push({
            id: generateId('imported'),
            type: 'aoe_show' as const,
            frame,
            fadeInDuration: 10,
            aoe: {
              id: aoeId,
              type: shape,
              position: { x: 0, y: 0 },
              color,
              opacity: 0.5,
              sourceType,
              sourceId,
              trackingMode,
              ...aoeParams,
            },
          } as Partial<TimelineEvent>);

          // aoe_hide イベント（duration分後）
          results.push({
            id: generateId('imported'),
            type: 'aoe_hide' as const,
            frame: frame + durationFrames,
            aoeId,
            fadeOutDuration: 15,
          } as Partial<TimelineEvent>);
        }

        return results;
      }

      case 'debuff_add':
        return [{
          id: generateId('imported'),
          type: 'debuff_add' as const,
          frame,
          targetId: 'all',
          debuff: {
            id: generateId('debuff'),
            name: event.name,
            duration: 10,
            startFrame: frame,
          },
        } as Partial<TimelineEvent>];

      case 'object_show': {
        const objectId = generateId('obj');
        const durationSec = event.objectDuration ?? 5;
        const durationFrames = Math.round(durationSec * fps);

        const results: Partial<TimelineEvent>[] = [];

        results.push({
          id: generateId('imported'),
          type: 'object_show' as const,
          frame,
          fadeInDuration: 10,
          object: {
            id: objectId,
            name: event.name,
            position: { x: event.objectX ?? 0, y: event.objectY ?? 0 },
            shape: event.objectShape ?? 'circle',
            size: event.objectSize ?? 2,
            color: event.objectColor ?? '#ffcc00',
            icon: event.objectIcon,
            opacity: 1,
          },
        } as Partial<TimelineEvent>);

        // object_hide イベント（duration分後）
        results.push({
          id: generateId('imported'),
          type: 'object_hide' as const,
          frame: frame + durationFrames,
          objectId,
          fadeOutDuration: 15,
        } as Partial<TimelineEvent>);

        return results;
      }

      default:
        return [{
          id: generateId('imported'),
          type: event.type,
          frame,
          textType: 'main',
          content: event.name,
          position: 'center',
          duration: Math.round(3 * fps),
        } as Partial<TimelineEvent>];
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

const structuredPlaceholder = `CSV (AoE付き):
time,name,shape,radius,source,count,duration
01:30,ギガフレア,circle,3,player,8,2
02:00,ブレス,cone,,boss,,,120,25

JSON (AoE付き):
[{"time":"01:30","name":"ギガフレア","shape":"circle","radius":3,"source":"player","count":8,"duration":2}]`;

export function TimelineImportDialog({
  isOpen,
  onClose,
  onImport,
  fps,
  players,
}: TimelineImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [parsedEvents, setParsedEvents] = useState<ParsedImportEvent[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<ImportFormat>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('text');

  // ロール名 → プレイヤーID のマッピング構築
  const playerIdMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const player of players) {
      map.set(player.role, player.id);
    }
    return map;
  }, [players]);

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

    const timelineEvents = convertToTimelineEvents(parsedEvents, fps, playerIdMap);
    onImport(timelineEvents);
    handleClose();
  }, [parsedEvents, fps, playerIdMap, onImport, handleClose]);

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
      field_change: 'Background Change',
      field_revert: 'Background Revert',
    };
    return labels[type] || type;
  }, []);

  // AoE情報のサマリーテキスト生成
  const formatAoEInfo = useCallback((event: ParsedImportEvent): string | null => {
    if (!event.aoeShape) return null;
    const parts: string[] = [event.aoeShape];
    if (event.aoeSource && event.aoeSource !== 'fixed') parts.push(event.aoeSource);
    if (event.aoeCount && event.aoeCount > 1) parts.push(`x${event.aoeCount}`);
    return parts.join(' / ');
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

  // 実際に生成されるイベント数（AoEのshow+hideペア × count を考慮）
  const totalGeneratedEvents = useMemo(() => {
    return parsedEvents.reduce((total, event) => {
      if (event.type === 'aoe_show') {
        const count = event.aoeCount || 1;
        return total + count * 2; // show + hide ペア
      }
      return total + 1;
    }, 0);
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
            <strong style={{ color: '#fff' }}>対応フォーマット:</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li>
                <strong>CSV/TSV:</strong> time, name は必須。shape カラムがあればAoEとして自動認識
              </li>
              <li>
                <strong>JSON:</strong> {'{'} time, name {'}'} の配列。shape フィールドでAoE自動認識
              </li>
              <li>
                <strong>AoEフィールド:</strong> shape, radius, angle, length, width, source, count, duration, color
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
            検出フォーマット: <strong>{formatDisplay}</strong> ({parsedEvents.length}件
            {totalGeneratedEvents !== parsedEvents.length && ` → ${totalGeneratedEvents}イベント生成`})
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
                プレビュー ({parsedEvents.length}件{totalGeneratedEvents !== parsedEvents.length ? ` → ${totalGeneratedEvents}イベント生成` : ''})
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
                              <td style={{ padding: '8px 12px' }}>
                                {event.name}
                                {event.aoeShape && (
                                  <span
                                    style={{
                                      marginLeft: '8px',
                                      padding: '1px 6px',
                                      background: '#3a5a3a',
                                      borderRadius: '3px',
                                      fontSize: '10px',
                                      color: '#88ff88',
                                    }}
                                  >
                                    {formatAoEInfo(event)}
                                  </span>
                                )}
                              </td>
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
                          <td style={{ padding: '8px 12px' }}>
                            {event.name}
                            {event.aoeShape && (
                              <span
                                style={{
                                  marginLeft: '8px',
                                  padding: '1px 6px',
                                  background: '#3a5a3a',
                                  borderRadius: '3px',
                                  fontSize: '10px',
                                  color: '#88ff88',
                                }}
                              >
                                {formatAoEInfo(event)}
                              </span>
                            )}
                          </td>
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
                Import {totalGeneratedEvents} Events
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TimelineImportDialog;
