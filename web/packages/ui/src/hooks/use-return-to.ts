import * as React from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { safeDestination } from '@shared/ui/lib/return-to'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function useReturnTo(fallback = '/') {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { redirect?: string }
  const to = safeDestination(search.redirect) ?? fallback

  const resume = React.useCallback(
    () => void navigate({ to, replace: true }),
    [navigate, to]
  )

  return { to, resume }
}
