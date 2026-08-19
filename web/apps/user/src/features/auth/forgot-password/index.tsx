import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AuthLayout } from '../auth-layout'
import { AuthLogo } from '../auth-logo'
import { ForgotPasswordForm } from './components/forgot-password-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ForgotPassword() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout>
      <div className='flex flex-col items-center gap-6'>
        <AuthLogo />
        <h1 className='text-center text-2xl font-bold tracking-tight sm:text-3xl'>
          {t('forgotPassword.title')}
        </h1>
        <p className='max-w-xs text-center text-sm'>
          {t('forgotPassword.description')}
        </p>
        <ForgotPasswordForm className='w-full' />
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
