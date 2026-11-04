// app.js
let state = {
  view: 'loading',
  settings: loadSettings(),
  progress: loadProgress(),
  exercises: [],
  currentIndex: 0,
  correctCount: 0,
  loading: false,
  error: '',
  isAnswered: false,
  isCorrect: false,
  typedAnswer: '',
  selectedOption: null,
  logs: [], 
  showLogs: false,
  customTopic: '',
  isReviewMode: false,
  settingsTab: 'general', // 'general' | 'custom' | 'memory'
  mascotState: 'idle',
  mascotSpeech: null,
  showAchievementPopup: null,
  // State form memori
  memoryInput: ''
};

const appDiv = document.getElementById('app');

const ACHIEVEMENTS = [
  { id: 'first_step', title: 'First Step', desc: 'Selesaikan 1 sesi', icon: '🥇' },
  { id: 'perfect', title: 'Perfect!', desc: 'Dapat 5/5', icon: '💯' },
  { id: 'streak_7', title: 'On Fire', desc: 'Streak 7 hari', icon: '🔥' },
  { id: 'xp_1000', title: 'Bookworm', desc: '1000 XP', icon: '📚' },
  { id: 'healer', title: 'Healer', desc: 'Pulihkan 5 salah', icon: '🩹' },
  { id: 'master', title: 'Master', desc: '5000 XP', icon: '👑' }
];

const MOTIVATIONS = [
  "Semangat belajarnya! 🔥", "Jangan lupa istirahat ya 💤", "Wah makin jago aja! 🌟",
  "Konsisten itu kuncinya 💪", "Ayo taklukkan hari ini! 🚀", "Salah itu tandanya belajar 🤓"
];

window.addLog = (msg, type = 'info') => {
  const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
  state.logs.push({ time, msg, type });
  if (state.logs.length > 100) state.logs.shift(); 
  if (state.showLogs) renderLogModal();
};

function init() {
  const today = getTodayString();
  if (state.progress.lastPlayedDate !== today) state.progress.todayXp = 0;
  if (state.settings.apiKey) state.view = 'home';
  else state.view = 'onboarding';
  
  if(!document.getElementById('floatingLogBtn')) initFloatingLogBtn(); 
  initMascotDOM();
  render();
}

function render() {
  appDiv.innerHTML = '';
  if (state.view === 'onboarding' || state.view === 'settings') renderOnboarding();
  else if (state.view === 'home') renderHome();
  else if (state.view === 'lesson') renderLesson();
  else if (state.view === 'summary') renderSummary();
  
  updateMascotVisuals();
}

// --- LOG TERMINAL ---
function initFloatingLogBtn() {
  const btn = document.createElement('button');
  btn.id = 'floatingLogBtn';
  btn.className = 'fixed top-4 left-4 z-40 bg-white/80 backdrop-blur border-2 border-slate-200 p-2.5 rounded-xl text-slate-500 shadow-sm hover:text-accent transition-all active:scale-95';
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;
  btn.onclick = () => { state.showLogs = true; renderLogModal(); };
  document.body.appendChild(btn);
}

function renderLogModal() {
  let modal = document.getElementById('logModal');
  if (!state.showLogs) { if (modal) modal.remove(); return; }
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'logModal';
    modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-4 sm:p-6 animate-slide-up';
    modal.onclick = (e) => { if (e.target === modal) { state.showLogs = false; renderLogModal(); } };
    document.body.appendChild(modal);
  }
  
  let logHtml = state.logs.map(l => {
    let color = 'text-slate-300';
    if (l.type === 'success') color = 'text-green-400';
    if (l.type === 'error') color = 'text-red-400';
    if (l.type === 'accent') color = 'text-indigo-400';
    return `<div class="mb-1.5 leading-relaxed"><span class="text-slate-500">[${l.time}]</span> <span class="${color}">${l.msg}</span></div>`;
  }).join('');
  if (state.logs.length === 0) logHtml = '<div class="text-slate-500 italic text-center mt-4">Belum ada aktivitas...</div>';

  modal.innerHTML = `
    <div class="bg-[#0d1117] rounded-2xl border border-slate-700 w-full max-w-lg mx-auto overflow-hidden shadow-2xl flex flex-col max-h-[70vh]">
      <div class="flex justify-between items-center px-4 py-3 bg-[#161b22] border-b border-slate-700">
        <h3 class="text-white font-mono font-bold text-sm flex items-center gap-2">LinguaQuest Terminal</h3>
        <button id="btnCloseLog" class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
      </div>
      <div class="p-4 overflow-y-auto font-mono text-xs flex-1">${logHtml}</div>
    </div>
  `;
  document.getElementById('btnCloseLog').onclick = () => { state.showLogs = false; renderLogModal(); };
}

