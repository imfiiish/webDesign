import { useEffect, useState } from 'react'

/** The concrete theme currently painted: reads <html data-theme> and keeps
 *  in sync when it changes (see src/theme.ts). */
export function useResolvedTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    const el = document.documentElement
    const read = () => setTheme(el.dataset.theme === 'dark' ? 'dark' : 'light')
    read()
    const mo = new MutationObserver(read)
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  }, [])

  return theme
}
