import { PublicLayout as Shell } from '@shared/ui/components/layout/public-layout'
import { AppTitle } from '@/components/layout/app-title'
import { sidebarData } from '@/components/layout/data/sidebar-data'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      title={<AppTitle />}
      navItems={sidebarData.navItems}
      footerNavItems={sidebarData.footerNavItems}
    >
      {children}
    </Shell>
  )
}
