import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  type AvgTimeOnPlatform,
  type AvgTimeRow,
} from '@shared/ui/lib/dashboard-types'
import { cn } from '@shared/ui/lib/utils'

import { VitalsCard } from './vitals-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const PERIOD_LABEL_KEY: Record<AvgTimeRow['period'], string> = {
  day: 'avgTime.perDay',
  week: 'avgTime.perWeek',
  month: 'avgTime.perMonth',
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AvgTimeCardProps = {
  data: AvgTimeOnPlatform
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AvgTimeCard({ data, className }: AvgTimeCardProps) {
  const { t } = useTranslation('dashboard')
  return (
    <VitalsCard
      title={t('avgTime.title')}
      icon={<Clock className='size-4' />}
      iconTone='violet'
      className={cn('h-full', className)}
      bodyClassName='flex flex-1 flex-col'
    >
      <div className='text-muted-foreground text-caption2 grid grid-cols-[1fr_auto_auto] items-center gap-x-8 font-medium tracking-wide uppercase'>
        <span />
        <span className='text-right'>{t('avgTime.free')}</span>
        <span className='text-right'>{t('avgTime.paid')}</span>
      </div>
      <div className='mt-2 flex flex-1 flex-col justify-around'>
        {data.rows.map((row) => (
          <div
            key={row.period}
            className='grid grid-cols-[1fr_auto_auto] items-baseline gap-x-8 border-t py-3 first:border-t-0'
          >
            <span className='text-sm font-medium'>
              {t(PERIOD_LABEL_KEY[row.period])}
            </span>
            <span className='text-muted-foreground text-right text-lg font-semibold tabular-nums'>
              {fmtMinutes(row.freeMinutes)}
            </span>
            <span className='text-right text-lg font-semibold tabular-nums'>
              {fmtMinutes(row.paidMinutes)}
            </span>
          </div>
        ))}
      </div>
    </VitalsCard>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function fmtMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
