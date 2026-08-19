import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { type NavItem } from '@shared/ui/lib/nav'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type NavMainProps = {
  items: NavItem[]
  active?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function NavMain({ items, active }: NavMainProps) {
  const { t } = useTranslation('nav')

  return (
    <ul className='flex w-full flex-col gap-2'>
      {items.map((item) => {
        const isActive = item.url === active
        const Icon = (isActive && item.activeIcon) || item.icon
        return (
          <li key={item.url}>
            <Link
              to={item.url}
              title={t(item.title)}
              className={cn(
                'flex w-full items-center gap-3 overflow-hidden rounded-lg px-4 py-3 text-base whitespace-nowrap transition-colors',
                '[&>svg]:size-6 [&>svg]:shrink-0',
                isActive
                  ? 'bg-foreground text-background font-medium'
                  : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              {Icon && <Icon />}
              <span className='min-w-0 truncate transition-opacity duration-200 group-data-[state=collapsed]/sidebar:opacity-0'>
                {t(item.title)}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
