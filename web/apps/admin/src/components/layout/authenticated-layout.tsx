import { useAuthStore } from '@/stores/auth-store'
import { usePermissions } from '@/lib/permissions'

import { AuthenticatedLayout as Shell } from '@shared/ui/components/layout/authenticated-layout'
import { AppTitle } from '@/components/layout/app-title'
import {
  sidebarData,
  type GatedNavItem,
} from '@/components/layout/data/sidebar-data'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AuthenticatedLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  const admin = useAuthStore((s) => s.admin)
  const permissions = usePermissions()
  const fullName = admin && `${admin.first_name} ${admin.last_name}`

  const visible = ({ permission }: GatedNavItem) =>
    permission === undefined || permissions.includes(permission)

  return (
    <Shell
      title={<AppTitle />}
      navItems={sidebarData.navItems.filter(visible)}
      footerNavItems={sidebarData.footerNavItems.filter(visible)}
      avatar={{
        src: admin?.avatar_url,
        alt: fullName ?? undefined,
        initials: admin
          ? `${admin.first_name[0]}${admin.last_name[0]}`.toUpperCase()
          : '?',
      }}
    >
      {children}
    </Shell>
  )
}
