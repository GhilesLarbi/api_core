import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { useAuthStore } from '@/stores/auth-store'

import { returnToSearch } from '@shared/ui/lib/return-to'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const Route = createFileRoute('/_auth')({
  validateSearch: returnToSearch,
  beforeLoad: ({ search }) => {
    if (!useAuthStore.getState().accessToken) return
    throw redirect({ to: search.redirect ?? '/', replace: true })
  },
  component: Outlet,
})
