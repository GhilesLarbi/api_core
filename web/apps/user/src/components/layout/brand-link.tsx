import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Logo } from '@shared/ui/components/logo'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function BrandLink({ className }: { className?: string }) {
  const { t } = useTranslation('nav')

  return (
    <Link
      to='/'
      className={cn('flex shrink-0 items-center gap-2.5', className)}
    >
      <Logo className='size-11' />
      <span className='hidden flex-col sm:flex'>
        <span className='text-base leading-tight font-semibold'>
          {t('brand.name')}
        </span>
        <span className='text-muted-foreground text-footnote leading-tight'>
          {t('brand.tagline')}
        </span>
      </span>
    </Link>
  )
}
