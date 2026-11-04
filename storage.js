// storage.js
const DEFAULT_SETTINGS = {
  apiKey: '',
  targetLanguage: 'English',
  stylePreset: 'santuy',
  customStylePrompt: '',
  level: 'beginner',
  // FITUR BARU: Custom Assets
  customAssets: {
    mascot: '🦉', // Default emoji
    achievements: {} // Key-value buat nyimpen custom icon medali
  }
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem('linguaquest.settings');
    // Pake spread operator buat mastiin kalau customAssets tetep ada meskipun data lama
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw), customAssets: { ...DEFAULT_SETTINGS.customAssets, ...(JSON.parse(raw).customAssets || {}) } } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings) => {
  try {
    localStorage.setItem('linguaquest.settings', JSON.stringify(settings));
  } catch(e) {}
};

// --- PROGRESS (XP, STREAK, & MISTAKES & ACHIEVEMENTS) ---
const DEFAULT_PROGRESS = {
  xp: 0,
  streak: 0,
  lastPlayedDate: '',
  todayXp: 0,
  mistakes: [],
  // FITUR BARU
  sessionsCompleted: 0,
  healedMistakes: 0,
  unlockedAchievements: []
};

const loadProgress = () => {
  try {
    const raw = localStorage.getItem('linguaquest.progress');
    return raw ? { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
};

const saveProgress = (progress) => {
  try {
    localStorage.setItem('linguaquest.progress', JSON.stringify(progress));
  } catch(e) {}
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
