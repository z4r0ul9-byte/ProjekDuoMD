# LinguaQuest

Belajar bahasa apapun dengan gaya ngajar yang **kamu** tentukan sendiri. Semua exercise digenerate real-time oleh Google Gemini, jadi tidak ada database statis — mau belajar Japanese dengan gaya "Gaul Jakarta", atau English dengan nada "Formal Ketat"? Tinggal pilih.

> **Status:** Phase 1 (foundation) selesai. Phase 2 (Gemini + UI) menyusul.

## Fitur (target)

- 🎯 Belajar bahasa apapun lewat Gemini
- 🎨 Custom teaching style (preset + free-text)
- 📝 4 tipe exercise: Translate, Fill-in-the-Blank, Grammar Quiz, Listening (TTS)
- 🔥 Daily streak & XP system
- 🔒 API key disimpan di `localStorage` kamu sendiri — tidak pernah dikirim ke server pihak ketiga selain Google
- 🚀 Deploy static ke GitHub Pages via GitHub Actions

## Setup Lokal

Butuh Node.js 20+.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Deploy ke GitHub Pages

1. Push repo ini ke GitHub (`main` branch).
2. Buka **Settings → Pages** di repo.
3. Di **Source**, pilih **GitHub Actions** (bukan "Deploy from a branch").
4. Push apapun ke `main` → GitHub Actions otomatis build & deploy.
5. URL-nya: `https://<username>.github.io/<repo>/`

File `.github/workflows/deploy.yml` sudah disiapkan. Kalau repo kamu bukan `main`, ubah `branches: [main]` di workflow.

## Dapatkan Gemini API Key

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Login dengan akun Google.
3. Klik **Create API key** → copy.
4. Nanti di aplikasi, buka **Settings** dan paste di sana. Key disimpan **hanya di browser kamu** (`localStorage`), tidak pernah dikirim ke server selain Google.

## Struktur Project

```
.github/workflows/deploy.yml   # GitHub Actions → Pages
index.html
vite.config.ts                 # base: './' untuk Pages project site
src/
├── main.tsx                   # entry
├── App.tsx                    # root view switcher
├── index.css                  # Tailwind + theme
├── types.ts                   # semua tipe data
└── lib/storage.ts             # localStorage wrapper
```

## Roadmap

- ☑  
**Phase 1** — Foundation: Vite + React + TS + Tailwind, deploy pipeline, types, storage
- □  
**Phase 2** — Gemini integration (`lib/gemini.ts`, `lib/prompt.ts`) + structured output
- □  
**Phase 3** — Onboarding & Settings UI (API key, bahasa, style preset)
- □  
**Phase 4** — Home + Lesson flow + 4 exercise components
- □  
**Phase 5** — Streak / XP / polish (animation, empty states, error handling)

## Lisensi

MIT

</BDS:create_file>

<BDS:create_file fileName="src/main.tsx">

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

