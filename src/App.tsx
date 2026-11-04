import { Sparkles } from 'lucide-react';

/**
 * Phase 1 placeholder. Real views (Onboarding, Home, Lesson, Settings)
 * land in Phase 2–4. For now this just proves the whole pipeline works:
 * Vite build → GitHub Actions → GitHub Pages.
 */
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-surface-alt) p-6">
      <div className="lq-fade-in max-w-md w-full text-center bg-white rounded-2xl border border-(--color-border) shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-(--color-accent-soft) text-(--color-accent) mb-5">
          <Sparkles size={26} />
        </div>
        <h1 className="text-3xl font-bold text-(--color-ink) mb-1">
          LinguaQuest
        </h1>
        <p className="text-sm text-(--color-ink-muted) mb-6">
          Belajar bahasa, gaya kamu sendiri.
        </p>

        <div className="text-left bg-(--color-surface-alt) rounded-xl p-4 text-sm space-y-1.5">
          <p className="font-medium text-(--color-ink)">
            Phase 1 · Foundation
          </p>
          <p className="text-(--color-ink-muted)">
            ✓ Vite + React + TypeScript + Tailwind v4
          </p>
          <p className="text-(--color-ink-muted)">✓ GitHub Actions → Pages</p>
          <p className="text-(--color-ink-muted)">✓ Types &amp; storage layer</p>
          <p className="text-(--color-ink-muted)">
            ⏳ Gemini + UI menyusul di Phase 2
          </p>
        </div>

        <p className="mt-6 text-xs text-(--color-ink-muted)">
          Kalau halaman ini kebuka di GitHub Pages, deploy kamu sudah benar.
        </p>
      </div>
    </div>
  );
}
