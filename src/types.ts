/**
 * All shared type definitions. Keep this file the single source of truth
 * so the rest of the app can never disagree on shapes.
 */

// ── Settings ────────────────────────────────────────────────────────────

export type StylePreset =
  | 'gaul'
  | 'formal'
  | 'santuy'
  | 'storyteller'
  | 'custom';

export type CefrLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Settings {
  /** User-supplied Gemini API key. Stored only in localStorage. */
  apiKey: string;

  /** Target language, e.g. "Japanese", "English", "Korean". */
  targetLanguage: string;

  /** Language used for questions / explanations. Default "Indonesian". */
  nativeLanguage: string;

  /** Teaching style preset. */
  stylePreset: StylePreset;

  /**
   * Free-text style prompt used when `stylePreset === 'custom'`.
   * Ignored otherwise.
   */
  customStylePrompt: string;

  /** Difficulty tier passed into the Gemini prompt. */
  level: CefrLevel;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  targetLanguage: 'English',
  nativeLanguage: 'Indonesian',
  stylePreset: 'santuy',
  customStylePrompt: '',
  level: 'beginner',
};

// ── Progress ────────────────────────────────────────────────────────────

export interface Progress {
  /** Total XP ever earned. */
  xp: number;

  /** Consecutive days with at least one lesson. */
  streak: number;

  /** ISO date (YYYY-MM-DD) of the last completed lesson. */
  lastPlayedDate: string;

  /** XP earned today (resets at midnight local time). */
  todayXp: number;

  /** Count of individual exercises answered (right or wrong). */
  totalExercises: number;

  /** Count of finished 5-question lessons. */
  sessionsCompleted: number;
}

export const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  streak: 0,
  lastPlayedDate: '',
  todayXp: 0,
  totalExercises: 0,
  sessionsCompleted: 0,
};

// ── Exercise ────────────────────────────────────────────────────────────

export type ExerciseType = 'translate' | 'fill-blank' | 'grammar' | 'listening';

export interface Exercise {
  /** Stable id (uuid-ish), generated client-side after fetch. */
  id: string;

  type: ExerciseType;

  /**
   * The question shown to the user.
   * - translate: the source sentence in nativeLanguage
   * - fill-blank: sentence in targetLanguage with "___" placeholder
   * - grammar: a question about grammar rules in nativeLanguage
   * - listening: sentence in targetLanguage that will be spoken via TTS
   */
  question: string;

  /** Optional extra prompt / instruction (e.g. "Translate to Japanese"). */
  prompt?: string;

  /**
   * Four multiple-choice options (for grammar / listening).
   * For translate / fill-blank, this is omitted and the user types.
   */
  options?: string[];

  /** The correct answer (string matching one option, or expected free-text). */
  correctAnswer: string;

  /** Why the answer is correct — in the chosen teaching style. */
  explanation: string;

  /** Text that TTS should read for listening exercises. */
  audioText?: string;
}

/**
 * Raw shape returned by Gemini — no `id` yet. We add the id client-side
 * so that the schema in prompt.ts stays simple.
 */
export type RawExercise = Omit<Exercise, 'id'>;

// ── Misc ────────────────────────────────────────────────────────────────

export type View = 'onboarding' | 'home' | 'lesson' | 'settings';
