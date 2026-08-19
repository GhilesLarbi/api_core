import { createFileRoute, Link } from '@tanstack/react-router'
import { MailCheck, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { PublicLayout } from '@/components/layout/public-layout'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const Route = createFileRoute('/email-verified')({
  validateSearch: (search: Record<string, unknown>) => ({
    success: search.success === true || search.success === 'true',
  }),
  component: EmailVerifiedPage,
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function EmailVerifiedPage() {
  const { t } = useTranslation('auth')
  const { success } = Route.useSearch()

  return (
    <PublicLayout>
      <Navbar />
      <main className='flex flex-1 flex-col'>
        <Container className='flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 py-(--page-gutter) text-center [--page-gutter:--spacing(8)]'>
          {success ? (
            <>
              <div className='bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full'>
                <MailCheck className='size-5' />
              </div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {t('verify.emailVerifiedTitle')}
              </h1>
              <p className='text-muted-foreground text-sm'>
                {t('verify.emailVerifiedBody')}
              </p>
              <Button variant='brand' asChild className='mt-3'>
                <Link to='/'>{t('verify.backHome')}</Link>
              </Button>
            </>
          ) : (
            <>
              <div className='bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full'>
                <XCircle className='size-5' />
              </div>
              <h1 className='text-2xl font-semibold tracking-tight'>
                {t('verify.emailVerifyFailedTitle')}
              </h1>
              <p className='text-muted-foreground text-sm'>
                {t('verify.emailVerifyFailedBody')}
              </p>
              <Button variant='outline' asChild className='mt-3'>
                <Link to='/login'>{t('verify.tryAgain')}</Link>
              </Button>
            </>
          )}
        </Container>
      </main>
      <Footer />
    </PublicLayout>
  )
}