// --- MASCOT GLOBAL LOGIC ---
function initMascotDOM() {
  if (document.getElementById('mascotContainer')) return;
  
  const container = document.createElement('div');
  container.id = 'mascotContainer';
  container.className = 'fixed top-20 right-4 z-40 cursor-pointer flex flex-col items-center transition-all duration-300';
  container.onclick = handleMascotClick;
  
  container.innerHTML = `
    <div id="mascotBubble" class="hidden absolute -top-14 right-0 bg-white border-2 border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap z-50">
      <div class="absolute -bottom-2 right-4 w-3 h-3 bg-white border-b-2 border-r-2 border-slate-200 transform rotate-45"></div>
      <span id="mascotText"></span>
    </div>
    <div id="mascotAvatar" class="w-16 h-16 flex items-center justify-center text-5xl drop-shadow-lg">
      🦉
    </div>
  `;
  document.body.appendChild(container);
}

function updateMascotVisuals() {
  const avatar = document.getElementById('mascotAvatar');
  if (!avatar) return;
  
  const asset = state.settings.customAssets?.mascot || '🦉';
  
  avatar.className = 'w-16 h-16 flex items-center justify-center text-5xl drop-shadow-lg';
  
  if (asset.startsWith('http') && (asset.includes('.mp4') || asset.includes('.webm'))) {
    if(avatar.tagName !== 'VIDEO') {
      avatar.innerHTML = `<video src="${asset}" autoplay loop muted playsinline class="w-full h-full object-contain rounded-xl"></video>`;
    }
  } else if (asset.startsWith('http') || asset.startsWith('data:image')) {
    if(avatar.tagName !== 'IMG') {
      avatar.innerHTML = `<img src="${asset}" class="w-full h-full object-contain" />`;
    }
  } else {
    if(avatar.tagName !== 'DIV') avatar.innerHTML = '';
    avatar.innerText = asset;
  }

  if (state.mascotState === 'idle') avatar.classList.add('mascot-idle');
  else if (state.mascotState === 'thinking') avatar.classList.add('mascot-thinking');
  else if (state.mascotState === 'success') avatar.classList.add('mascot-success');
  else if (state.mascotState === 'fail') avatar.classList.add('mascot-fail');
  else if (state.mascotState === 'wink') avatar.classList.add('mascot-wink');
  
  const bubble = document.getElementById('mascotBubble');
  const text = document.getElementById('mascotText');
  if (state.mascotSpeech) {
    text.innerText = state.mascotSpeech;
    bubble.classList.remove('hidden');
  } else {
    bubble.classList.add('hidden');
  }
}

function triggerMascot(stateName) {
  state.mascotState = stateName;
  updateMascotVisuals();
  
  if (stateName !== 'idle' && stateName !== 'thinking') {
    setTimeout(() => {
      state.mascotState = 'idle';
      updateMascotVisuals();
    }, 1500);
  }
}

function handleMascotClick() {
  if (state.mascotState === 'thinking') return;
  const randomMsg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
  state.mascotSpeech = randomMsg;
  updateMascotVisuals();
  setTimeout(() => {
    state.mascotSpeech = null;
    updateMascotVisuals();
  }, 3000);
}

