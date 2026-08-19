import { format, parseISO } from 'date-fns'
import { Bug } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, XAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@shared/ui/components/chart'
import { type GeneralErrors } from '@shared/ui/lib/dashboard-types'
import { formatNumber } from '@shared/ui/lib/format'

import { VitalsCard } from './vitals-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SOURCES: {
  key: 'backend' | 'frontend' | 'crashes'
  labelKey: string
  color: string
}[] = [
  {
    key: 'backend',
    labelKey: 'generalErrors.backend',
    color: 'var(--chart-1)',
  },
  {
    key: 'frontend',
    labelKey: 'generalErrors.frontend',
    color: 'var(--chart-4)',
  },
  {
    key: 'crashes',
    labelKey: 'generalErrors.appCrashes',
    color: 'var(--destructive)',
  },
]

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type GeneralErrorsCardProps = {
  data: GeneralErrors
  startISO: string
  endISO: string
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function GeneralErrorsCard({
  data,
  startISO,
  endISO,
  className,
}: GeneralErrorsCardProps) {
  const { t } = useTranslation('dashboard')
  const rangeLabel = `${format(parseISO(startISO), 'MMM d')} – ${format(
    parseISO(endISO),
    'MMM d, yyyy'
  )}`
  const chartConfig = {
    total: { label: t('generalErrors.chartLabel'), color: 'var(--chart-3)' },
  } satisfies ChartConfig

  return (
    <VitalsCard
      title={t('generalErrors.title')}
      icon={<Bug className='size-4' />}
      iconTone='amber'
      action={
        <span className='text-muted-foreground text-xs font-medium whitespace-nowrap'>
          {rangeLabel}
        </span>
      }
      className={className}
    >
      <p className='text-4xl font-semibold tracking-tight tabular-nums'>
        {formatNumber(data.total)}
      </p>
      <p className='text-muted-foreground mt-1 text-sm'>
        {t('generalErrors.totalErrors')}
      </p>

      <ChartContainer config={chartConfig} className='mt-5 h-[132px] w-full'>
        <AreaChart data={data.series} margin={{ left: 4, right: 4, top: 6 }}>
          <defs>
            <linearGradient id='errorsArea' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='var(--chart-3)' stopOpacity={0.25} />
              <stop offset='100%' stopColor='var(--chart-3)' stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey='date'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={44}
            className='text-caption2'
            tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const date = payload?.[0]?.payload?.date as string | undefined
                  return date ? format(parseISO(date), 'EEE, MMM d') : ''
                }}
              />
            }
          />
          <Area
            dataKey='total'
            type='monotone'
            stroke='var(--chart-3)'
            strokeWidth={2}
            fill='url(#errorsArea)'
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>

      <div className='mt-5 grid grid-cols-3 gap-4 border-t pt-5'>
        {SOURCES.map((source) => (
          <div key={source.key}>
            <div className='flex items-center gap-1.5'>
              <span
                className='size-2 rounded-full'
                style={{ backgroundColor: source.color }}
              />
              <span className='text-muted-foreground text-xs'>
                {t(source.labelKey)}
              </span>
            </div>
            <p className='mt-1 text-2xl font-semibold tracking-tight tabular-nums'>
              {formatNumber(data[source.key])}
            </p>
          </div>
        ))}
      </div>
    </VitalsCard>
  )
}
