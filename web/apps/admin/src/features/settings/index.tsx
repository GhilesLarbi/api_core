import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import {
  ChevronLeft,
  KeyRound,
  Languages,
  Palette,
  ScrollText,
  Settings2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/stores/auth-store'

import { Main } from '@shared/ui/components/layout/main'
import { SettingsIdentity } from '@shared/ui/features/settings/components/settings-identity'
import {
  SettingsNav,
  type SettingsNavGroup,
} from '@shared/ui/features/settings/components/settings-nav'
import { cn } from '@shared/ui/lib/utils'
import { SignOutDialog } from '@/components/sign-out-dialog'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const NAV_GROUPS: SettingsNavGroup[] = [
  {
    key: 'account',
    items: [{ key: 'security', to: '/settings/security', icon: KeyRound }],
  },
  {
    key: 'app',
    items: [{ key: 'appConfig', to: '/settings/app-config', icon: Settings2 }],
  },
  {
    key: 'personalization',
    items: [
      { key: 'appearance', to: '/settings/appearance', icon: Palette },
      { key: 'language', to: '/settings/language', icon: Languages },
    ],
  },
  {
    key: 'more',
    items: [{ key: 'legal', to: '/settings/legal', icon: ScrollText }],
  },
]

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Settings() {
  const { t } = useTranslation('settings')
  const admin = useAuthStore((s) => s.admin)
  const currentPath = useLocation({ select: (location) => location.pathname })
  const isIndex = currentPath === '/settings' || currentPath === '/settings/'

  return (
    <Main fixed='md' fluid className='p-0 md:pt-0'>
      <div className='flex flex-1 md:overflow-hidden'>
        <aside
          className={cn(
            'w-full shrink-0 px-4 pt-6 pb-4 md:w-64 md:overflow-y-auto md:border-e md:pt-16 lg:w-72',
            !isIndex && 'max-md:hidden'
          )}
        >
          <h1 className='mb-4 px-4 text-2xl font-bold tracking-tight'>
            {t('title')}
          </h1>
          <SettingsIdentity
            name={
              [admin?.first_name, admin?.last_name].filter(Boolean).join(' ') ||
              (admin?.email ?? '')
            }
            avatarUrl={admin?.avatar_url}
            to='/settings/profile'
            itemKey='profile'
          />
          <SettingsNav
            groups={NAV_GROUPS}
            signOutDialog={(props) => <SignOutDialog {...props} />}
          />
        </aside>
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col px-4 pt-6 pb-6 md:pt-16',
            isIndex && 'max-md:hidden'
          )}
        >
          <Link
            to='/settings'
            aria-label={t('title')}
            className='text-muted-foreground hover:text-foreground -ms-3 mb-4 flex size-11 items-center justify-center md:hidden'
          >
            <ChevronLeft className='size-5 rtl:rotate-180' />
          </Link>
          <Outlet />
        </div>
      </div>
    </Main>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsIndex() {
  const navigate = useNavigate()

  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      navigate({ to: '/settings/profile', replace: true })
    }
  }, [navigate])

  return null
}
