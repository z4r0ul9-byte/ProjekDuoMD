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
  logs: [], // Tempat nyimpen log
  showLogs: false // Status modal log
};

const appDiv = document.getElementById('app');

// FUNGSI BUAT NAMBAHIN LOG DARI API.JS
window.addLog = (msg, type = 'info') => {
  const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
  state.logs.push({ time, msg, type });
  if (state.logs.length > 100) state.logs.shift(); // Max 100 log biar ga berat
  if (state.showLogs) renderLogModal();
};

function init() {
  const today = getTodayString();
  if (state.progress.lastPlayedDate !== today) state.progress.todayXp = 0;
  if (state.settings.apiKey) state.view = 'home';
  else state.view = 'onboarding';
  
  initFloatingLogBtn(); // Bikin tombol log melayang
  render();
}

function render() {
  appDiv.innerHTML = '';
  if (state.view === 'onboarding' || state.view === 'settings') renderOnboarding();
  else if (state.view === 'home') renderHome();
  else if (state.view === 'lesson') renderLesson();
  else if (state.view === 'summary') renderSummary();
}

function updateStreak() {
  const today = getTodayString();
  const lastPlayed = state.progress.lastPlayedDate;
  if (lastPlayed !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
    if (lastPlayed === yesterdayStr) state.progress.streak += 1;
    else state.progress.streak = 1;
    state.progress.lastPlayedDate = today;
  }
  saveProgress(state.progress);
}

// --- UI LOG TERMINAL ---
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
  if (!state.showLogs) {
    if (modal) modal.remove();
    return;
  }
  
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
        <h3 class="text-white font-mono font-bold text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
          LinguaQuest Terminal
        </h3>
        <button id="btnCloseLog" class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
      </div>
      <div class="p-4 overflow-y-auto font-mono text-xs flex-1 custom-scrollbar">
        ${logHtml}
      </div>
      <div class="bg-[#161b22] p-2 text-center border-t border-slate-700">
        <p class="text-[10px] text-slate-500 font-mono">System Logs Real-time</p>
      </div>
    </div>
  `;
  
  document.getElementById('btnCloseLog').onclick = () => { state.showLogs = false; renderLogModal(); };
}

// --- ONBOARDING / SETTINGS ---
function renderOnboarding() {
  appDiv.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="animate-slide-up max-w-md w-full bg-white rounded-3xl shadow-premium border border-slate-100 p-8 mt-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-accent rounded-2xl mb-4 shadow-inner-light">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">${state.view === 'settings' ? 'Pengaturan' : 'LinguaQuest'}</h1>
          <p class="text-slate-500 font-medium mt-1">Belajar bahasa, gaya kamu sendiri.</p>
        </div>
        <form id="settingsForm" class="space-y-5">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">Gemini API Key</label>
            <input type="password" id="apiKey" required value="${state.settings.apiKey}" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent focus:bg-white transition-colors" placeholder="AIzaSy..." />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Bahasa Target</label>
              <select id="targetLanguage" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-accent appearance-none cursor-pointer">
                <option ${state.settings.targetLanguage === 'English' ? 'selected' : ''}>English</option>
                <option ${state.settings.targetLanguage === 'Japanese' ? 'selected' : ''}>Japanese</option>
                <option ${state.settings.targetLanguage === 'Korean' ? 'selected' : ''}>Korean</option>
                <option ${state.settings.targetLanguage === 'Arabic' ? 'selected' : ''}>Arabic</option>
                <option ${state.settings.targetLanguage === 'Spanish' ? 'selected' : ''}>Spanish</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Gaya</label>
              <select id="stylePreset" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-accent appearance-none cursor-pointer">
                <option value="santuy" ${state.settings.stylePreset === 'santuy' ? 'selected' : ''}>Santuy</option>
                <option value="gaul" ${state.settings.stylePreset === 'gaul' ? 'selected' : ''}>Gaul</option>
                <option value="formal" ${state.settings.stylePreset === 'formal' ? 'selected' : ''}>Formal</option>
                <option value="custom" ${state.settings.stylePreset === 'custom' ? 'selected' : ''}>Custom</option>
              </select>
            </div>
          </div>
          <div id="customStyleContainer" class="${state.settings.stylePreset === 'custom' ? 'block' : 'hidden'}">
            <input type="text" id="customStylePrompt" value="${state.settings.customStylePrompt}" placeholder="Misal: Pakai bahasa anak Jaksel..." class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" />
          </div>
          <button type="submit" class="w-full btn-3d bg-accent hover:bg-indigo-600 border-accent-dark text-white font-extrabold text-lg py-3.5 rounded-2xl mt-4">
            Simpan & Lanjut
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('stylePreset').addEventListener('change', (e) => {
    document.getElementById('customStyleContainer').classList.toggle('hidden', e.target.value !== 'custom');
  });

  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    state.settings = {
      apiKey: document.getElementById('apiKey').value,
      targetLanguage: document.getElementById('targetLanguage').value,
      stylePreset: document.getElementById('stylePreset').value,
      customStylePrompt: document.getElementById('customStylePrompt') ? document.getElementById('customStylePrompt').value : '',
      level: 'beginner'
    };
    saveSettings(state.settings);
    state.view = 'home'; render();
  });
}

// --- HOME SCREEN ---
function renderHome() {
  if (state.progress.lastPlayedDate !== getTodayString()) state.progress.todayXp = 0;
  
  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-5 max-w-md mx-auto w-full pb-8 pt-16">
      <!-- Top Bar (Stats) -->
      <div class="flex gap-4 mb-8">
        <div class="flex-1 bg-white rounded-2xl p-4 shadow-premium border border-slate-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 animate-pop">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-4 4-4 9 0 2.5 1.5 4.5 3 5.5V19h2v-2.5c1.5-1 3-3 3-5.5 0-5-4-9-4-9zm0 15c-1.5 0-3-1.5-3-3 0-2 2-4.5 3-5.5 1 1 3 3.5 3 5.5 0 1.5-1.5 3-3 3z"/></svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Streak</p>
            <p class="text-xl font-black text-slate-800 leading-none">${state.progress.streak} <span class="text-sm font-bold text-slate-500">Hari</span></p>
          </div>
        </div>
        <div class="flex-1 bg-white rounded-2xl p-4 shadow-premium border border-slate-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Total XP</p>
            <p class="text-xl font-black text-slate-800 leading-none">${state.progress.xp}</p>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="flex-1 flex flex-col justify-center text-center items-center">
        <div class="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner-light rotate-3">
           <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="-rotate-3"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        </div>
        <h1 class="text-3xl font-black text-slate-800 mb-3 tracking-tight">Siap Taklukkan<br>${state.settings.targetLanguage}?</h1>
        <p class="text-slate-500 font-medium mb-8 px-4">Latihan 5 soal tiap hari buat jaga streak kamu.</p>
        
        <button id="btnStart" class="w-full btn-3d bg-accent hover:bg-indigo-600 border-accent-dark text-white font-black text-xl py-4 rounded-2xl tracking-wide shadow-lg">
          MULAI BELAJAR
        </button>
      </div>

      <div class="text-center mt-6">
        <button id="btnSettings" class="text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors bg-slate-200/50 px-4 py-2 rounded-full">⚙️ Pengaturan</button>
      </div>
    </div>
  `;

  document.getElementById('btnStart').addEventListener('click', () => {
    state.view = 'lesson'; state.exercises = []; state.currentIndex = 0; state.correctCount = 0; state.error = ''; render();
  });
  document.getElementById('btnSettings').addEventListener('click', () => { state.view = 'settings'; render(); });
}