// --- ACHIEVEMENTS LOGIC ---
function checkAchievements(correctCount, totalCount) {
  let newlyUnlocked = [];

  ACHIEVEMENTS.forEach(ach => {
    if (state.progress.unlockedAchievements.includes(ach.id)) return; 
    
    let unlocked = false;
    if (ach.id === 'first_step' && state.progress.sessionsCompleted >= 1) unlocked = true;
    if (ach.id === 'perfect' && correctCount === totalCount) unlocked = true;
    if (ach.id === 'streak_7' && state.progress.streak >= 7) unlocked = true;
    if (ach.id === 'xp_1000' && state.progress.xp >= 1000) unlocked = true;
    if (ach.id === 'healer' && state.progress.healedMistakes >= 5) unlocked = true;
    if (ach.id === 'master' && state.progress.xp >= 5000) unlocked = true;
    
    if (unlocked) {
      state.progress.unlockedAchievements.push(ach.id);
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveProgress(state.progress);
    showAchievementPopupQueue = newlyUnlocked;
    renderAchievementPopup();
  }
}

let showAchievementPopupQueue = [];
function renderAchievementPopup() {
  let popup = document.getElementById('achPopup');
  if (showAchievementPopupQueue.length === 0) {
    if (popup) popup.remove();
    return;
  }
  
  const ach = showAchievementPopupQueue[0];
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'achPopup';
    popup.className = 'fixed inset-0 z-[60] bg-black/70 backdrop-blur flex items-center justify-center p-4 animate-pop';
    document.body.appendChild(popup);
  }
  
  const customIcon = state.settings.customAssets?.achievements?.[ach.id];
  let iconHtml = `<span class="text-6xl">${ach.icon}</span>`;
  if (customIcon) {
    if (customIcon.startsWith('http') || customIcon.startsWith('data:image')) {
       iconHtml = `<img src="${customIcon}" class="w-24 h-24 object-contain" />`;
    } else {
       iconHtml = `<span class="text-6xl">${customIcon}</span>`;
    }
  }

  popup.innerHTML = `
    <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div class="absolute top-4 left-4 text-3xl animate-bounce">🎉</div>
        <div class="absolute top-10 right-4 text-2xl animate-ping">✨</div>
      </div>
      
      <h2 class="text-sm font-black text-accent tracking-widest uppercase mb-4">Achievement Unlocked!</h2>
      <div class="w-32 h-32 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 border-4 border-yellow-200 shadow-inner">
        ${iconHtml}
      </div>
      <h3 class="text-2xl font-black text-slate-800 mb-1">${ach.title}</h3>
      <p class="text-slate-500 font-medium mb-6">${ach.desc}</p>
      
      <button id="btnCloseAch" class="w-full btn-3d bg-accent border-accent-dark text-white font-black text-lg py-3 rounded-xl">KEREN!</button>
    </div>
  `;
  
  document.getElementById('btnCloseAch').onclick = () => {
    showAchievementPopupQueue.shift();
    renderAchievementPopup();
  };
}

function updateStreak() {
  const today = getTodayString();
  const lastPlayed = state.progress.lastPlayedDate;
  if (lastPlayed !== today) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
    if (lastPlayed === yesterdayStr) state.progress.streak += 1;
    else state.progress.streak = 1;
    state.progress.lastPlayedDate = today;
  }
  saveProgress(state.progress);
}

