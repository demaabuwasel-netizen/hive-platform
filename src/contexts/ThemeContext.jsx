import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import i18n, { LANG_DIR } from '../i18n/index'

const ThemeContext = createContext(null)

/**
 * Applies the active theme to <html data-theme="..."> and the active
 * language direction to <html dir="...">. Both are read from context.
 *
 * Supabase persistence is handled by AppContext (which calls
 * savePreferences when the user is signed in).
 */
export function ThemeProvider({ children }) {
  const [theme, _setTheme] = useState(() => {
    return localStorage.getItem('hive_theme') || 'system'
  })
  const [lang, _setLang] = useState(() => {
    return localStorage.getItem('hive_lang') || 'en'
  })

  // Derived: resolved theme (system → light or dark based on OS)
  const resolvedTheme = (() => {
    if (theme === 'system') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  })()

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', resolvedTheme)
    // Also set Tailwind dark class for components that use dark: prefix
    if (resolvedTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [resolvedTheme])

  // Apply direction to <html>
  useEffect(() => {
    document.documentElement.dir = LANG_DIR[lang] || 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  // Listen for OS theme changes when using 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const html = document.documentElement
      html.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
      if (mq.matches) html.classList.add('dark')
      else html.classList.remove('dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t) => {
    _setTheme(t)
    localStorage.setItem('hive_theme', t)
  }, [])

  const setLang = useCallback((l) => {
    _setLang(l)
    localStorage.setItem('hive_lang', l)
    i18n.changeLanguage(l)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, lang, setLang }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
