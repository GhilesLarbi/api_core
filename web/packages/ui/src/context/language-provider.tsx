import { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import {
  isRtl,
  SUPPORTED_LANGUAGES,
  type Language,
} from '@shared/ui/lib/languages'

import { useDirection } from './direction-provider'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LanguageContextType = {
  language: Language
  setLanguage: (lng: Language) => void
  supported: readonly Language[]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const LanguageContext = createContext<LanguageContextType | null>(null)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function resolveLanguage(raw: string | undefined): Language {
  const base = (raw ?? 'en').split('-')[0] as Language
  return SUPPORTED_LANGUAGES.includes(base) ? base : 'en'
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const { setDir } = useDirection()
  const queryClient = useQueryClient()
  const [language, _setLanguage] = useState<Language>(() =>
    resolveLanguage(i18n.language)
  )

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    setDir(isRtl(language) ? 'rtl' : 'ltr')
  }, [language, setDir])

  useEffect(() => {
    const onChange = (lng: string) => {
      _setLanguage(resolveLanguage(lng))
      queryClient.invalidateQueries({
        predicate: (query) => query.meta?.localized === true,
      })
    }
    i18n.on('languageChanged', onChange)
    return () => {
      i18n.off('languageChanged', onChange)
    }
  }, [i18n, queryClient])

  const setLanguage = (lng: Language) => {
    i18n.changeLanguage(lng)
  }

  return (
    <LanguageContext
      value={{ language, setLanguage, supported: SUPPORTED_LANGUAGES }}
    >
      {children}
    </LanguageContext>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
