// api.js
const getStyleText = (settings) => {
  if (settings.stylePreset === 'gaul') return 'Gunakan bahasa gaul Jakarta yang santai, banyak slang (kayak, gue, lo, wkwk).';
  if (settings.stylePreset === 'formal') return 'Gunakan bahasa Indonesia formal, baku, dan sopan.';
  if (settings.stylePreset === 'storyteller') return 'Gunakan gaya bercerita yang menarik dan imajinatif.';
  if (settings.stylePreset === 'custom') return settings.customStylePrompt || 'Gunakan bahasa yang santai dan mudah dimengerti.';
  return 'Gunakan bahasa Indonesia sehari-hari yang santuy dan asik.';
};

const generatePrompt = (settings) => {
  return `Kamu adalah guru bahasa ${settings.targetLanguage} untuk orang Indonesia.
Buatkan 5 soal latihan untuk level ${settings.level}. Wajib campur dari 4 tipe ini:
1. "grammar" (pilihan ganda, isi field "options" array 4 string)
2. "translate" (terjemahkan kalimat)
3. "fill-blank" (isi titik-titik, soal ada di field "question")
4. "listening" (pilihan ganda, isi field "audioText" dengan teks yang akan dibacakan TTS, dan "options")

Gaya bahasa kamu saat memberikan penjelasan harus: ${getStyleText(settings)}.

Output HARUS berupa JSON array murni tanpa markdown, dengan format persis seperti ini:
[
  {
    "type": "grammar",
    "question": "Which one is correct?",
    "options": ["He go to school", "He goes to school", "He going to school", "He gone to school"],
    "correctAnswer": "He goes to school",
    "explanation": "Penjelasan singkat..."
  }
]`;
};

const FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper buat ngirim log ke UI
const log = (msg, type = 'info') => {
  if (typeof window.addLog === 'function') window.addLog(msg, type);
};

const fetchWithFallback = async (prompt, apiKey) => {
  let lastError = null;
  
  for (const model of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        log(`Mencoba model: ${model} (Attempt ${attempt})`, 'accent');
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        
        if (res.ok) {
          const json = await res.json();
          log(`Berhasil dapet soal dari ${model}!`, 'success');
          return JSON.parse(json.candidates[0].content.parts[0].text);
        }
        
        const errData = await res.json();
        
        if (res.status === 503 || res.status === 429) {
          lastError = new Error(`Model ${model} sibuk.`);
          log(`Error ${res.status} (High Demand). Nunggu ${attempt * 2} detik...`, 'error');
          await sleep(attempt * 2000); 
          continue;
        }
        
        throw new Error(errData.error?.message || "Gagal");
      } catch (err) {
        lastError = err;
        log(`Gagal di ${model}: ${err.message}`, 'error');
        if (attempt === 2) break;
        await sleep(1000);
      }
    }
    log(`Beralih dari model ${model} karena gagal...`, 'error');
  }
  
  log(`Semua model gagal.`, 'error');
  throw new Error(`Semua server sibuk: ${lastError?.message}`);
};
