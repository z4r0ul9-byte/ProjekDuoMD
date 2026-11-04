// Cari function renderOnboarding(), lalu ganti bagian generalContent jadi ini:

  let generalContent = `
    <div class="animate-slide-in-right">
      <form id="settingsForm" class="space-y-4">
        
        <!-- PROVIDER SETTING -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Tipe API</label>
            <select id="provider" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-accent">
              <option value="gemini" ${state.settings.provider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
              <option value="custom" ${state.settings.provider === 'custom' ? 'selected' : ''}>Custom (OpenAI / Ollama)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nama Model</label>
            <input type="text" id="modelName" value="${state.settings.modelName}" placeholder="gemini-3.6-flash / gemma" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" />
          </div>
        </div>

        <div id="customUrlContainer" class="${state.settings.provider === 'custom' ? 'block' : 'hidden'}">
          <label class="block text-sm font-bold text-slate-700 mb-1">Base URL</label>
          <input type="text" id="customBaseUrl" value="${state.settings.customBaseUrl}" placeholder="http://localhost:11434/v1" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" />
          <p class="text-[10px] text-slate-400 mt-1">Untuk Ollama: http://localhost:11434/v1 (Model: gemma2 / llama3)</p>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">API Key</label>
          <input type="password" id="apiKey" value="${state.settings.apiKey}" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" placeholder="${state.settings.provider === 'custom' ? 'Boleh dikosongin kalau lokal (Ollama)' : 'AIzaSy...'}" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Bahasa Target</label>
            <select id="targetLanguage" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-accent">
              <option ${state.settings.targetLanguage === 'English' ? 'selected' : ''}>English</option>
              <option ${state.settings.targetLanguage === 'Japanese' ? 'selected' : ''}>Japanese</option>
              <option ${state.settings.targetLanguage === 'Korean' ? 'selected' : ''}>Korean</option>
              <option ${state.settings.targetLanguage === 'Spanish' ? 'selected' : ''}>Spanish</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Gaya Mengajar</label>
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

// Ganti event listener 'change' di stylePreset, dan tambahin ini:
  document.getElementById('provider').addEventListener('change', (e) => {
    document.getElementById('customUrlContainer').classList.toggle('hidden', e.target.value !== 'custom');
  });

// Di bagian settingsForm submit, ubah objek state.settings jadi:
    state.settings = {
      ...state.settings,
      provider: document.getElementById('provider').value,
      modelName: document.getElementById('modelName').value,
      customBaseUrl: document.getElementById('customBaseUrl') ? document.getElementById('customBaseUrl').value : '',
      apiKey: document.getElementById('apiKey').value,
      targetLanguage: document.getElementById('targetLanguage').value,
      stylePreset: document.getElementById('stylePreset').value,
      customStylePrompt: document.getElementById('customStylePrompt') ? document.getElementById('customStylePrompt').value : '',
    };

// Terakhir, cari function generateExercises(), ubah fetchWithFallback jadi fetchAI:
// const result = await fetchAI(generatePrompt(state.settings, useTopic, useMistakes), state.settings);
