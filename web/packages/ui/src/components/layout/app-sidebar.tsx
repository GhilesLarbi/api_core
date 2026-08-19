import { useLocation } from '@tanstack/react-router'

import { findBestMatchingUrl, type SidebarData } from '@shared/ui/lib/nav'

import { NavMain } from './nav-main'
import { useSidebar } from './sidebar'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AppSidebarProps = SidebarData & {
  title: React.ReactNode
  status?: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AppSidebar({
  title,
  status,
  navItems,
  footerNavItems,
}: AppSidebarProps) {
  const { open } = useSidebar()
  const currentPath = useLocation({ select: (location) => location.pathname })
  const active = findBestMatchingUrl(currentPath, [
    ...navItems,
    ...footerNavItems,
  ])

  return (
    <aside
      data-state={open ? 'expanded' : 'collapsed'}
      className='group/sidebar sticky top-0 hidden h-svh w-72 shrink-0 p-4 transition-[width] duration-200 ease-linear data-[state=collapsed]:w-30 md:block'
    >
      <div className='text-sidebar-foreground from-sidebar shadow-sidebar rtl:shadow-sidebar-rtl flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-l from-20% to-transparent px-4 py-8 transition-[padding] duration-200 ease-linear group-data-[state=collapsed]/sidebar:py-4 rtl:bg-gradient-to-r'>
        <div className='flex h-full min-h-0 flex-col'>
          <div className='shrink-0'>
            {title}
            {status && (
              <div className='mt-4 group-data-[state=collapsed]/sidebar:hidden'>
                {status}
              </div>
            )}
          </div>
          <div className='flex min-h-0 flex-1 items-center overflow-y-auto'>
            <NavMain items={navItems} active={active} />
          </div>
          <NavMain items={footerNavItems} active={active} />
        </div>
      </div>
    </aside>
  )
}
