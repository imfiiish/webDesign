// Theme mode: auto (follow system) / light / dark, persisted to localStorage.
// The html data-theme attribute drives the CSS tokens (see tokens.css).

export type ThemeMode = 'auto' | 'light' | 'dark'

// Must match the key used by the first-paint script in index.html.
const KEY = 'design-theme'

export function getThemeMode(): ThemeMode {
  const v = localStorage.getItem(KEY)
  return v === 'light' || v === 'dark' ? v : 'auto'
}

export function saveThemeMode(mode: ThemeMode): void {
  localStorage.setItem(KEY, mode)
}

/** Resolve a mode to the concrete light / dark that should be applied. */
export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'auto') return mode
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** Write the resolved theme to <html data-theme>. */
export function applyTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = resolveTheme(mode)
}
