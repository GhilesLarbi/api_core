import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { AuthLayout } from '../auth-layout'
import { AuthLogo } from '../auth-logo'
import { OtpForm } from './components/otp-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Otp() {
  const { t } = useTranslation('auth')

  return (
    <AuthLayout backTo='/forgot-password'>
      <div className='flex flex-col items-center gap-6'>
        <AuthLogo />
        <h1 className='text-center text-2xl font-bold tracking-tight sm:text-3xl'>
          {t('otp.title')}
        </h1>
        <p className='max-w-xs text-center text-sm'>{t('otp.description')}</p>
        <OtpForm className='w-full' />
        <Link
          to='/login'
          search={(prev) => prev}
          className='text-brand text-center text-sm font-semibold hover:opacity-80'
        >
          {t('otp.resend')}
        </Link>
      </div>
    </AuthLayout>
  )
}
