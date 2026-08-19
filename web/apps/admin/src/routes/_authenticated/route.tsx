import { adminMeQueryOptions } from '@/services/use-admin-auth'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { useAuthStore } from '@/stores/auth-store'
import { can } from '@/lib/permissions'

import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context: { queryClient }, matches }) => {
    const { accessToken, refreshToken } = useAuthStore.getState()
    if (!accessToken && !refreshToken) {
      throw redirect({ to: '/login' })
    }

    try {
      const admin = await queryClient.ensureQueryData(adminMeQueryOptions())
      useAuthStore.getState().setAdmin(admin)
    } catch {
      useAuthStore.getState().clear()
      throw redirect({ to: '/login' })
    }

    const forbidden = matches.some(
      ({ staticData }) =>
        staticData.permission !== undefined && !can(staticData.permission)
    )
    if (forbidden) {
      throw redirect({ to: '/403' })
    }
  },
  component: AuthenticatedLayout,
})
