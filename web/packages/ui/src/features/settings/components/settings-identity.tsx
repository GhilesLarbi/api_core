import { Link } from '@tanstack/react-router'
import { ChevronRight, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@shared/ui/components/avatar'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type SettingsIdentityProps = {
  name: string
  avatarUrl?: string | null
  to: string
  itemKey: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsIdentity({
  name,
  avatarUrl,
  to,
  itemKey,
}: SettingsIdentityProps) {
  const { t } = useTranslation('settings')
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className='bg-card mb-6 overflow-hidden rounded-lg border'>
      <div className='flex items-center gap-3 px-4 py-3'>
        <Avatar size='lg' className='shrink-0 border'>
          {avatarUrl && <AvatarImage src={avatarUrl} alt='' />}
          <AvatarFallback className='text-xs font-semibold'>
            {initials || <UserRound className='size-4' />}
          </AvatarFallback>
        </Avatar>
        <p className='min-w-0 truncate text-lg font-semibold'>{name}</p>
      </div>
      <Link
        to={to}
        className='hover:bg-sidebar-accent/50 flex w-full items-center gap-3 border-t px-4 py-2.5 text-sm transition-colors'
      >
        <UserRound className='size-4 shrink-0' />
        <span className='truncate'>{t(`nav.${itemKey}`)}</span>
        <ChevronRight className='ms-auto size-4 shrink-0 opacity-60 rtl:rotate-180' />
      </Link>
    </div>
  )
}
