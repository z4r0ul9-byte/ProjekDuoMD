/**
 * Thin wrapper around localStorage. Single namespace so we can clear it
 * in one call, and defensive JSON parsing so a corrupted entry doesn't
 * brick the app.
 */

import {
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  type Progress,
  type Settings,
} from '@/types';

const NS = 'linguaquest.v1';
const SETTINGS_KEY = `${NS}.settings`;
const PROGRESS_KEY = `${NS}.progress`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or disabled — swallow. The app still works
    // in-memory for the current session.
  }
}

// ── Settings ────────────────────────────────────────────────────────────

export function loadSettings(): Settings {
  return read<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): void {
  write(SETTINGS_KEY, settings);
}

// ── Progress ────────────────────────────────────────────────────────────

export function loadProgress(): Progress {
  return read<Progress>(PROGRESS_KEY, DEFAULT_PROGRESS);
}

export function saveProgress(progress: Progress): void {
  write(PROGRESS_KEY, progress);
}

// ── Utilities ───────────────────────────────────────────────────────────

/** Wipe all LinguaQuest data. Used by the "Reset progress" button. */
export function clearAll(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // ignore
  }
}

/** YYYY-MM-DD in the user's local timezone. */
export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
