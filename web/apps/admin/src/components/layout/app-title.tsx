import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Logo } from '@shared/ui/components/logo'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AppTitle() {
  const { t } = useTranslation('nav')
  return (
    <Link to='/' className='flex w-full items-center overflow-hidden'>
      <div className='flex w-14 shrink-0 justify-center'>
        <Logo className='size-[50px]' />
      </div>
      <span className='min-w-0 truncate text-2xl font-bold transition-opacity duration-200 group-data-[state=collapsed]/sidebar:opacity-0'>
        {t('brand.name')}
      </span>
    </Link>
  )
}
