import { StrictMode } from 'react'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  createRouter,
  RouterProvider,
  type AnyRoute,
} from '@tanstack/react-router'
import { AxiosError } from 'axios'
import ReactDOM from 'react-dom/client'

import { ErrorDialog } from '@shared/ui/components/error-dialog'
import { DirectionProvider } from '@shared/ui/context/direction-provider'
import { FontProvider } from '@shared/ui/context/font-provider'
import { FontSizeProvider } from '@shared/ui/context/font-size-provider'
import { LanguageProvider } from '@shared/ui/context/language-provider'
import { ThemeProvider } from '@shared/ui/context/theme-provider'
import { useErrorDialog } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type CreateAppOptions<TRouteTree extends AnyRoute> = {
  routeTree: TRouteTree
  setOnAuthFailure: (handler: () => void) => void
  redirectOnAuthFailure?: boolean
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function createApp<TRouteTree extends AnyRoute>({
  routeTree,
  setOnAuthFailure,
  redirectOnAuthFailure = true,
}: CreateAppOptions<TRouteTree>) {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.options.meta?.skipGlobalError) return
        useErrorDialog.getState().showError(error)
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (failureCount >= 0 && import.meta.env.DEV) return false
          if (failureCount > 3 && import.meta.env.PROD) return false
          return !(
            error instanceof AxiosError &&
            [401, 403].includes(error.response?.status ?? 0)
          )
        },
        refetchOnWindowFocus: import.meta.env.PROD,
        staleTime: 10 * 1000,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.skipGlobalError) return
        if (error instanceof AxiosError && error.response?.status === 500) {
          useErrorDialog.getState().showError(error)
          if (import.meta.env.PROD) router.navigate({ to: '/500' })
        }
      },
    }),
  })

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  if (redirectOnAuthFailure) {
    setOnAuthFailure(() => {
      router.navigate({ to: '/login', replace: true })
    })
  }

  const rootElement = document.getElementById('root')!
  if (!rootElement.innerHTML) {
    ReactDOM.createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <FontProvider>
              <FontSizeProvider>
                <DirectionProvider>
                  <LanguageProvider>
                    <RouterProvider router={router} />
                    <ErrorDialog />
                  </LanguageProvider>
                </DirectionProvider>
              </FontSizeProvider>
            </FontProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </StrictMode>
    )
  }

  return router
}
