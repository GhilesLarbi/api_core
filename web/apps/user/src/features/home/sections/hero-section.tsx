import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { Logo } from '@shared/ui/components/logo'
import { Container } from '@/components/layout/container'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function HeroSection() {
  const { t } = useTranslation('home')

  return (
    <section className='py-24 sm:py-32'>
      <Container className='flex max-w-2xl flex-col items-center text-center'>
        <Logo className='size-16' />
        <h1 className='mt-8 text-4xl font-bold tracking-tight sm:text-5xl'>
          {t('hero.title')}
        </h1>
        <p className='text-body text-muted-foreground mt-4 max-w-lg'>
          {t('hero.subtitle')}
        </p>
        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <Button variant='brand' size='xl' asChild>
            <Link to='/sign-up'>{t('hero.getStarted')}</Link>
          </Button>
          <Button variant='outline' size='xl' asChild>
            <Link to='/posts'>{t('hero.browsePosts')}</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
