import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LogIn, LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/stores/auth-store'

import { Button } from '@shared/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/components/dropdown-menu'
import { Media } from '@shared/ui/components/media'
import { useMediaQuery } from '@shared/ui/hooks/use-media-query'
import { SignOutDialog } from '@/components/sign-out-dialog'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function UserMenu() {
  const { t } = useTranslation('nav')
  const user = useAuthStore((s) => s.user)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const roomForLabel = useMediaQuery('(min-width: 48rem)')

  if (!user) {
    if (!roomForLabel) {
      return (
        <Button variant='outline' size='icon' shape='circle' asChild>
          <Link to='/login' aria-label={t('account.signIn')}>
            <LogIn />
          </Link>
        </Button>
      )
    }

    return (
      <Button variant='outline' asChild>
        <Link to='/login'>{t('account.signIn')}</Link>
      </Button>
    )
  }

  const name =
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            shape='circle'
            aria-label={t('account.menu')}
          >
            <Media kind='person' src={user.avatar_url} name={name} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem asChild>
            <Link to='/settings'>
              <User />
              {t('account.settings')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSignOutOpen(true)}>
            <LogOut />
            {t('account.signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  )
}