// --- ONBOARDING / SETTINGS ---
function renderOnboarding() {
  let generalContent = `
    <div class="animate-slide-in-right">
      <form id="settingsForm" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Gemini API Key</label>
          <input type="password" id="apiKey" required value="${state.settings.apiKey}" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Bahasa</label>
            <select id="targetLanguage" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-accent">
              <option ${state.settings.targetLanguage === 'English' ? 'selected' : ''}>English</option>
              <option ${state.settings.targetLanguage === 'Japanese' ? 'selected' : ''}>Japanese</option>
              <option ${state.settings.targetLanguage === 'Korean' ? 'selected' : ''}>Korean</option>
              <option ${state.settings.targetLanguage === 'Spanish' ? 'selected' : ''}>Spanish</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Gaya</label>
            <select id="stylePreset" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-accent">
              <option value="santuy" ${state.settings.stylePreset === 'santuy' ? 'selected' : ''}>Santuy</option>
              <option value="gaul" ${state.settings.stylePreset === 'gaul' ? 'selected' : ''}>Gaul</option>
              <option value="formal" ${state.settings.stylePreset === 'formal' ? 'selected' : ''}>Formal</option>
              <option value="custom" ${state.settings.stylePreset === 'custom' ? 'selected' : ''}>Custom</option>
            </select>
          </div>
        </div>
        <div id="customStyleContainer" class="${state.settings.stylePreset === 'custom' ? 'block' : 'hidden'}">
          <input type="text" id="customStylePrompt" value="${state.settings.customStylePrompt}" placeholder="Misal: Pakai bahasa anak Jaksel..." class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-accent" />
        </div>
        <button type="submit" class="w-full btn-3d bg-accent hover:bg-indigo-600 border-accent-dark text-white font-extrabold text-lg py-3 rounded-2xl mt-4">Simpan</button>
      </form>
    </div>
  `;

  let customContent = `
    <div class="animate-slide-in-right space-y-6">
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label class="block text-sm font-bold text-slate-800 mb-2">Tampilan Maskot</label>
        <div class="flex gap-2 mb-3">
          <input type="text" id="mascotUrl" placeholder="Tempel URL (GIF/MP4/PNG)" value="${state.settings.customAssets.mascot.startsWith('http') ? state.settings.customAssets.mascot : ''}" class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <button type="button" onclick="applyMascotAsset(document.getElementById('mascotUrl').value)" class="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold">Set</button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500">Atau Upload (Max 1MB):</span>
          <input type="file" id="mascotFile" accept="image/png, image/jpeg, image/gif" class="text-xs" onchange="handleFileUpload(event, 'mascot')" />
        </div>
        <div class="mt-2 flex gap-2">
           <button onclick="applyMascotAsset('🦉')" class="text-2xl hover:scale-110 transition">🦉</button>
           <button onclick="applyMascotAsset('🐱')" class="text-2xl hover:scale-110 transition">🐱</button>
           <button onclick="applyMascotAsset('🐶')" class="text-2xl hover:scale-110 transition">🐶</button>
           <button onclick="applyMascotAsset('🐉')" class="text-2xl hover:scale-110 transition">🐉</button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-800 mb-2">Icon Medali (Opsional)</label>
        <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
          ${ACHIEVEMENTS.map(a => `
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
              <span class="text-xl">${a.icon}</span>
              <div class="flex-1">
                <p class="text-[10px] font-bold text-slate-600 truncate">${a.title}</p>
                <input type="text" placeholder="URL Gif/PNG" class="w-full text-[10px] px-1 py-0.5 border border-slate-300 rounded mt-1" value="${state.settings.customAssets?.achievements?.[a.id]?.startsWith('http') ? state.settings.customAssets.achievements[a.id] : ''}" onchange="applyAchievementAsset('${a.id}', this.value)" />
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <button id="btnSaveCustom" class="w-full btn-3d bg-accent hover:bg-indigo-600 border-accent-dark text-white font-extrabold text-lg py-3 rounded-2xl">Simpan Kustomisasi</button>
    </div>
  `;

  // UI MEMORY BANK
  let memoryContent = `
    <div class="animate-slide-in-right space-y-4">
      <p class="text-sm text-slate-600 mb-2">Kasih tahu AI tentang diri lu (hobi, tujuan, hal yang disuka). AI bakal pakai info ini buat bikin contoh kalimat yang personal!</p>
      
      <div class="flex gap-2">
        <input type="text" id="memoryInput" value="${state.memoryInput}" placeholder="Misal: Gw suka anime One Piece..." class="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" onkeydown="if(event.key==='Enter') window.addMemory()" />
        <button onclick="window.addMemory()" class="bg-accent text-white font-bold px-4 rounded-xl shadow-md btn-3d border-accent-dark">+</button>
      </div>

      <div class="space-y-2 max-h-56 overflow-y-auto pr-1" id="memoryList">
        ${(state.settings.memoryBank || []).length === 0 ? '<p class="text-center text-slate-400 text-sm italic py-4">Belum ada memori tersimpan.</p>' : ''}
        ${(state.settings.memoryBank || []).map((mem, idx) => `
          <div class="bg-slate-50 border border-slate-200 p-3 rounded-xl flex justify-between items-start gap-3 animate-slide-in-right" style="animation-delay: ${idx * 50}ms">
            <p class="text-sm text-slate-700 font-medium flex-1">${mem}</p>
            <button onclick="window.deleteMemory(${idx})" class="text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-md p-1 transition-colors">&times;</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  appDiv.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-4 pt-16">
      <div class="animate-slide-up max-w-md w-full bg-white rounded-3xl shadow-premium border border-slate-100 p-6 sm:p-8">
        
        <div class="text-center mb-6">
          <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">${state.view === 'onboarding' ? 'Selamat Datang' : 'Pengaturan'}</h1>
        </div>

        <!-- TABS -->
        ${state.view === 'settings' ? `
          <div class="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button id="tabGeneral" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all ${state.settingsTab === 'general' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}">Umum</button>
            <button id="tabCustom" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all ${state.settingsTab === 'custom' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}">Kustom</button>
            <button id="tabMemory" class="flex-1 py-2 text-xs font-bold rounded-lg transition-all ${state.settingsTab === 'memory' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}">Memori</button>
          </div>
        ` : ''}

        ${state.settingsTab === 'general' || state.view === 'onboarding' ? generalContent : ''}
        ${state.settingsTab === 'custom' ? customContent : ''}
        ${state.settingsTab === 'memory' ? memoryContent : ''}
        
        ${state.view === 'settings' ? `
          <div class="text-center mt-6">
             <button id="btnBackHome" class="text-sm font-bold text-slate-400 hover:text-slate-700">Kembali ke Beranda</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  if (state.view === 'settings') {
    document.getElementById('tabGeneral').addEventListener('click', () => { state.settingsTab = 'general'; render(); });
    document.getElementById('tabCustom').addEventListener('click', () => { state.settingsTab = 'custom'; render(); });
    document.getElementById('tabMemory').addEventListener('click', () => { state.settingsTab = 'memory'; render(); });
    document.getElementById('btnBackHome').addEventListener('click', () => { state.view = 'home'; render(); });

    if (state.settingsTab === 'custom') {
      document.getElementById('btnSaveCustom').addEventListener('click', () => {
        saveSettings(state.settings);
        alert('Kustomisasi tersimpan!');
        state.view = 'home'; render();
      });
      return; 
    }
    if (state.settingsTab === 'memory') {
      return; // Form ditangani sama fungsi global addMemory
    }
  }

  document.getElementById('stylePreset').addEventListener('change', (e) => {
    document.getElementById('customStyleContainer').classList.toggle('hidden', e.target.value !== 'custom');
  });

  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings = {
      ...state.settings,
      apiKey: document.getElementById('apiKey').value,
      targetLanguage: document.getElementById('targetLanguage').value,
      stylePreset: document.getElementById('stylePreset').value,
      customStylePrompt: document.getElementById('customStylePrompt') ? document.getElementById('customStylePrompt').value : '',
    };
    saveSettings(state.settings);
    state.view = 'home'; render();
  });
}

