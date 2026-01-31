import type { MechanicData } from '../../data/types';

const SLOTS_KEY = 'ff14-raid-visualizer-slots';
const AUTO_SAVE_KEY = 'ff14-raid-visualizer-autosave';
const MAX_SLOTS = 5;

export interface SaveSlot {
  id: string;
  name: string;
  mechanic: MechanicData;
  savedAt: number;
  thumbnail?: string; // Base64 encoded thumbnail (optional)
}

export interface SaveSlotsData {
  slots: SaveSlot[];
  lastModified: number;
}

/**
 * Get all save slots
 */
export function getSaveSlots(): SaveSlot[] {
  try {
    const data = localStorage.getItem(SLOTS_KEY);
    if (data) {
      const parsed: SaveSlotsData = JSON.parse(data);
      return parsed.slots || [];
    }
  } catch (e) {
    console.error('Failed to load save slots:', e);
  }
  return [];
}

/**
 * Save mechanic to a slot
 */
export function saveToSlot(mechanic: MechanicData, name: string, thumbnail?: string): SaveSlot | null {
  try {
    const slots = getSaveSlots();
    
    // Create new slot
    const newSlot: SaveSlot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || `保存データ ${slots.length + 1}`,
      mechanic: mechanic,
      savedAt: Date.now(),
      thumbnail
    };
    
    // Add to beginning (newest first)
    slots.unshift(newSlot);
    
    // Limit to MAX_SLOTS
    if (slots.length > MAX_SLOTS) {
      slots.pop();
    }
    
    // Save to localStorage
    const data: SaveSlotsData = {
      slots,
      lastModified: Date.now()
    };
    localStorage.setItem(SLOTS_KEY, JSON.stringify(data));
    
    return newSlot;
  } catch (e) {
    console.error('Failed to save to slot:', e);
    return null;
  }
}

/**
 * Load mechanic from a slot
 */
export function loadFromSlot(slotId: string): MechanicData | null {
  try {
    const slots = getSaveSlots();
    const slot = slots.find(s => s.id === slotId);
    return slot?.mechanic || null;
  } catch (e) {
    console.error('Failed to load from slot:', e);
    return null;
  }
}

/**
 * Delete a slot
 */
export function deleteSlot(slotId: string): boolean {
  try {
    const slots = getSaveSlots();
    const filtered = slots.filter(s => s.id !== slotId);
    
    const data: SaveSlotsData = {
      slots: filtered,
      lastModified: Date.now()
    };
    localStorage.setItem(SLOTS_KEY, JSON.stringify(data));
    
    return true;
  } catch (e) {
    console.error('Failed to delete slot:', e);
    return false;
  }
}

/**
 * Rename a slot
 */
export function renameSlot(slotId: string, newName: string): boolean {
  try {
    const slots = getSaveSlots();
    const slot = slots.find(s => s.id === slotId);
    if (slot) {
      slot.name = newName;
      slot.savedAt = Date.now();
      
      const data: SaveSlotsData = {
        slots,
        lastModified: Date.now()
      };
      localStorage.setItem(SLOTS_KEY, JSON.stringify(data));
      return true;
    }
  } catch (e) {
    console.error('Failed to rename slot:', e);
  }
  return false;
}

/**
 * Clear all slots
 */
export function clearAllSlots(): void {
  try {
    localStorage.removeItem(SLOTS_KEY);
  } catch (e) {
    console.error('Failed to clear slots:', e);
  }
}

/**
 * Save current preview state (current frame)
 */
export function savePreviewState(
  mechanic: MechanicData, 
  currentFrame: number, 
  name: string,
  thumbnail?: string
): SaveSlot | null {
  // Create a snapshot at current frame
  const snapshotMechanic: MechanicData = {
    ...mechanic,
    // Store current frame info in description or as a special field
    description: `[フレーム ${currentFrame} で保存] ${mechanic.description || ''}`
  };
  
  return saveToSlot(snapshotMechanic, name, thumbnail);
}

// Legacy auto-save functions (for backward compatibility)
export function hasAutoSave(): boolean {
  return localStorage.getItem(AUTO_SAVE_KEY) !== null;
}

export function loadAutoSave(): MechanicData | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load auto-save:', e);
  }
  return null;
}

export function clearAutoSave(): void {
  localStorage.removeItem(AUTO_SAVE_KEY);
}

export function saveToAutoSave(mechanic: MechanicData): void {
  try {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(mechanic));
  } catch (e) {
    console.error('Failed to auto-save:', e);
  }
}


// Auto-save slot functions (dedicated slot for auto-save)
const AUTO_SAVE_SLOT_KEY = 'ff14-raid-visualizer-autosave-slot';

export function saveToAutoSaveSlot(mechanic: MechanicData): void {
  try {
    const slot: SaveSlot = {
      id: 'autosave',
      name: '自動保存データ',
      mechanic: mechanic,
      savedAt: Date.now()
    };
    localStorage.setItem(AUTO_SAVE_SLOT_KEY, JSON.stringify(slot));
  } catch (e) {
    console.error('Failed to save to auto-save slot:', e);
  }
}

export function loadFromAutoSaveSlot(): MechanicData | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_SLOT_KEY);
    if (saved) {
      const slot: SaveSlot = JSON.parse(saved);
      return slot.mechanic;
    }
  } catch (e) {
    console.error('Failed to load from auto-save slot:', e);
  }
  return null;
}

export function hasAutoSaveSlot(): boolean {
  return localStorage.getItem(AUTO_SAVE_SLOT_KEY) !== null;
}

export function clearAutoSaveSlot(): void {
  localStorage.removeItem(AUTO_SAVE_SLOT_KEY);
}
