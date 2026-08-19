import { getRouteApi, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AuthLayout } from '../auth-layout'
import { ResetPasswordForm } from './components/reset-password-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const routeApi = getRouteApi('/_auth/reset-password')

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ResetPassword() {
  const { t } = useTranslation('auth')
  const { token } = routeApi.useSearch()

  return (
    <AuthLayout>
      <div className='flex flex-col items-center gap-6'>
        <h1 className='text-center text-2xl font-bold tracking-tight sm:text-3xl'>
          {t('resetPassword.title')}
        </h1>
        <p className='max-w-xs text-center text-sm'>
          {t('resetPassword.description')}
        </p>
        <ResetPasswordForm className='w-full' token={token} />
        <Link
          to='/login'
          search={(prev) => prev}
          className='text-brand text-center text-sm font-semibold hover:opacity-80'
        >
          {t('login.returnToLogin')}
        </Link>
      </div>
    </AuthLayout>
  )
}
