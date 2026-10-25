const STORAGE_KEY = 'admin-theme-mode';
const EVENT_NAME = 'admin-theme-mode-change';

export type ThemeMode = 'light' | 'dark';

function readStored(): ThemeMode | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch (error) {
    return null;
  }
}

function systemPrefersDark() {
  return Boolean(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
}

export function getThemeMode(): ThemeMode {
  return readStored() || (systemPrefersDark() ? 'dark' : 'light');
}

export function applyThemeMode(mode: ThemeMode = getThemeMode()) {
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.style.setProperty('color-scheme', mode);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', mode === 'dark' ? '#0b0d14' : '#ffffff');
  }
}

export function setThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (error) {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
  applyThemeMode(mode);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: mode }));
}

export function toggleThemeMode() {
  setThemeMode(getThemeMode() === 'dark' ? 'light' : 'dark');
}

export function subscribeThemeMode(listener: (mode: ThemeMode) => void) {
  const handler = () => listener(getThemeMode());
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
