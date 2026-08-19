import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ListRow } from '@shared/ui/components/list-row'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type SettingsNavGroup = {
  key: string
  items: {
    key: string
    to: string
    icon?: React.ElementType
  }[]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type SettingsNavProps = {
  groups: SettingsNavGroup[]
  signOutDialog: (props: {
    open: boolean
    onOpenChange: (open: boolean) => void
  }) => React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsNav({ groups, signOutDialog }: SettingsNavProps) {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const [signOutOpen, setSignOutOpen] = useState(false)

  return (
    <nav className='space-y-6'>
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className='mb-2 px-4 text-sm font-semibold'>
            {t(`nav.groups.${group.key}`)}
          </h3>
          <ul className='space-y-1'>
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className='hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground flex w-full items-center gap-3 rounded-[6px] px-4 py-2.5 text-sm transition-colors'
                >
                  {item.icon && <item.icon className='size-4 shrink-0' />}
                  <span className='truncate'>{t(`nav.${item.key}`)}</span>
                  <ChevronRight className='ms-auto size-4 shrink-0 opacity-60 md:hidden rtl:rotate-180' />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <ListRow
        tone='destructive'
        onClick={() => setSignOutOpen(true)}
        leading={<LogOut className='size-4 shrink-0 rtl:rotate-180' />}
        label={
          <span className='font-medium'>{tCommon('actions.signOut')}</span>
        }
      />

      {signOutDialog({ open: signOutOpen, onOpenChange: setSignOutOpen })}
    </nav>
  )
}
