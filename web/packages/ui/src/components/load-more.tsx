import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LoadMoreProps = {
  loaded: number
  total: number
  onLoadMore: () => void
  loading?: boolean
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LoadMore({
  loaded,
  total,
  onLoadMore,
  loading,
  className,
}: LoadMoreProps) {
  const { t } = useTranslation('common')
  const complete = loaded >= total

  return (
    <div className={cn('flex flex-col items-center gap-3 py-2', className)}>
      <p className='text-muted-foreground text-footnote tabular-nums'>
        {t('loadMore.progress', { loaded, total })}
      </p>
      <div
        className='bg-accent h-1 w-full max-w-sm overflow-hidden rounded-full'
        role='presentation'
      >
        <div
          className='bg-brand h-full rounded-full transition-[width] duration-300'
          style={{ width: `${total > 0 ? (loaded / total) * 100 : 0}%` }}
        />
      </div>
      {!complete && (
        <Button
          variant='outline'
          size='lg'
          disabled={loading}
          onClick={onLoadMore}
          className='min-w-48'
        >
          {loading && <Loader2 className='animate-spin' />}
          {t('loadMore.action')}
        </Button>
      )}
      <Button
        variant='link'
        size='sm'
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        {t('loadMore.backToTop')}
      </Button>
    </div>
  )
}
