import type { MechanicData, Player, Enemy, FieldMarker, TimelineEvent } from '../../data/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

function validatePlayer(player: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `initialPlayers[${index}]`;

  if (!player || typeof player !== 'object') {
    errors.push({ field: prefix, message: 'プレイヤーデータが不正です' });
    return errors;
  }

  const p = player as Record<string, unknown>;

  if (!p.id || typeof p.id !== 'string') {
    errors.push({ field: `${prefix}.id`, message: 'IDが必要です' });
  }
  if (!p.role || typeof p.role !== 'string') {
    errors.push({ field: `${prefix}.role`, message: 'ロールが必要です' });
  }
  if (!p.position || typeof p.position !== 'object') {
    errors.push({ field: `${prefix}.position`, message: '位置情報が必要です' });
  } else {
    const pos = p.position as Record<string, unknown>;
    if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      errors.push({ field: `${prefix}.position`, message: '位置座標(x, y)が必要です' });
    }
  }

  return errors;
}

function validateTimelineEvent(event: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const prefix = `timeline[${index}]`;

  if (!event || typeof event !== 'object') {
    errors.push({ field: prefix, message: 'イベントデータが不正です' });
    return errors;
  }

  const e = event as Record<string, unknown>;

  if (!e.id || typeof e.id !== 'string') {
    errors.push({ field: `${prefix}.id`, message: 'イベントIDが必要です' });
  }
  if (!e.type || typeof e.type !== 'string') {
    errors.push({ field: `${prefix}.type`, message: 'イベントタイプが必要です' });
  }
  if (typeof e.frame !== 'number' || e.frame < 0) {
    errors.push({ field: `${prefix}.frame`, message: 'フレーム番号が必要です (0以上)' });
  }

  return errors;
}

export function validateMechanic(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push({ field: 'root', message: 'データはオブジェクトである必要があります' });
    return { isValid: false, errors, warnings };
  }

  const mechanic = data as Record<string, unknown>;

  // Required string fields
  if (!mechanic.id || typeof mechanic.id !== 'string') {
    errors.push({ field: 'id', message: 'IDが必要です' });
  }
  if (!mechanic.name || typeof mechanic.name !== 'string') {
    errors.push({ field: 'name', message: '名前が必要です' });
  }

  // Required number fields
  if (typeof mechanic.durationFrames !== 'number' || mechanic.durationFrames <= 0) {
    errors.push({ field: 'durationFrames', message: 'durationFramesは正の数値が必要です' });
  }
  if (typeof mechanic.fps !== 'number' || mechanic.fps <= 0) {
    errors.push({ field: 'fps', message: 'fpsは正の数値が必要です' });
  }

  // Field validation
  if (!mechanic.field || typeof mechanic.field !== 'object') {
    errors.push({ field: 'field', message: 'フィールド設定が必要です' });
  } else {
    const field = mechanic.field as Record<string, unknown>;
    if (!field.type || typeof field.type !== 'string') {
      errors.push({ field: 'field.type', message: 'フィールドタイプが必要です' });
    }
    if (typeof field.size !== 'number' || field.size <= 0) {
      errors.push({ field: 'field.size', message: 'フィールドサイズは正の数値が必要です' });
    }
  }

  // Array fields (can be empty but must be arrays)
  if (!Array.isArray(mechanic.initialPlayers)) {
    errors.push({ field: 'initialPlayers', message: 'initialPlayersは配列が必要です' });
  } else {
    (mechanic.initialPlayers as unknown[]).forEach((player, index) => {
      errors.push(...validatePlayer(player, index));
    });
  }

  if (!Array.isArray(mechanic.timeline)) {
    errors.push({ field: 'timeline', message: 'timelineは配列が必要です' });
  } else {
    (mechanic.timeline as unknown[]).forEach((event, index) => {
      errors.push(...validateTimelineEvent(event, index));
    });
  }

  // Optional array fields - create if missing
  if (mechanic.markers !== undefined && !Array.isArray(mechanic.markers)) {
    errors.push({ field: 'markers', message: 'markersは配列が必要です' });
  }
  if (mechanic.enemies !== undefined && !Array.isArray(mechanic.enemies)) {
    errors.push({ field: 'enemies', message: 'enemiesは配列が必要です' });
  }

  // Warnings for optional but recommended fields
  if (!mechanic.description || typeof mechanic.description !== 'string') {
    warnings.push({ field: 'description', message: '説明がありません' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Sanitize mechanic data - fill in missing optional fields with defaults
export function sanitizeMechanic(data: Record<string, unknown>): MechanicData {
  return {
    id: String(data.id || `mechanic_${Date.now()}`),
    name: String(data.name || 'Imported Mechanic'),
    description: String(data.description || ''),
    durationFrames: Number(data.durationFrames) || 300,
    fps: Number(data.fps) || 30,
    field: {
      type: (data.field as any)?.type || 'circle',
      size: (data.field as any)?.size || 40,
      ...((data.field as any)?.width != null && { width: Number((data.field as any).width) }),
      ...((data.field as any)?.height != null && { height: Number((data.field as any).height) }),
      backgroundColor: (data.field as any)?.backgroundColor || '#1a1a3e',
      gridEnabled: (data.field as any)?.gridEnabled ?? true,
      ...((data.field as any)?.backgroundImage != null && { backgroundImage: String((data.field as any).backgroundImage) }),
      ...((data.field as any)?.backgroundOpacity != null && { backgroundOpacity: Number((data.field as any).backgroundOpacity) }),
    },
    markers: Array.isArray(data.markers) ? data.markers as FieldMarker[] : [],
    initialPlayers: Array.isArray(data.initialPlayers) ? data.initialPlayers as Player[] : [],
    enemies: Array.isArray(data.enemies) ? data.enemies as Enemy[] : [],
    timeline: Array.isArray(data.timeline) ? data.timeline as TimelineEvent[] : [],
  };
}
