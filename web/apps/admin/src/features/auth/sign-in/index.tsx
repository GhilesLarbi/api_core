import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Logo } from '@shared/ui/components/logo'

import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SignIn() {
  const { t } = useTranslation('auth')
  const { redirect } = useSearch({ from: '/login' })

  return (
    <AuthLayout>
      <div className='flex flex-col items-center gap-8'>
        <Logo className='size-32 [filter:drop-shadow(0_8px_10px_color-mix(in_srgb,var(--brand)_35%,transparent))_drop-shadow(0_20px_32px_color-mix(in_srgb,var(--brand)_45%,transparent))]' />
        <h1 className='text-center text-3xl font-bold tracking-tight whitespace-pre-line'>
          {t('login.welcome')}
        </h1>
        <UserAuthForm redirectTo={redirect} className='w-full' />
      </div>
    </AuthLayout>
  )
}
