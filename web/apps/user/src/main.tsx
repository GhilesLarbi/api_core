import { setOnAuthFailure } from '@/lib/api-client'

import { createApp } from '@shared/ui/lib/create-app'

import './i18n/config'

import { routeTree } from './routeTree.gen'

import './styles/index.css'

createApp({ routeTree, setOnAuthFailure, redirectOnAuthFailure: false })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createApp<typeof routeTree>>
  }
}
