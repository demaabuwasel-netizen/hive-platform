import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import he from './locales/he.json'
import ar from './locales/ar.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'he', 'ar'],
    // LanguageDetector order: localStorage key 'hive_lang' → browser
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'hive_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,  // React handles XSS
    },
  })

export default i18n

// Direction map — used to set <html dir="...">
export const LANG_DIR = { en: 'ltr', he: 'rtl', ar: 'rtl' }
export const SUPPORTED_LANGS = [
  { code: 'en', label: 'English',        nativeLabel: 'English'   },
  { code: 'he', label: 'Hebrew',         nativeLabel: 'עברית'     },
  { code: 'ar', label: 'Arabic',         nativeLabel: 'العربية'   },
]
