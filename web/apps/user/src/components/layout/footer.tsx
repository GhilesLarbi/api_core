import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { Logo } from '@shared/ui/components/logo'
import { Container } from '@/components/layout/container'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const FOOTER_LINKS = [
  { key: 'posts', to: '/posts' },
  { key: 'terms', to: '/terms' },
  { key: 'privacy', to: '/privacy' },
] as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Footer() {
  const { t } = useTranslation('footer')

  return (
    <footer className='border-t'>
      <Container className='flex flex-col items-center gap-4 py-10 sm:flex-row sm:justify-between'>
        <div className='flex items-center gap-2.5'>
          <Logo className='size-7' />
          <span className='text-subhead font-semibold'>{t('brand')}</span>
        </div>
        <nav className='flex items-center gap-1'>
          {FOOTER_LINKS.map(({ key, to }) => (
            <Button key={key} variant='quiet' size='sm' asChild>
              <Link to={to}>{t(`links.${key}`)}</Link>
            </Button>
          ))}
        </nav>
        <p className='text-muted-foreground text-footnote'>
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
      </Container>
    </footer>
  )
}
