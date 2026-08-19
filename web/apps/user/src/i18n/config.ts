import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { SHARED_NAMESPACES, withSharedResources } from '@shared/ui/lib/i18n'
import {
  LANGUAGE_COOKIE_NAME,
  SUPPORTED_LANGUAGES,
} from '@shared/ui/lib/languages'

import arAuth from './locales/ar/auth.json'
import arCommon from './locales/ar/common.json'
import arErrors from './locales/ar/errors.json'
import arFooter from './locales/ar/footer.json'
import arHome from './locales/ar/home.json'
import arLegal from './locales/ar/legal.json'
import arNav from './locales/ar/nav.json'
import arPosts from './locales/ar/posts.json'
import arSettings from './locales/ar/settings.json'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enErrors from './locales/en/errors.json'
import enFooter from './locales/en/footer.json'
import enHome from './locales/en/home.json'
import enLegal from './locales/en/legal.json'
import enNav from './locales/en/nav.json'
import enPosts from './locales/en/posts.json'
import enSettings from './locales/en/settings.json'
import frAuth from './locales/fr/auth.json'
import frCommon from './locales/fr/common.json'
import frErrors from './locales/fr/errors.json'
import frFooter from './locales/fr/footer.json'
import frHome from './locales/fr/home.json'
import frLegal from './locales/fr/legal.json'
import frNav from './locales/fr/nav.json'
import frPosts from './locales/fr/posts.json'
import frSettings from './locales/fr/settings.json'

export {
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  LANGUAGE_LABELS,
  LANGUAGE_COOKIE_NAME,
  isRtl,
  type Language,
} from '@shared/ui/lib/languages'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const NAMESPACES = [
  ...SHARED_NAMESPACES,
  'auth',
  'errors',
  'footer',
  'home',
  'legal',
  'posts',
  'settings',
] as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const resources = withSharedResources({
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    errors: enErrors,
    footer: enFooter,
    home: enHome,
    legal: enLegal,
    posts: enPosts,
    settings: enSettings,
  },
  fr: {
    common: frCommon,
    nav: frNav,
    auth: frAuth,
    errors: frErrors,
    footer: frFooter,
    home: frHome,
    legal: frLegal,
    posts: frPosts,
    settings: frSettings,
  },
  ar: {
    common: arCommon,
    nav: arNav,
    auth: arAuth,
    errors: arErrors,
    footer: arFooter,
    home: arHome,
    legal: arLegal,
    posts: arPosts,
    settings: arSettings,
  },
})

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    ns: NAMESPACES as unknown as string[],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
      lookupCookie: LANGUAGE_COOKIE_NAME,
      lookupLocalStorage: LANGUAGE_COOKIE_NAME,
      cookieMinutes: 60 * 24 * 365,
    },
    returnNull: false,
  })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export default i18n
