import arCommon from '../locales/ar/common.json'
import arDashboard from '../locales/ar/dashboard.json'
import arNav from '../locales/ar/nav.json'
import enCommon from '../locales/en/common.json'
import enDashboard from '../locales/en/dashboard.json'
import enNav from '../locales/en/nav.json'
import frCommon from '../locales/fr/common.json'
import frDashboard from '../locales/fr/dashboard.json'
import frNav from '../locales/fr/nav.json'
import { SUPPORTED_LANGUAGES, type Language } from './languages'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type Bundle = Record<string, unknown>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type Resources = Record<string, Record<string, Bundle>>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const SHARED_NAMESPACES = ['common', 'nav', 'dashboard'] as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const sharedResources: Resources = {
  en: {
    common: enCommon,
    nav: enNav,
    dashboard: enDashboard,
  },
  fr: {
    common: frCommon,
    nav: frNav,
    dashboard: frDashboard,
  },
  ar: {
    common: arCommon,
    nav: arNav,
    dashboard: arDashboard,
  },
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function merge(base: Bundle, override: Bundle): Bundle {
  const out: Bundle = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key]
    const bothPlainObjects =
      existing !== null &&
      typeof existing === 'object' &&
      !Array.isArray(existing) &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    out[key] = bothPlainObjects
      ? merge(existing as Bundle, value as Bundle)
      : value
  }
  return out
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function withSharedResources(appResources: Resources): Resources {
  const out: Resources = {}
  for (const lang of SUPPORTED_LANGUAGES as readonly Language[]) {
    const shared = sharedResources[lang] ?? {}
    const app = appResources[lang] ?? {}
    const namespaces: Record<string, Bundle> = { ...shared }
    for (const [ns, bundle] of Object.entries(app)) {
      namespaces[ns] = namespaces[ns] ? merge(namespaces[ns], bundle) : bundle
    }
    out[lang] = namespaces
  }
  return out
}
