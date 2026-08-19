import { Outlet } from '@tanstack/react-router'

import { AppSidebar } from '@shared/ui/components/layout/app-sidebar'
import { MobileNav } from '@shared/ui/components/layout/mobile-nav'
import { SidebarProvider } from '@shared/ui/components/layout/sidebar'
import { SkipToMain } from '@shared/ui/components/skip-to-main'
import { SearchProvider } from '@shared/ui/context/search-provider'
import { getCookie } from '@shared/ui/lib/cookies'
import { type SidebarData } from '@shared/ui/lib/nav'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AuthenticatedLayoutProps = SidebarData & {
  title: React.ReactNode
  status?: React.ReactNode
  avatar?: { src?: string | null; alt?: string; initials: string }
  children?: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AuthenticatedLayout({
  title,
  status,
  navItems,
  footerNavItems,
  avatar,
  children,
}: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider navItems={navItems} footerNavItems={footerNavItems}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <div className='flex min-h-svh w-full'>
          <AppSidebar
            title={title}
            status={status}
            navItems={navItems}
            footerNavItems={footerNavItems}
          />
          <div
            id='content'
            className={cn(
              '@container/content',
              'flex min-w-0 flex-1 flex-col',

              'max-md:pb-16',

              'has-data-[layout=fixed]:h-svh has-data-[layout=fixed]:overflow-hidden',

              'md:has-data-[layout=fixed-md]:h-svh md:has-data-[layout=fixed-md]:overflow-hidden'
            )}
          >
            {status && <div className='px-4 pt-4 md:hidden'>{status}</div>}
            {children ?? <Outlet />}
          </div>
        </div>
        <MobileNav
          navItems={navItems}
          footerNavItems={footerNavItems}
          avatar={avatar}
        />
      </SidebarProvider>
    </SearchProvider>
  )
}
