import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import { NavigationProgress } from '@shared/ui/components/navigation-progress'
import { GeneralError } from '@shared/ui/features/errors/general-error'
import { NotFoundError } from '@shared/ui/features/errors/not-found-error'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function RootLayout() {
  return (
    <>
      <NavigationProgress />
      <Outlet />
    </>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootLayout,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