// GLOBAL FUNCTIONS UNTUK MEMORY
window.addMemory = () => {
  const input = document.getElementById('memoryInput');
  if (!input || !input.value.trim()) return;
  
  state.settings.memoryBank.push(input.value.trim());
  saveSettings(state.settings);
  state.memoryInput = ''; // Reset input
  
  // Animasi Mascot Wink!
  triggerMascot('wink');
  
  render(); // Re-render tab memory
};

window.deleteMemory = (idx) => {
  state.settings.memoryBank.splice(idx, 1);
  saveSettings(state.settings);
  render();
};

window.applyMascotAsset = (val) => {
  if (val.trim() === '') return;
  state.settings.customAssets.mascot = val;
  saveSettings(state.settings);
  updateMascotVisuals(); 
};

window.applyAchievementAsset = (id, val) => {
  if (val.trim() !== '') {
    state.settings.customAssets.achievements[id] = val;
  } else {
    delete state.settings.customAssets.achievements[id];
  }
  saveSettings(state.settings);
};

window.handleFileUpload = (e, type) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) { alert("File kegedean! Maksimal 1MB."); return; }
  
  const reader = new FileReader();
  reader.onload = (ev) => {
    if (type === 'mascot') {
      state.settings.customAssets.mascot = ev.target.result;
      saveSettings(state.settings);
      updateMascotVisuals();
      alert('Maskot berhasil diupload!');
    }
  };
  reader.readAsDataURL(file);
};

