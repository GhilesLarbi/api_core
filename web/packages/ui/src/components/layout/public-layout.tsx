import { LanguageSwitch } from '@shared/ui/components/language-switch'
import { AppSidebar } from '@shared/ui/components/layout/app-sidebar'
import { Header } from '@shared/ui/components/layout/header'
import { MobileNav } from '@shared/ui/components/layout/mobile-nav'
import { SidebarProvider } from '@shared/ui/components/layout/sidebar'
import { SkipToMain } from '@shared/ui/components/skip-to-main'
import { ThemeSwitch } from '@shared/ui/components/theme-switch'
import { getCookie } from '@shared/ui/lib/cookies'
import { type SidebarData } from '@shared/ui/lib/nav'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PublicLayoutProps = SidebarData & {
  title: React.ReactNode
  children: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PublicLayout({
  title,
  navItems,
  footerNavItems,
  children,
}: PublicLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SkipToMain />
      <div className='flex min-h-svh w-full'>
        <AppSidebar
          title={title}
          navItems={navItems}
          footerNavItems={footerNavItems}
        />
        <div
          id='content'
          className={cn(
            '@container/content',
            'flex min-w-0 flex-1 flex-col',
            'max-md:pb-16',
            'has-data-[layout=fixed]:h-svh'
          )}
        >
          <Header fixed>
            <div className='ms-auto flex items-center space-x-4'>
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
          </Header>
          {children}
        </div>
      </div>
      <MobileNav navItems={navItems} footerNavItems={footerNavItems} />
    </SidebarProvider>
  )
}
