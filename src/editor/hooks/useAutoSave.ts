import { useEffect, useRef } from 'react';
import type { MechanicData } from '../../data/types';

const STORAGE_KEY = 'ff14-raid-visualizer-autosave';
const SAVE_INTERVAL = 5000; // 5 seconds

/**
 * Auto-save mechanic data to localStorage
 */
export function useAutoSave(mechanic: MechanicData) {
  const lastSaveRef = useRef<string>('');

  // Periodic save
  useEffect(() => {
    const interval = setInterval(() => {
      const json = JSON.stringify(mechanic);

      // Only save if changed
      if (json !== lastSaveRef.current) {
        localStorage.setItem(STORAGE_KEY, json);
        lastSaveRef.current = json;
        console.log('Auto-saved');
      }
    }, SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [mechanic]);

  // Save on change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const json = JSON.stringify(mechanic);
      if (json !== lastSaveRef.current) {
        localStorage.setItem(STORAGE_KEY, json);
        lastSaveRef.current = json;
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [mechanic]);
}

/**
 * Load saved data from localStorage
 */
export function loadAutoSave(): MechanicData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load auto-save:', e);
  }
  return null;
}

/**
 * Clear auto-save data
 */
export function clearAutoSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if auto-save data exists
 */
export function hasAutoSave(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
