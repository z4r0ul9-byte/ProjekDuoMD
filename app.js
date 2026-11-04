// app.js
let state = {
  view: 'loading',
  settings: loadSettings(),
  progress: loadProgress(),
  exercises: [],
  currentIndex: 0,
  correctCount: 0, // Ngetrack bener berapa
  loading: false,
  error: '',
  isAnswered: false,
  isCorrect: false,
  typedAnswer: '',
  selectedOption: null
};

const appDiv = document.getElementById('app');

function init() {
  // Cek apakah hari ini udah main, buat reset todayXp
  const today = getTodayString();
  if (state.progress.lastPlayedDate !== today) {
    state.progress.todayXp = 0;
  }

  if (state.settings.apiKey) state.view = 'home';
  else state.view = 'onboarding';
  render();
}

function render() {
  appDiv.innerHTML = '';
  if (state.view === 'onboarding' || state.view === 'settings') renderOnboarding();
  else if (state.view === 'home') renderHome();
  else if (state.view === 'lesson') renderLesson();
  else if (state.view === 'summary') renderSummary();
}

// --- FUNGSI HITUNG STREAK ---
function updateStreak() {
  const today = getTodayString();
  const lastPlayed = state.progress.lastPlayedDate;
  
  if (lastPlayed !== today) {
    // Cek apakah kemarin main
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

    if (lastPlayed === yesterdayStr) {
      state.progress.streak += 1; // Lanjut streak
    } else {
      state.progress.streak = 1; // Reset ke 1 karena bolong
    }
    state.progress.lastPlayedDate = today;
  }
  // Kalau lastPlayed === today, streak ga nambah (baru selesai 1 sesi hari ini)
  saveProgress(state.progress);
}

// --- VIEWS ---
function renderOnboarding() {
  // SAMA SEPERTI SEBELUMNYA
  appDiv.innerHTML = `
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="lq-fade-in max-w-md w-full bg-surface rounded-2xl border border-border shadow-sm p-6">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-ink">${state.view === 'settings' ? 'Pengaturan' : 'Selamat Datang'}</h1>
        </div>
        <form id="settingsForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-ink mb-1">Gemini API Key</label>
            <input type="password" id="apiKey" required value="${state.settings.apiKey}" class="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-ink mb-1">Bahasa Target</label>
              <select id="targetLanguage" class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white">
                <option ${state.settings.targetLanguage === 'English' ? 'selected' : ''}>English</option>
                <option ${state.settings.targetLanguage === 'Japanese' ? 'selected' : ''}>Japanese</option>
                <option ${state.settings.targetLanguage === 'Korean' ? 'selected' : ''}>Korean</option>
                <option ${state.settings.targetLanguage === 'Arabic' ? 'selected' : ''}>Arabic</option>
                <option ${state.settings.targetLanguage === 'Spanish' ? 'selected' : ''}>Spanish</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-ink mb-1">Gaya Mengajar</label>
              <select id="stylePreset" class="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white">
                <option value="santuy" ${state.settings.stylePreset === 'santuy' ? 'selected' : ''}>Santuy</option>
                <option value="gaul" ${state.settings.stylePreset === 'gaul' ? 'selected' : ''}>Gaul</option>
                <option value="formal" ${state.settings.stylePreset === 'formal' ? 'selected' : ''}>Formal</option>
                <option value="custom" ${state.settings.stylePreset === 'custom' ? 'selected' : ''}>Custom...</option>
              </select>
            </div>
          </div>
          <div id="customStyleContainer" class="${state.settings.stylePreset === 'custom' ? 'block' : 'hidden'}">
            <input type="text" id="customStylePrompt" value="${state.settings.customStylePrompt}" placeholder="Prompt custom..." class="w-full px-3 py-2 border border-border rounded-lg text-sm" />
          </div>
          <button type="submit" class="w-full bg-accent text-white font-medium py-2.5 rounded-lg mt-2">Simpan</button>
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

function renderHome() {
  // Update todayXp kalau hari udah berubah
  if (state.progress.lastPlayedDate !== getTodayString()) {
    state.progress.todayXp = 0;
  }

  const fireColor = state.progress.streak > 0 ? 'text-orange-500' : 'text-gray-300';

  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
      <!-- Header: Streak & XP -->
      <div class="flex justify-between items-center bg-white p-4 rounded-2xl border border-border shadow-sm mb-8 mt-4">
        <div class="flex items-center gap-2">
          <svg class="${fireColor} w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-4 4-4 9 0 2.5 1.5 4.5 3 5.5V19h2v-2.5c1.5-1 3-3 3-5.5 0-5-4-9-4-9zm0 15c-1.5 0-3-1.5-3-3 0-2 2-4.5 3-5.5 1 1 3 3.5 3 5.5 0 1.5-1.5 3-3 3z"/></svg>
          <div>
            <p class="text-xs text-ink-muted font-bold uppercase">Streak</p>
            <p class="text-xl font-black text-ink leading-none">${state.progress.streak} Hari</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs text-accent font-bold uppercase">Total XP</p>
          <p class="text-xl font-black text-accent leading-none">${state.progress.xp} XP</p>
        </div>
      </div>

      <!-- Ilustrasi / Sapaan -->
      <div class="text-center flex-1 flex flex-col justify-center">
        <h1 class="text-3xl font-bold text-ink mb-2">Siap Belajar?</h1>
        <p class="text-ink-muted mb-8 text-sm">${state.settings.targetLanguage} • Gaya ${state.settings.stylePreset}</p>
        
        <button id="btnStart" class="w-full bg-accent hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(77,107,254,0.39)] active:scale-95 text-lg">
          Mulai Latihan
        </button>
      </div>

      <div class="text-center mt-6">
        <button id="btnSettings" class="text-sm font-medium text-ink-muted hover:text-ink">Pengaturan</button>
      </div>
    </div>
  `;

  document.getElementById('btnStart').addEventListener('click', () => {
    state.view = 'lesson'; state.exercises = []; state.currentIndex = 0; state.correctCount = 0; state.error = ''; render();
  });
  document.getElementById('btnSettings').addEventListener('click', () => { state.view = 'settings'; render(); });
}

