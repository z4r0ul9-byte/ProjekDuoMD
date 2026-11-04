// api.js
const getStyleText = (settings) => {
  if (settings.stylePreset === 'gaul') return 'Gunakan bahasa gaul Jakarta yang santai, banyak slang (kayak, gue, lo, wkwk).';
  if (settings.stylePreset === 'formal') return 'Gunakan bahasa Indonesia formal, baku, dan sopan.';
  if (settings.stylePreset === 'storyteller') return 'Gunakan gaya bercerita yang menarik dan imajinatif.';
  if (settings.stylePreset === 'custom') return settings.customStylePrompt || 'Gunakan bahasa yang santai dan mudah dimengerti.';
  return 'Gunakan bahasa Indonesia sehari-hari yang santuy dan asik.';
};

const generatePrompt = (settings, topic = '', mistakes = []) => {
  let focusText = "";
  if (mistakes && mistakes.length > 0) {
    const listMistakes = mistakes.map((m, i) => `${i+1}. Soal: "${m.question}" (Jawaban benar: "${m.correctAnswer}")`).join('\n');
    focusText = `FOKUS UTAMA: User sebelumnya melakukan kesalahan pada materi/soal berikut:\n${listMistakes}\nBuatkan 5 soal BARU yang menargetkan kelemahan-kelemahan ini agar user bisa memperbaikinya.`;
  } else if (topic && topic.trim() !== '') {
    focusText = `FOKUS UTAMA: Buatkan soal khusus yang membahas topik "${topic}".`;
  } else {
    focusText = `FOKUS UTAMA: Buatkan soal latihan acak yang bervariasi.`;
  }

  let memoryContext = "";
  if (settings.memoryBank && settings.memoryBank.length > 0) {
    memoryContext = `\n[INFO TAMBAHAN TENTANG USER (Gunakan ini agar contoh kalimat relevan & personal)]:\n` + 
      settings.memoryBank.map(m => `- ${m}`).join('\n');
  }

  return `Kamu adalah guru bahasa ${settings.targetLanguage} untuk orang Indonesia.
Buatkan 5 soal latihan untuk level ${settings.level}. 
${focusText}
${memoryContext}

Wajib campur dari 4 tipe ini:
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

const log = (msg, type = 'info') => {
  if (typeof window.addLog === 'function') window.addLog(msg, type);
};

const cleanJSON = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
  if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
  return JSON.parse(cleaned.trim());
};

const fetchAI = async (prompt, settings) => {
  const { apiKey, provider, modelName, customBaseUrl } = settings;

  if (provider === 'gemini') {
    const FALLBACK_MODELS = [modelName || 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError = null;
    for (const model of FALLBACK_MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          log(`[Gemini] Mencoba ${model} (Attempt ${attempt})`, 'accent');
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
            log(`[Gemini] Sukses di ${model}`, 'success');
            return cleanJSON(json.candidates[0].content.parts[0].text);
          }
          const errData = await res.json();
          if (res.status === 503 || res.status === 429) {
            lastError = new Error(`Model ${model} sibuk.`);
            await new Promise(r => setTimeout(r, attempt * 2000)); 
            continue;
          }
          throw new Error(errData.error?.message || "Gagal");
        } catch (err) {
          lastError = err;
          if (attempt === 2) break;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }
    throw new Error(`Semua model Gemini gagal: ${lastError?.message}`);
  } 
  else {
    try {
      log(`[Custom API] Mencoba ${modelName}...`, 'accent');
      const url = `${customBaseUrl.replace(/\/$/, '')}/chat/completions`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || 'ollama'}` 
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" } 
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `HTTP Error ${res.status}`);
      }

      const json = await res.json();
      log(`[Custom API] Sukses!`, 'success');
      const rawText = json.choices[0].message.content;
      return cleanJSON(rawText);
    } catch (err) {
      log(`[Custom API] Error: ${err.message}`, 'error');
      throw new Error(`Custom API Error: ${err.message}`);
    }
  }
};
