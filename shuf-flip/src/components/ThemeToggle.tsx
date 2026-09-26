import { useEffect, useState } from 'react'
import {
  applyTheme,
  getThemeMode,
  saveThemeMode,
  type ThemeMode,
} from '../theme'

const LABEL: Record<ThemeMode, string> = {
  auto: 'Auto',
  light: 'Light',
  dark: 'Dark',
}

function nextMode(mode: ThemeMode): ThemeMode {
  if (mode === 'auto') return 'light'
  if (mode === 'light') return 'dark'
  return 'auto'
}

/** Auto / light / dark cycle button. */
export default function ThemeToggle({ className = 'tbtn' }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>(getThemeMode)

  useEffect(() => {
    applyTheme(mode)
    saveThemeMode(mode)
  }, [mode])

  return (
    <button
      type="button"
      className={className}
      onClick={() => setMode((m) => nextMode(m))}
      aria-label={`Theme: ${LABEL[mode]}. Click to switch.`}
      title={`Theme: ${LABEL[mode]} (click to switch)`}
    >
      {LABEL[mode]}
    </button>
  )
}