function renderLesson() {
  // SAMA SEPERTI SEBELUMNYA
  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-4 pt-6 min-h-screen max-w-lg mx-auto w-full">
      <button id="btnBack" class="text-sm font-medium text-ink-muted mb-4 self-start">&larr; Keluar</button>
      <div id="lessonContent" class="flex-1 flex flex-col justify-center pb-12"></div>
    </div>
  `;
  document.getElementById('btnBack').addEventListener('click', () => { state.view = 'home'; render(); });
  renderLessonContent();
}

function renderLessonContent() {
  // SAMA SEPERTI SEBELUMNYA (Hanya tambah logika update correctCount)
  const contentDiv = document.getElementById('lessonContent');
  if (!contentDiv) return;

  if (!state.exercises.length && !state.loading) {
    contentDiv.innerHTML = `
      <div class="text-center">
        ${state.error ? `<div class="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium border border-red-200">${state.error}</div>` : ''}
        <button id="btnGenerate" class="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md">Generate 5 Soal Sekarang</button>
      </div>
    `;
    document.getElementById('btnGenerate').addEventListener('click', generateExercises);
    return;
  }

  if (state.loading) {
    contentDiv.innerHTML = `<p class="text-center font-medium text-accent animate-pulse">Menyiapkan soal dari AI...</p>`;
    return;
  }

  const q = state.exercises[state.currentIndex];
  const progress = (state.currentIndex / state.exercises.length) * 100;
  
  let inputHtml = '';
  if (q.options) {
    inputHtml = q.options.map(opt => {
      let btnClass = 'border-border bg-white text-ink hover:bg-surface-alt';
      if (state.isAnswered && opt === q.correctAnswer) btnClass = 'border-success bg-green-50 text-success';
      else if (state.isAnswered && opt === state.selectedOption && !state.isCorrect) btnClass = 'border-error bg-red-50 text-error';
      else if (state.selectedOption === opt) btnClass = 'border-accent bg-accent-soft text-accent';
      return `<button class="option-btn w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium ${btnClass}" data-opt="${opt}" ${state.isAnswered ? 'disabled' : ''}>${opt}</button>`;
    }).join('');
  } else {
    let inputClass = 'border-border focus:border-accent';
    if (state.isAnswered && state.isCorrect) inputClass = 'border-success bg-green-50';
    else if (state.isAnswered && !state.isCorrect) inputClass = 'border-error bg-red-50';
    inputHtml = `<input type="text" id="textAnswer" value="${state.typedAnswer}" placeholder="Ketik jawabanmu di sini..." class="w-full px-4 py-3 rounded-xl border-2 text-lg outline-none transition-all ${inputClass}" ${state.isAnswered ? 'disabled' : ''} autocomplete="off">`;
  }

  const feedbackHtml = state.isAnswered ? `
    <div class="mt-6 p-4 rounded-xl border ${state.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} lq-fade-in">
      <p class="font-bold mb-1 ${state.isCorrect ? 'text-success' : 'text-error'}">${state.isCorrect ? '✅ Benar! (+10 XP)' : '❌ Salah, jawaban yang bener:'}</p>
      ${!state.isCorrect ? `<p class="font-medium mb-2 text-ink">${q.correctAnswer}</p>` : ''}
      <p class="text-sm text-ink-muted">${q.explanation}</p>
    </div>
  ` : '';

  const actionBtnHtml = !state.isAnswered ? `
    <button id="btnCheck" class="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-accent" ${(!state.typedAnswer && !state.selectedOption) ? 'disabled' : ''}>Cek Jawaban</button>
  ` : `
    <button id="btnNext" class="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors lq-fade-in">${state.currentIndex === state.exercises.length - 1 ? 'Selesaikan Latihan' : 'Lanjut Soal Berikutnya'}</button>
  `;

  contentDiv.innerHTML = `
    <div class="w-full">
      <div class="w-full bg-border rounded-full h-2 mb-6"><div class="bg-accent h-2 rounded-full transition-all" style="width: ${progress}%"></div></div>
      <div class="mb-8">
        <p class="text-sm font-bold text-accent mb-2 uppercase tracking-wide">${q.type.replace('-', ' ')}</p>
        ${q.type === 'listening' ? `
          <button id="btnPlayAudio" class="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:bg-blue-600 transition-transform active:scale-95">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
          </button>
        ` : `<h2 class="text-xl sm:text-2xl font-bold text-ink leading-tight">${q.question}</h2>`}
        ${q.prompt ? `<p class="text-ink-muted mt-2 text-sm">${q.prompt}</p>` : ''}
      </div>
      <div class="space-y-3">${inputHtml}</div>
      ${feedbackHtml}
      <div class="mt-8">${actionBtnHtml}</div>
    </div>
  `;

  if (q.type === 'listening') document.getElementById('btnPlayAudio').addEventListener('click', () => playTTS(q.audioText));
  if (q.options) {
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { state.selectedOption = e.target.getAttribute('data-opt'); renderLessonContent(); });
    });
  } else {
    const input = document.getElementById('textAnswer');
    input.addEventListener('input', (e) => { state.typedAnswer = e.target.value; document.getElementById('btnCheck').disabled = !state.typedAnswer; });
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
    state.progress.xp += 10; // Dapet 10 XP per jawaban bener
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
    // Pindah ke layar Summary
    updateStreak(); 
    state.view = 'summary'; 
    render();
  }
}

// --- LAYAR SELESAI (SUMMARY) ---
function renderSummary() {
  const xpEarned = state.correctCount * 10;
  
  appDiv.innerHTML = `
    <div class="flex-1 flex flex-col p-4 items-center justify-center max-w-md mx-auto w-full">
      <div class="lq-fade-in text-center w-full">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full mb-6 shadow-inner animate-bounce">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <h1 class="text-3xl font-black text-ink mb-2">Latihan Selesai!</h1>
        <p class="text-ink-muted mb-8">Lu jawab ${state.correctCount} dari ${state.exercises.length} soal dengan benar.</p>
        
        <div class="bg-white rounded-2xl border border-border p-6 shadow-sm mb-8 flex justify-around">
          <div class="text-center">
            <p class="text-xs text-ink-muted font-bold uppercase mb-1">Didapat</p>
            <p class="text-2xl font-black text-accent">+${xpEarned} XP</p>
          </div>
          <div class="text-center border-l border-border pl-6">
            <p class="text-xs text-ink-muted font-bold uppercase mb-1">Streak Lu</p>
            <p class="text-2xl font-black text-orange-500">${state.progress.streak} Hari</p>
          </div>
        </div>

        <button id="btnFinish" class="w-full bg-accent hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md transition-transform active:scale-95 text-lg">
          Kembali ke Beranda
        </button>
      </div>
    </div>
  `;

  document.getElementById('btnFinish').addEventListener('click', () => {
    state.view = 'home'; render();
  });
}

init();