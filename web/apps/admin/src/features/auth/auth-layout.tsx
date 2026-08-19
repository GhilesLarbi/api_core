import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout/public-layout'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AuthLayoutProps = {
  children: React.ReactNode
  backTo?: LinkProps['to']
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AuthLayout({ children, backTo }: AuthLayoutProps) {
  const { t } = useTranslation('auth')
  const year = new Date().getFullYear()

  return (
    <PublicLayout>
      <div className='relative flex flex-1 flex-col'>
        {backTo && (
          <Link
            to={backTo}
            className='bg-muted hover:bg-accent absolute start-6 top-6 flex size-11 items-center justify-center rounded-full transition-colors sm:start-12 sm:top-12'
          >
            <ChevronLeft className='size-5 rtl:rotate-180' />
          </Link>
        )}
        <div className='container flex max-w-none flex-1 items-center justify-center'>
          <div className='mx-auto flex w-full max-w-md flex-col justify-center space-y-2 px-4 py-8'>
            {children}
          </div>
        </div>
        <footer className='flex flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 pb-8'>
          <span className='text-muted-foreground text-sm'>
            {t('footer.copyright', { year })}
          </span>
          <Link
            to='/terms'
            className='text-muted-foreground hover:text-foreground text-sm transition-colors'
          >
            {t('footer.terms')}
          </Link>
          <Link
            to='/privacy'
            className='text-muted-foreground hover:text-foreground text-sm transition-colors'
          >
            {t('footer.privacy')}
          </Link>
        </footer>
      </div>
    </PublicLayout>
  )
}
