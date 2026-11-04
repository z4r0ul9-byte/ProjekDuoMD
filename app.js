// Cari function renderOnboarding() di app.js lu.
// Ganti bagian generalContent dengan kode di bawah ini:

  let generalContent = `
    <div class="animate-slide-in-right">
      <form id="settingsForm" class="space-y-4">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Tipe API</label>
            <select id="provider" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-accent">
              <option value="gemini" ${state.settings.provider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
              <option value="custom" ${state.settings.provider === 'custom' ? 'selected' : ''}>Custom (OpenAI/Ollama)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Nama Model</label>
            <input type="text" id="modelName" value="${state.settings.modelName}" placeholder="Contoh: gemini-3.6-flash" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" />
          </div>
        </div>

        <!-- PANDUAN MODEL -->
        <div class="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg -mt-1 border border-blue-100">
          <strong>Tips:</strong> 
          <br>• Pake Gemini? Ketik <code>gemini-3.6-flash</code>
          <br>• Pake Gemma (via Google AI)? Ketik <code>gemma-2-9b-it</code>
          <br>• Pake OpenRouter/Groq/Ollama? Pilih Custom di atas.
        </div>

        <div id="customUrlContainer" class="${state.settings.provider === 'custom' ? 'block' : 'hidden'}">
          <label class="block text-sm font-bold text-slate-700 mb-1">Base URL</label>
          <input type="text" id="customBaseUrl" value="${state.settings.customBaseUrl}" placeholder="https://api.openai.com/v1" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" />
          <p class="text-[10px] text-slate-500 mt-1">
            Contoh:<br>
            • OpenRouter: https://openrouter.ai/api/v1<br>
            • Groq: https://api.groq.com/openai/v1<br>
            • Ollama Lokal: http://localhost:11434/v1
          </p>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">API Key</label>
          <input type="password" id="apiKey" value="${state.settings.apiKey}" class="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-accent" placeholder="${state.settings.provider === 'custom' ? 'Kosongin kalau Ollama lokal' : 'AIzaSy...'}" />
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
