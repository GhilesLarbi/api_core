import { createFileRoute, redirect } from '@tanstack/react-router'

import { useAuthStore } from '@/stores/auth-store'
import { Settings } from '@/features/settings'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const Route = createFileRoute('/settings')({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: Settings,
})
