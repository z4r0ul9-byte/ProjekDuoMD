// storage.js
const DEFAULT_SETTINGS = {
  apiKey: '',
  targetLanguage: 'English',
  stylePreset: 'santuy',
  customStylePrompt: '',
  level: 'beginner',
  customAssets: {
    mascot: '🦉',
    achievements: {}
  },
  // FITUR BARU: Memory Bank
  memoryBank: []
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem('linguaquest.settings');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { 
      ...DEFAULT_SETTINGS, 
      ...parsed, 
      customAssets: { ...DEFAULT_SETTINGS.customAssets, ...(parsed.customAssets || {}) },
      memoryBank: parsed.memoryBank || []
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings) => {
  try {
    localStorage.setItem('linguaquest.settings', JSON.stringify(settings));
  } catch(e) {}
};

const DEFAULT_PROGRESS = {
  xp: 0, streak: 0, lastPlayedDate: '', todayXp: 0, mistakes: [],
  sessionsCompleted: 0, healedMistakes: 0, unlockedAchievements: []
};

const loadProgress = () => {
  try {
    const raw = localStorage.getItem('linguaquest.progress');
    return raw ? { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } : DEFAULT_PROGRESS;
  } catch { return DEFAULT_PROGRESS; }
};

const saveProgress = (progress) => {
  try { localStorage.setItem('linguaquest.progress', JSON.stringify(progress)); } catch(e) {}
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
