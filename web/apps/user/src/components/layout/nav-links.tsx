import { Link, useMatchRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { cn } from '@shared/ui/lib/utils'
import { navItems, type NavItem } from '@/components/layout/data/nav-items'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function NavLinks({ className }: { className?: string }) {
  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {navItems.map((item) => (
        <NavLinksItem key={item.key} item={item} />
      ))}
    </nav>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function NavLinksItem({ item }: { item: NavItem }) {
  const { t } = useTranslation('nav')
  const matchRoute = useMatchRoute()
  const Icon = item.icon
  const label = t(`items.${item.key}`)

  if (!item.to) {
    return (
      <Button variant='ghost' disabled>
        <Icon />
        <span className='max-sm:sr-only'>{label}</span>
      </Button>
    )
  }

  const active = Boolean(matchRoute({ to: item.to, fuzzy: item.to !== '/' }))

  return (
    <Button variant={active ? 'plain' : 'ghost'} asChild>
      <Link to={item.to}>
        <Icon />
        <span className='max-sm:sr-only'>{label}</span>
      </Link>
    </Button>
  )
}
