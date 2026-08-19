import { useTranslation } from 'react-i18next'

import { AuthLayout } from '../auth-layout'
import { AuthLogo } from '../auth-logo'
import { UserAuthForm } from './components/user-auth-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SignIn() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout>
      <div className='flex flex-col items-center gap-6 sm:gap-8'>
        <AuthLogo />
        <h1 className='text-center text-2xl font-bold tracking-tight whitespace-pre-line sm:text-3xl'>
          {t('login.welcome')}
        </h1>
        <UserAuthForm className='w-full' />
      </div>
    </AuthLayout>
  )
}
