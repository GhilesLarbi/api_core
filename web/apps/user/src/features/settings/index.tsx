import { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import {
  ChevronLeft,
  KeyRound,
  Languages,
  Mail,
  Palette,
  ScrollText,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/stores/auth-store'

import { SettingsIdentity } from '@shared/ui/features/settings/components/settings-identity'
import {
  SettingsNav,
  type SettingsNavGroup,
} from '@shared/ui/features/settings/components/settings-nav'
import { cn } from '@shared/ui/lib/utils'
import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { PublicLayout } from '@/components/layout/public-layout'
import { SignOutDialog } from '@/components/sign-out-dialog'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const NAV_GROUPS: SettingsNavGroup[] = [
  {
    key: 'account',
    items: [
      { key: 'email', to: '/settings/email', icon: Mail },
      { key: 'security', to: '/settings/security', icon: KeyRound },
    ],
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
  const user = useAuthStore((s) => s.user)
  const currentPath = useLocation({ select: (location) => location.pathname })
  const isIndex = currentPath === '/settings' || currentPath === '/settings/'

  return (
    <PublicLayout>
      <Navbar />
      <main className='flex-1'>
        <Container className='py-8 md:flex md:gap-8 lg:gap-12'>
          <aside
            className={cn(
              'w-full shrink-0 md:w-64 lg:w-72',
              !isIndex && 'max-md:hidden'
            )}
          >
            <h1 className='mb-4 px-4 text-2xl font-bold tracking-tight'>
              {t('title')}
            </h1>
            <SettingsIdentity
              name={
                [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
                (user?.email ?? '')
              }
              avatarUrl={user?.avatar_url}
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
              'flex min-h-0 min-w-0 flex-1 flex-col',
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
        </Container>
      </main>
      <Footer />
    </PublicLayout>
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
