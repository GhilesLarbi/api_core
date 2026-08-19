import i18n from '@/i18n/config'
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { useAuthStore } from '@/stores/auth-store'

import { apiBaseUrl } from './config'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const ApiRoutes = {
  adminAuth: {
    login: '/api/v1/admin/login',
    refresh: '/api/v1/admin/refresh',
    me: '/api/v1/admin/me',
    update: '/api/v1/admin',
    sessions: '/api/v1/admin/sessions',
    sessionsLogout: '/api/v1/admin/sessions/logout',
  },
  admins: {
    list: '/api/v1/admin/admins',
    create: '/api/v1/admin/admins',
    update: (adminId: string) => `/api/v1/admin/admins/${adminId}`,
    delete: (adminId: string) => `/api/v1/admin/admins/${adminId}`,
    password: (adminId: string) => `/api/v1/admin/admins/${adminId}/password`,
    permissions: (adminId: string) =>
      `/api/v1/admin/admins/${adminId}/permissions`,
  },
  permissions: {
    list: '/api/v1/admin/permissions',
  },
  users: {
    list: '/api/v1/admin/users',
    create: '/api/v1/admin/users',
    update: (userId: string) => `/api/v1/admin/users/${userId}`,
    delete: (userId: string) => `/api/v1/admin/users/${userId}`,
  },
  posts: {
    list: '/api/v1/admin/posts',
    update: (postId: string) => `/api/v1/admin/posts/${postId}`,
    delete: (postId: string) => `/api/v1/admin/posts/${postId}`,
  },
  appConfig: {
    get: '/api/v1/admin/app-config',
    update: '/api/v1/admin/app-config',
  },
  storage: {
    presignUrl: '/api/v1/admin/storage/presign-url',
  },
} as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  paramsSerializer: { indexes: null },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  config.headers.set('Accept-Language', i18n.language)
  return config
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
let refreshPromise: Promise<string> | null = null

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
let onAuthFailure: (() => void) | null = null

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function setOnAuthFailure(handler: () => void) {
  onAuthFailure = handler
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.endsWith(ApiRoutes.adminAuth.login) ||
    url.endsWith(ApiRoutes.adminAuth.refresh)
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) throw new Error('No refresh token')

  const form = new URLSearchParams()
  form.set('grant_type', 'refresh_token')
  form.set('refresh_token', refreshToken)

  const { data } = await axios.post<AdminTokenResponse>(
    `${apiBaseUrl}${ApiRoutes.adminAuth.refresh}`,
    form
  )

  useAuthStore.getState().setSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    admin: data.admin,
  })
  return data.access_token
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retried ||
      isAuthEndpoint(original.url)
    ) {
      return Promise.reject(error)
    }

    original._retried = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newToken = await refreshPromise
      original.headers.set('Authorization', `Bearer ${newToken}`)
      return apiClient(original as AxiosRequestConfig)
    } catch (refreshError) {
      useAuthStore.getState().clear()
      onAuthFailure?.()
      return Promise.reject(refreshError)
    }
  }
)
