// storage.js
const DEFAULT_SETTINGS = {
  apiKey: '',
  targetLanguage: 'English',
  stylePreset: 'santuy',
  customStylePrompt: '',
  level: 'beginner',
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem('linguaquest.settings');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (settings) => {
  try {
    localStorage.setItem('linguaquest.settings', JSON.stringify(settings));
  } catch(e) {}
};

// --- PROGRESS (XP, STREAK, & MISTAKES) ---
const DEFAULT_PROGRESS = {
  xp: 0,
  streak: 0,
  lastPlayedDate: '',
  todayXp: 0,
  mistakes: [] // <--- Array buat nyimpen soal yang salah
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