// --- LESSON SCREEN ---
function renderLesson() {
  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-5 pt-16 min-h-screen max-w-lg mx-auto w-full">
      <div class="flex items-center mb-4">
        <button id="btnBack" class="text-slate-400 hover:text-slate-700 p-2 -ml-2 rounded-full bg-slate-200/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
      </div>
      <div id="lessonContent" class="flex-1 flex flex-col justify-start pb-12"></div>
    </div>
  `;
  document.getElementById('btnBack').addEventListener('click', () => { state.view = 'home'; render(); });
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
        <p class="text-xs text-slate-400 mt-2">Cek icon terminal di kiri atas buat liat prosesnya.</p>
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
  state.loading = true; state.error = ''; renderLessonContent();
  try {
    const result = await fetchWithFallback(generatePrompt(state.settings), state.settings.apiKey);
    state.exercises = result; state.currentIndex = 0; state.loading = false; renderLessonContent();
  } catch (err) {
    state.error = err.message; state.loading = false; renderLessonContent();
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
    saveProgress(state.progress);
  }
  
  state.isAnswered = true;
  renderLessonContent();
}

function handleNext() {
  if (state.currentIndex < state.exercises.length - 1) {
    state.currentIndex++; state.typedAnswer = ''; state.selectedOption = null; state.isAnswered = false; state.isCorrect = false; renderLessonContent();
  } else {
    updateStreak(); 
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
    state.view = 'home'; render();
  });
}

init();
