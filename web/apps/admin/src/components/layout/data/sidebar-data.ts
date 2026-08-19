import {
  MdAdminPanelSettings,
  MdArticle,
  MdHome,
  MdMenu,
  MdOutlineAdminPanelSettings,
  MdOutlineArticle,
  MdOutlineHome,
  MdOutlineMenu,
  MdOutlinePeople,
  MdPeople,
} from 'react-icons/md'

import { type NavItem } from '@shared/ui/lib/nav'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type GatedNavItem = NavItem & { permission?: PermissionPath }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const sidebarData: {
  navItems: GatedNavItem[]
  footerNavItems: GatedNavItem[]
} = {
  navItems: [
    {
      title: 'items.home',
      url: '/',
      icon: MdOutlineHome,
      activeIcon: MdHome,
    },
    {
      title: 'items.users',
      url: '/users',
      icon: MdOutlinePeople,
      activeIcon: MdPeople,
      permission: 'users.read',
    },
    {
      title: 'items.posts',
      url: '/posts',
      icon: MdOutlineArticle,
      activeIcon: MdArticle,
      permission: 'posts.read',
    },
    {
      title: 'items.admins',
      url: '/admins',
      icon: MdOutlineAdminPanelSettings,
      activeIcon: MdAdminPanelSettings,
      permission: 'admins.read',
    },
  ],
  footerNavItems: [
    {
      title: 'items.settings',
      url: '/settings',
      icon: MdOutlineMenu,
      activeIcon: MdMenu,
      avatar: true,
    },
  ],
}
