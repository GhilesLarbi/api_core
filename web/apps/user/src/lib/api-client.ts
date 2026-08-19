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
  userAuth: {
    register: '/api/v1/user',
    me: '/api/v1/user/me',
    update: '/api/v1/user',
    login: '/api/v1/user/login',
    refresh: '/api/v1/user/refresh',
    forgotPassword: '/api/v1/user/forgot-password',
    resetPassword: '/api/v1/user/reset-password',
    changePassword: '/api/v1/user/password',
    emailChange: '/api/v1/user/email-change',
    resendVerification: '/api/v1/user/resend-verification',
    sessions: '/api/v1/user/sessions',
    sessionsLogout: '/api/v1/user/sessions/logout',
    delete: '/api/v1/user',
  },
  publicPosts: {
    list: '/api/v1/public/posts',
  },
  userPosts: {
    create: '/api/v1/user/posts',
    saved: '/api/v1/user/posts/saved',
    save: (postId: string) => `/api/v1/user/posts/${postId}/save`,
    unsave: (postId: string) => `/api/v1/user/posts/${postId}/save`,
  },
  publicStorage: {
    presignUrl: '/api/v1/public/storage/presign-url',
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
    url.endsWith(ApiRoutes.userAuth.login) ||
    url.endsWith(ApiRoutes.userAuth.refresh)
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

  const { data } = await axios.post<UserTokenResponse>(
    `${apiBaseUrl}${ApiRoutes.userAuth.refresh}`,
    form
  )

  useAuthStore.getState().setSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
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
