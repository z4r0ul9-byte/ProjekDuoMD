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