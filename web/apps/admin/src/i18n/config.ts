import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { SHARED_NAMESPACES, withSharedResources } from '@shared/ui/lib/i18n'
import {
  LANGUAGE_COOKIE_NAME,
  SUPPORTED_LANGUAGES,
} from '@shared/ui/lib/languages'

import arAdmins from './locales/ar/admins.json'
import arAuth from './locales/ar/auth.json'
import arErrors from './locales/ar/errors.json'
import arLegal from './locales/ar/legal.json'
import arNav from './locales/ar/nav.json'
import arPosts from './locales/ar/posts.json'
import arSettings from './locales/ar/settings.json'
import arUsers from './locales/ar/users.json'
import enAdmins from './locales/en/admins.json'
import enAuth from './locales/en/auth.json'
import enErrors from './locales/en/errors.json'
import enLegal from './locales/en/legal.json'
import enNav from './locales/en/nav.json'
import enPosts from './locales/en/posts.json'
import enSettings from './locales/en/settings.json'
import enUsers from './locales/en/users.json'
import frAdmins from './locales/fr/admins.json'
import frAuth from './locales/fr/auth.json'
import frErrors from './locales/fr/errors.json'
import frLegal from './locales/fr/legal.json'
import frNav from './locales/fr/nav.json'
import frPosts from './locales/fr/posts.json'
import frSettings from './locales/fr/settings.json'
import frUsers from './locales/fr/users.json'

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
  'admins',
  'users',
  'posts',
  'settings',
  'errors',
  'legal',
] as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const resources = withSharedResources({
  en: {
    nav: enNav,
    auth: enAuth,
    admins: enAdmins,
    users: enUsers,
    posts: enPosts,
    settings: enSettings,
    errors: enErrors,
    legal: enLegal,
  },
  fr: {
    nav: frNav,
    auth: frAuth,
    admins: frAdmins,
    users: frUsers,
    posts: frPosts,
    settings: frSettings,
    errors: frErrors,
    legal: frLegal,
  },
  ar: {
    nav: arNav,
    auth: arAuth,
    admins: arAdmins,
    users: arUsers,
    posts: arPosts,
    settings: arSettings,
    errors: arErrors,
    legal: arLegal,
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
