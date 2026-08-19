import { Gauge } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  type AppLoadTimes,
  type LoadTimeStat,
} from '@shared/ui/lib/dashboard-types'
import { cn } from '@shared/ui/lib/utils'

import { VitalsCard } from './vitals-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LoadTimesCardProps = {
  data: AppLoadTimes
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LoadTimesCard({ data, className }: LoadTimesCardProps) {
  const { t } = useTranslation('dashboard')
  return (
    <VitalsCard
      title={t('loadTimes.title')}
      icon={<Gauge className='size-4' />}
      iconTone='amber'
      action={
        <span className='text-muted-foreground text-xs font-medium'>
          {t('loadTimes.openToHomePainted')}
        </span>
      }
      className={cn('h-full', className)}
      bodyClassName='flex flex-1 flex-col'
    >
      <div className='grid flex-1 grid-cols-2 gap-4'>
        <PlatformBlock label={t('loadTimes.iosApp')} stat={data.ios} />
        <PlatformBlock label={t('loadTimes.webApp')} stat={data.web} />
      </div>
    </VitalsCard>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function PlatformBlock({ label, stat }: { label: string; stat: LoadTimeStat }) {
  const { t } = useTranslation('dashboard')
  return (
    <div className='flex flex-col rounded-lg border p-4'>
      <p className='text-muted-foreground text-caption2 font-medium tracking-wide uppercase'>
        {label}
      </p>
      <p className='mt-2 text-2xl font-semibold tracking-tight tabular-nums'>
        {fmtMs(stat.averageMs)}
      </p>
      <p className='text-muted-foreground text-xs'>{t('loadTimes.average')}</p>

      <div className='mt-auto space-y-1.5 pt-4 text-xs'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>
            {t('loadTimes.shortest')}
          </span>
          <span className='text-success font-medium tabular-nums'>
            {fmtMs(stat.shortestMs)}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>
            {t('loadTimes.longest')}
          </span>
          <span className='text-destructive font-medium tabular-nums'>
            {fmtMs(stat.longestMs)}
          </span>
        </div>
      </div>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function fmtMs(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`
}
