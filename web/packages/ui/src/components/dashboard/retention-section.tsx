import { type CSSProperties } from 'react'
import { type UseQueryResult } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, LineChart } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@shared/ui/components/chart'
import { Skeleton } from '@shared/ui/components/skeleton'
import {
  type RetentionCohort,
  type RetentionOverview,
  type SubscriberChurn,
} from '@shared/ui/lib/dashboard-types'
import { formatNumber, niceTicks } from '@shared/ui/lib/format'
import { cn } from '@shared/ui/lib/utils'

import { QuerySection } from './query-section'
import { VitalsCard } from './vitals-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type RetentionSectionProps = {
  query: UseQueryResult<RetentionOverview>
  churnQuery: UseQueryResult<SubscriberChurn>
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function RetentionSection({
  query,
  churnQuery,
  className,
}: RetentionSectionProps) {
  return (
    <QuerySection
      query={query}
      skeleton={
        <Skeleton className={cn('bg-card h-[560px] rounded-none', className)} />
      }
    >
      {(data) => (
        <RetentionCard
          data={data}
          churn={churnQuery.data}
          className={className}
        />
      )}
    </QuerySection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function RetentionCard({
  data,
  churn,
  className,
}: {
  data: RetentionOverview
  churn: SubscriberChurn | undefined
  className?: string
}) {
  const { t } = useTranslation('dashboard')
  const maxPeriods = Math.max(...data.cohorts.map((c) => c.periods.length), 1)

  return (
    <VitalsCard
      title={t('retention.title')}
      icon={<LineChart className='size-4' />}
      iconTone='violet'
      className={className}
    >
      <div className='grid min-w-0 items-start gap-6 *:min-w-0 lg:grid-cols-2'>
        <div>
          <p className='text-muted-foreground text-sm'>
            <Trans
              t={t}
              i18nKey='retention.explainer'
              components={[
                <span className='text-foreground' />,
                <span className='text-foreground' />,
              ]}
            />
          </p>
          <div className='mt-4 grid grid-cols-3 gap-4 rounded-lg border p-4'>
            <Kpi
              label={t('retention.overall')}
              value={`${data.retention30d.toFixed(1)}%`}
              accent
            />
            <Kpi
              label={t('retention.freeUsers')}
              value={`${data.freePaid.free30d.toFixed(1)}%`}
            />
            <Kpi
              label={t('retention.paidUsers')}
              value={`${data.freePaid.paid30d.toFixed(1)}%`}
            />
            <p className='text-muted-foreground text-caption2 col-span-3'>
              {t('retention.caption', {
                value: data.retention7d.toFixed(1),
              })}
            </p>
          </div>
        </div>

        {churn ? (
          <ChurnPanel churn={churn} />
        ) : (
          <Skeleton className='h-[210px] rounded-lg' />
        )}
      </div>

      <div className='mt-6 overflow-x-auto'>
        <table className='w-full border-separate border-spacing-1 text-xs'>
          <thead>
            <tr className='text-muted-foreground text-caption2 font-medium tracking-wide uppercase'>
              <th className='px-2 pb-1 text-left font-medium'>
                {t('retention.cohort')}
              </th>
              <th className='px-2 pb-1 text-right font-medium'>
                {t('retention.users')}
              </th>
              {Array.from({ length: maxPeriods }, (_, i) => (
                <th key={i} className='px-2 pb-1 text-center font-medium'>
                  M{i}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.cohorts.map((cohort) => (
              <CohortRow
                key={cohort.cohort}
                cohort={cohort}
                maxPeriods={maxPeriods}
              />
            ))}
          </tbody>
        </table>
      </div>
    </VitalsCard>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ChurnPanel({ churn }: { churn: SubscriberChurn }) {
  const { t } = useTranslation('dashboard')
  const delta = churn.rate - churn.previousRate
  const improving = delta <= 0
  const ticks = niceTicks(Math.max(...churn.series.map((p) => p.rate), 1))
  const churnChartConfig = {
    rate: {
      label: t('retention.churnChartLabel'),
      color: 'var(--destructive)',
    },
  } satisfies ChartConfig
  return (
    <div className='flex flex-col rounded-lg border p-4'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p className='text-muted-foreground text-xs'>
            {t('retention.subscriberChurn')}
          </p>
          <p className='text-2xl font-semibold tracking-tight tabular-nums'>
            {churn.rate.toFixed(1)}%
          </p>
        </div>
        <span
          className={cn(
            'flex items-center gap-0.5 text-sm font-medium tabular-nums',
            improving ? 'text-success' : 'text-destructive'
          )}
        >
          {improving ? (
            <ArrowDownRight className='size-4' />
          ) : (
            <ArrowUpRight className='size-4' />
          )}
          {Math.abs(delta).toFixed(1)} {t('retention.pts')}
        </span>
      </div>
      <p className='text-muted-foreground mt-1 text-xs'>
        {t('retention.churnCaption', {
          cancelled: formatNumber(churn.cancelled),
          base: formatNumber(churn.base),
          previousRate: churn.previousRate.toFixed(1),
        })}
      </p>

      <ChartContainer
        config={churnChartConfig}
        className='mt-3 h-[130px] w-full'
      >
        <AreaChart data={churn.series} margin={{ left: 0, right: 4, top: 16 }}>
          <defs>
            <linearGradient id='retChurnArea' x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='0%'
                stopColor='var(--destructive)'
                stopOpacity={0.22}
              />
              <stop
                offset='100%'
                stopColor='var(--destructive)'
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={34}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            className='text-caption2'
            tickFormatter={(value: number) =>
              `${value % 1 === 0 ? value : value.toFixed(1)}%`
            }
          />
          <XAxis
            dataKey='date'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            className='text-caption2'
            tickFormatter={(value: string) => format(parseISO(value), 'MMM')}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const date = payload?.[0]?.payload?.date as string | undefined
                  return date ? format(parseISO(date), 'MMMM yyyy') : ''
                }}
              />
            }
          />
          <Area
            dataKey='rate'
            type='monotone'
            stroke='var(--destructive)'
            strokeWidth={2}
            fill='url(#retChurnArea)'
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function CohortRow({
  cohort,
  maxPeriods,
}: {
  cohort: RetentionCohort
  maxPeriods: number
}) {
  return (
    <tr>
      <td className='px-2 text-left font-medium whitespace-nowrap'>
        {cohort.cohort}
      </td>
      <td className='text-muted-foreground px-2 text-right tabular-nums'>
        {formatNumber(cohort.size)}
      </td>
      {Array.from({ length: maxPeriods }, (_, i) => {
        const count = cohort.periods[i]
        if (count === undefined) return <td key={i} />
        return (
          <CohortCell
            key={i}
            count={count}
            size={cohort.size}
            isPeriod0={i === 0}
          />
        )
      })}
    </tr>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function CohortCell({
  count,
  size,
  isPeriod0,
}: {
  count: number
  size: number
  isPeriod0: boolean
}) {
  const rate = size ? Math.round((count / size) * 100) : 0
  const intensity = isPeriod0 ? 0.18 : Math.max(0.06, (rate / 100) * 0.22)
  const bg = `color-mix(in oklch, ${cohortColor(rate)} ${Math.round(
    intensity * 100
  )}%, transparent)`
  return (
    <td className='px-1 text-center'>
      <div
        className='rounded-md py-1.5'
        style={{ backgroundColor: bg } as CSSProperties}
      >
        <span className='font-semibold tabular-nums'>{rate}%</span>
        <span className='text-muted-foreground block text-[10px] tabular-nums'>
          {formatNumber(count)}
        </span>
      </div>
    </td>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Kpi({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <p
        className={
          accent
            ? 'text-chart-4 text-xl font-semibold tracking-tight tabular-nums'
            : 'text-xl font-semibold tracking-tight tabular-nums'
        }
      >
        {value}
      </p>
      <p className='text-muted-foreground mt-0.5 text-xs'>{label}</p>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function cohortColor(rate: number) {
  if (rate >= 80) return 'var(--success)'
  if (rate >= 60)
    return 'color-mix(in oklab, var(--success) 65%, var(--warning))'
  if (rate >= 40) return 'var(--warning)'
  if (rate >= 20)
    return 'color-mix(in oklab, var(--warning) 50%, var(--destructive))'
  return 'var(--destructive)'
}
