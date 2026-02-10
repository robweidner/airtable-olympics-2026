/**
 * ThemeToggle - 3-way theme toggle (Light / Dark / Auto)
 *
 * useTheme() hook manages preference state, resolves to actual mode,
 * persists to localStorage, and listens to prefers-color-scheme changes.
 *
 * ThemeToggle renders a fixed bottom-right button that cycles through modes.
 */
import { useState, useEffect, useCallback } from 'react';
import { track } from '../analytics';

const STORAGE_KEY = 'fantasy-olympics-theme';
const MODES = ['light', 'dark', 'auto'];

const ICONS = {
  light: '\u2600\uFE0F',  // ☀️
  dark: '\uD83C\uDF19',   // 🌙
  auto: '\uD83D\uDCBB',   // 💻
};

const LABELS = {
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto',
};

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && MODES.includes(stored)) return stored;
  } catch {
    // localStorage unavailable
  }
  return 'auto';
}

export function useTheme() {
  const [preference, setPreference] = useState(getStoredPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  // Listen for OS theme changes — uses both event listener and polling
  // because Airtable's iframe sandbox may not propagate matchMedia change events
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemTheme(mq.matches ? 'dark' : 'light');

    mq.addEventListener('change', update);

    // Poll every 2s as fallback for sandboxed iframes
    const poll = setInterval(update, 2000);

    return () => {
      mq.removeEventListener('change', update);
      clearInterval(poll);
    };
  }, []);

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // localStorage unavailable
    }
  }, [preference]);

  const resolved = preference === 'auto' ? systemTheme : preference;

  const cycle = useCallback(() => {
    setPreference((prev) => {
      const idx = MODES.indexOf(prev);
      const next = MODES[(idx + 1) % MODES.length];
      track('theme_toggled', { from: prev, to: next });
      return next;
    });
  }, []);

  return { preference, resolved, cycle };
}

export function ThemeToggle({ preference, onCycle }) {
  return (
    <button
      onClick={onCycle}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-default shadow-theme-sm text-secondary text-xs font-medium transition-all hover:shadow-theme-md"
      title={`Theme: ${LABELS[preference]}. Click to cycle.`}
      aria-label={`Current theme: ${LABELS[preference]}. Click to change.`}
    >
      <span>{ICONS[preference]}</span>
      <span>{LABELS[preference]}</span>
    </button>
  );
}
