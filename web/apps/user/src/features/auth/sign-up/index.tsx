import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AuthLayout } from '../auth-layout'
import { AuthLogo } from '../auth-logo'
import { SignUpForm } from './components/sign-up-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SignUp() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout>
      <div className='flex flex-col items-center gap-6 sm:gap-8'>
        <AuthLogo />
        <h1 className='text-center text-2xl font-bold tracking-tight whitespace-pre-line sm:text-3xl'>
          {t('signUp.title')}
        </h1>
        <SignUpForm className='w-full' />
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
