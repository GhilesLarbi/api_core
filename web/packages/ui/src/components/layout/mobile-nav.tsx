import { Link, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@shared/ui/components/avatar'
import { findBestMatchingUrl, type SidebarData } from '@shared/ui/lib/nav'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type MobileNavProps = SidebarData & {
  avatar?: { src?: string | null; alt?: string; initials: string }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function MobileNav({
  navItems,
  footerNavItems,
  avatar,
}: MobileNavProps) {
  const { t } = useTranslation('nav')
  const currentPath = useLocation({ select: (location) => location.pathname })
  const items = [...navItems, ...footerNavItems]
  const active = findBestMatchingUrl(currentPath, items)

  return (
    <nav className='bg-sidebar border-sidebar-border fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] md:hidden'>
      <ul className='flex items-center justify-around'>
        {items.map((item) => {
          const isActive = item.url === active
          const Icon = (isActive && item.activeIcon) || item.icon
          return (
            <li key={item.url}>
              <Link
                to={item.url}
                aria-label={t(item.title)}
                title={t(item.title)}
                className={cn(
                  'flex items-center justify-center rounded-lg p-3 transition-colors',
                  '[&>svg]:size-6 [&>svg]:shrink-0',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.avatar && avatar ? (
                  <Avatar
                    className={cn(
                      'ring-offset-sidebar size-6 ring-offset-1',
                      isActive && 'ring-foreground ring-2'
                    )}
                  >
                    {avatar.src && (
                      <AvatarImage
                        src={avatar.src}
                        alt={avatar.alt}
                        className='object-cover'
                      />
                    )}
                    <AvatarFallback className='text-[10px] font-semibold'>
                      {avatar.initials}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  Icon && <Icon />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