// --- HOME SCREEN ---
function renderHome() {
  if (state.progress.lastPlayedDate !== getTodayString()) state.progress.todayXp = 0;
  const hasMistakes = state.progress.mistakes && state.progress.mistakes.length > 0;
  
  const medaliHtml = ACHIEVEMENTS.map(ach => {
    const isUnlocked = state.progress.unlockedAchievements.includes(ach.id);
    const customIcon = state.settings.customAssets?.achievements?.[ach.id];
    
    let iconHtml = isUnlocked ? `<span class="text-3xl">${ach.icon}</span>` : `<span class="text-3xl opacity-30 grayscale">${ach.icon}</span>`;
    if (isUnlocked && customIcon) {
      if (customIcon.startsWith('http') || customIcon.startsWith('data:image')) {
        iconHtml = `<img src="${customIcon}" class="w-10 h-10 object-contain drop-shadow-sm" />`;
      } else {
        iconHtml = `<span class="text-3xl">${customIcon}</span>`;
      }
    }

    return `
      <div class="flex-shrink-0 w-20 flex flex-col items-center">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mb-1 ${isUnlocked ? 'bg-yellow-50 border-2 border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-slate-100 border-2 border-slate-200'}">
          ${iconHtml}
        </div>
        <p class="text-[10px] font-bold text-center leading-tight ${isUnlocked ? 'text-slate-700' : 'text-slate-400'}">${ach.title}</p>
      </div>
    `;
  }).join('');

  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-5 max-w-md mx-auto w-full pb-8 pt-16">
      
      <div class="flex gap-3 mb-6">
        <div class="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <svg width="20" height="20" class="text-orange-500 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-4 4-4 9 0 2.5 1.5 4.5 3 5.5V19h2v-2.5c1.5-1 3-3 3-5.5 0-5-4-9-4-9zm0 15c-1.5 0-3-1.5-3-3 0-2 2-4.5 3-5.5 1 1 3 3.5 3 5.5 0 1.5-1.5 3-3 3z"/></svg>
          <p class="text-[10px] text-slate-400 font-extrabold uppercase">Streak</p>
          <p class="text-lg font-black text-slate-800 leading-none">${state.progress.streak}</p>
        </div>
        <div class="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <svg width="20" height="20" class="text-yellow-500 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <p class="text-[10px] text-slate-400 font-extrabold uppercase">Total XP</p>
          <p class="text-lg font-black text-slate-800 leading-none">${state.progress.xp}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
        <label class="block text-sm font-bold text-slate-700 mb-2">Mau belajar apa hari ini?</label>
        <input type="text" id="topicInput" value="${state.customTopic}" placeholder="Misal: Makanan, Past Tense..." class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent mb-3" />
        <button id="btnStartCustom" class="w-full btn-3d btn-pulse bg-accent hover:bg-indigo-600 border-accent-dark text-white font-black text-lg py-3 rounded-xl">
          MULAI BELAJAR
        </button>
      </div>

      ${hasMistakes ? `
        <div class="bg-red-50 rounded-2xl p-4 shadow-sm border-2 border-red-100 mb-6 animate-slide-up">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-red-200 text-red-600 p-2 rounded-lg"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
            <div>
              <h3 class="font-bold text-slate-800">Smart Review</h3>
              <p class="text-xs text-slate-500">${state.progress.mistakes.length} kesalahan tercatat</p>
            </div>
          </div>
          <button id="btnReview" class="w-full btn-3d bg-red-500 hover:bg-red-600 border-red-700 text-white font-black text-md py-2.5 rounded-xl">
            PERBAIKI KESALAHAN
          </button>
        </div>
      ` : ''}

      <div class="mt-2 mb-8">
        <h3 class="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-3">Pencapaian</h3>
        <div class="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          ${medaliHtml}
        </div>
      </div>

      <div class="text-center mt-auto pt-4">
        <button id="btnSettings" class="text-sm font-bold text-slate-400 hover:text-slate-700">⚙️ Pengaturan</button>
      </div>
    </div>
  `;

  document.getElementById('btnStartCustom').addEventListener('click', () => {
    state.customTopic = document.getElementById('topicInput').value;
    state.isReviewMode = false;
    state.view = 'lesson'; state.exercises = []; state.currentIndex = 0; state.correctCount = 0; state.error = ''; render();
  });

  if(hasMistakes) {
    document.getElementById('btnReview').addEventListener('click', () => {
      state.isReviewMode = true;
      state.view = 'lesson'; state.exercises = []; state.currentIndex = 0; state.correctCount = 0; state.error = ''; render();
    });
  }
  document.getElementById('btnSettings').addEventListener('click', () => { state.view = 'settings'; state.settingsTab = 'general'; render(); });
}

// --- LESSON SCREEN ---
function renderLesson() {
  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-5 pt-16 min-h-screen max-w-lg mx-auto w-full">
      <div class="flex items-center justify-between mb-4">
        <button id="btnBack" class="text-slate-400 hover:text-slate-700 p-2 -ml-2 rounded-full bg-slate-200/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        ${state.isReviewMode ? `<span class="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Smart Review</span>` : 
          (state.customTopic ? `<span class="bg-indigo-100 text-accent text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest truncate max-w-[200px]">Topik: ${state.customTopic}</span>` : '')}
      </div>
      <div id="lessonContent" class="flex-1 flex flex-col justify-start pb-12"></div>
    </div>
  `;
  document.getElementById('btnBack').addEventListener('click', () => { 
    state.view = 'home'; triggerMascot('idle'); render(); 
  });
  renderLessonContent();
}

function renderLessonContent() {
  const contentDiv = document.getElementById('lessonContent');
  if (!contentDiv) return;

  if (!state.exercises.length && !state.loading) {
    contentDiv.innerHTML = `
      <div class="text-center mt-10">
        ${state.error ? `<div class="bg-red-50 text-error p-4 rounded-xl mb-6 text-sm font-bold border-2 border-red-100">${state.error}</div>` : ''}
        <button id="btnGenerate" class="w-full btn-3d bg-accent border-accent-dark text-white font-black text-lg py-4 rounded-2xl tracking-wide">Generate Soal AI</button>
      </div>
    `;
    document.getElementById('btnGenerate').addEventListener('click', generateExercises);
    return;
  }

  if (state.loading) {
    contentDiv.innerHTML = `
      <div class="flex flex-col items-center justify-center mt-20">
        <div class="w-16 h-16 border-4 border-slate-200 border-t-accent rounded-full animate-spin mb-6"></div>
        <p class="font-bold text-accent text-lg animate-pulse">Meracik soal...</p>
      </div>
    `;
    return;
  }

  const q = state.exercises[state.currentIndex];
  const progress = (state.currentIndex / state.exercises.length) * 100;
  
  let inputHtml = '';
  if (q.options) {
    inputHtml = q.options.map(opt => {
      let btnClass = 'border-slate-200 bg-white text-slate-700 border-b-4 active:border-b-0 active:mt-1';
      if (state.isAnswered && opt === q.correctAnswer) btnClass = 'border-success bg-green-50 text-success border-b-0 mt-1';
      else if (state.isAnswered && opt === state.selectedOption && !state.isCorrect) btnClass = 'border-error bg-red-50 text-error border-b-0 mt-1';
      else if (state.selectedOption === opt) btnClass = 'border-accent bg-indigo-50 text-accent';
      
      return `<button class="option-btn w-full text-left px-5 py-4 rounded-2xl border-2 font-bold text-lg transition-all mb-3 ${btnClass}" data-opt="${opt}" ${state.isAnswered ? 'disabled' : ''}>${opt}</button>`;
    }).join('');
  } else {
    let inputClass = 'border-slate-200 bg-white focus:border-accent focus:ring-4 focus:ring-indigo-100';
    if (state.isAnswered && state.isCorrect) inputClass = 'border-success bg-green-50 text-success';
    else if (state.isAnswered && !state.isCorrect) inputClass = 'border-error bg-red-50 text-error';
    inputHtml = `<input type="text" id="textAnswer" value="${state.typedAnswer}" placeholder="Ketik jawaban..." class="w-full px-5 py-4 rounded-2xl border-2 font-bold text-lg outline-none transition-all ${inputClass}" ${state.isAnswered ? 'disabled' : ''} autocomplete="off" autofocus>`;
  }

  const feedbackHtml = state.isAnswered ? `
    <div class="mt-6 p-5 rounded-2xl animate-slide-up ${state.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}">
      <p class="font-black text-xl mb-2 flex items-center gap-2 ${state.isCorrect ? 'text-success' : 'text-error'}">
        ${state.isCorrect ? '🎉 Keren Banget!' : '💡 Belajar Lagi Ya!'}
      </p>
      ${!state.isCorrect ? `<p class="font-bold mb-2 text-slate-800">Jawaban benar: <span class="text-success">${q.correctAnswer}</span></p>` : ''}
      <p class="text-sm font-medium text-slate-600 leading-relaxed">${q.explanation}</p>
    </div>
  ` : '';

  const actionBtnHtml = !state.isAnswered ? `
    <button id="btnCheck" class="w-full btn-3d bg-accent hover:bg-indigo-600 border-accent-dark text-white font-black text-lg py-4 rounded-2xl tracking-wide mt-8 disabled:opacity-50 disabled:pointer-events-none" ${(!state.typedAnswer && !state.selectedOption) ? 'disabled' : ''}>CEK JAWABAN</button>
  ` : `
    <button id="btnNext" class="w-full btn-3d ${state.isCorrect ? 'bg-success border-success-dark hover:bg-emerald-600' : 'bg-error border-error-dark hover:bg-red-600'} text-white font-black text-lg py-4 rounded-2xl tracking-wide mt-6 animate-slide-up">${state.currentIndex === state.exercises.length - 1 ? 'SELESAIKAN' : 'LANJUT'}</button>
  `;

  contentDiv.innerHTML = `
    <div class="w-full">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div class="bg-accent h-full rounded-full transition-all duration-500 ease-out" style="width: ${progress}%"></div>
        </div>
        <span class="text-sm font-black text-slate-400">${state.currentIndex + 1}/${state.exercises.length}</span>
      </div>

      <div class="mb-8">
        <span class="inline-block bg-indigo-100 text-accent text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">${q.type.replace('-', ' ')}</span>
        
        ${q.type === 'listening' ? `
          <div class="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-3xl border-2 border-slate-100 mb-2">
            <button id="btnPlayAudio" class="w-24 h-24 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-transform active:scale-95 border-b-4 border-accent-dark active:border-b-0 active:mt-1">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
            </button>
            <p class="mt-4 text-sm font-bold text-slate-400">Tap buat dengerin</p>
          </div>
        ` : `<h2 class="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">${q.question}</h2>`}
        
        ${q.prompt ? `<p class="text-slate-500 font-medium mt-3 text-lg">${q.prompt}</p>` : ''}
      </div>

      <div class="space-y-1">${inputHtml}</div>
      ${feedbackHtml}
      <div>${actionBtnHtml}</div>
    </div>
  `;

  if (q.type === 'listening') document.getElementById('btnPlayAudio').addEventListener('click', () => playTTS(q.audioText));
  if (q.options) {
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { state.selectedOption = e.target.getAttribute('data-opt'); renderLessonContent(); });
    });
  } else {
    const input = document.getElementById('textAnswer');
    input.addEventListener('input', (e) => { 
      state.typedAnswer = e.target.value; 
      const btn = document.getElementById('btnCheck');
      if(btn) btn.disabled = !state.typedAnswer; 
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && state.typedAnswer) handleCheck(); });
  }
  if (!state.isAnswered) document.getElementById('btnCheck').addEventListener('click', handleCheck);
  else document.getElementById('btnNext').addEventListener('click', handleNext);
}

async function generateExercises() {
  state.loading = true; state.error = ''; 
  triggerMascot('thinking'); 
  renderLessonContent();
  
  try {
    const useMistakes = state.isReviewMode ? state.progress.mistakes.slice(-10) : [];
    const useTopic = state.isReviewMode ? '' : state.customTopic;

    const result = await fetchWithFallback(generatePrompt(state.settings, useTopic, useMistakes), state.settings.apiKey);
    state.exercises = result; state.currentIndex = 0; state.loading = false; 
    triggerMascot('idle'); 
    renderLessonContent();
  } catch (err) {
    state.error = err.message; state.loading = false; 
    triggerMascot('fail'); 
    renderLessonContent();
  }
}

function playTTS(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.settings.targetLanguage === 'English' ? 'en-US' : 'ja-JP'; 
    window.speechSynthesis.speak(utterance);
  }
}

function handleCheck() {
  const q = state.exercises[state.currentIndex];
  const userAns = q.options ? state.selectedOption : state.typedAnswer;
  if (!userAns) return;
  
  state.isCorrect = userAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  
  if (state.isCorrect) {
    state.correctCount++;
    state.progress.xp += 10;
    state.progress.todayXp += 10;
    triggerMascot('success'); 
    
    if (state.isReviewMode) {
      state.progress.mistakes = state.progress.mistakes.filter(m => m.question !== q.question);
      state.progress.healedMistakes = (state.progress.healedMistakes || 0) + 1;
    }
  } else {
    triggerMascot('fail'); 
    const isExist = state.progress.mistakes.find(m => m.question === q.question);
    if (!isExist) {
      state.progress.mistakes.push({ question: q.question, correctAnswer: q.correctAnswer });
      if (state.progress.mistakes.length > 30) state.progress.mistakes.shift();
    }
  }
  
  saveProgress(state.progress);
  state.isAnswered = true;
  renderLessonContent();
}

function handleNext() {
  if (state.currentIndex < state.exercises.length - 1) {
    state.currentIndex++; state.typedAnswer = ''; state.selectedOption = null; state.isAnswered = false; state.isCorrect = false; renderLessonContent();
  } else {
    updateStreak(); 
    state.progress.sessionsCompleted = (state.progress.sessionsCompleted || 0) + 1;
    saveProgress(state.progress);
    
    checkAchievements(state.correctCount, state.exercises.length);
    
    state.view = 'summary'; 
    render();
  }
}

function renderSummary() {
  const xpEarned = state.correctCount * 10;
  const isPerfect = state.correctCount === state.exercises.length;

  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-5 pt-16 items-center justify-center max-w-md mx-auto w-full">
      <div class="animate-slide-up text-center w-full">
        <div class="inline-flex items-center justify-center w-32 h-32 ${isPerfect ? 'bg-yellow-100 text-yellow-500' : 'bg-indigo-100 text-accent'} rounded-full mb-8 shadow-inner relative">
          ${isPerfect ? `
            <svg class="absolute -top-4 -right-2 w-10 h-10 text-yellow-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ` : ''}
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        
        <h1 class="text-4xl font-black text-slate-800 mb-3 tracking-tight">${isPerfect ? 'SEMPURNA!' : 'Selesai!'}</h1>
        <p class="text-lg text-slate-500 font-medium mb-10">Lu jawab ${state.correctCount} dari ${state.exercises.length} soal dengan benar.</p>
        
        <div class="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-premium mb-10 flex justify-around">
          <div class="text-center">
            <p class="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-1">XP Didapat</p>
            <p class="text-3xl font-black text-accent">+${xpEarned}</p>
          </div>
          <div class="w-px bg-slate-200"></div>
          <div class="text-center">
            <p class="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-1">Streak Lu</p>
            <p class="text-3xl font-black text-orange-500 flex items-center justify-center gap-1">
              ${state.progress.streak} <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-4 4-4 9 0 2.5 1.5 4.5 3 5.5V19h2v-2.5c1.5-1 3-3 3-5.5 0-5-4-9-4-9zm0 15c-1.5 0-3-1.5-3-3 0-2 2-4.5 3-5.5 1 1 3 3.5 3 5.5 0 1.5-1.5 3-3 3z"/></svg>
            </p>
          </div>
        </div>

        <button id="btnFinish" class="w-full btn-3d bg-accent hover:bg-indigo-600 border-accent-dark text-white font-black text-xl py-4 rounded-2xl tracking-wide shadow-lg">
          KEMBALI KE BERANDA
        </button>
      </div>
    </div>
  `;

  document.getElementById('btnFinish').addEventListener('click', () => {
    state.view = 'home'; triggerMascot('idle'); render();
  });
}

init();
