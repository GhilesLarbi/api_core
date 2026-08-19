import { createContext, useContext, type ReactNode } from 'react'
import { type UseQueryResult } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Receipt,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@shared/ui/components/chart'
import { Skeleton } from '@shared/ui/components/skeleton'
import {
  type FinancePoint,
  type Finances,
  type FinanceSourceStats,
  type RevenueTriple,
} from '@shared/ui/lib/dashboard-types'
import {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  niceTicks,
  parseBucketDate,
} from '@shared/ui/lib/format'
import { cn } from '@shared/ui/lib/utils'

import { DeltaBadge } from './delta-badge'
import { QuerySection } from './query-section'
import { VitalsCard } from './vitals-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FinancesCtxValue = {
  query: UseQueryResult<Finances>
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const FinancesContext = createContext<FinancesCtxValue | null>(null)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function useFinancesCtx() {
  const ctx = useContext(FinancesContext)
  if (!ctx) {
    throw new Error('Finance cards must be rendered inside <FinancesProvider>')
  }
  return ctx
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FinancesProviderProps = {
  query: UseQueryResult<Finances>
  children: ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function FinancesProvider({ query, children }: FinancesProviderProps) {
  return (
    <FinancesContext.Provider value={{ query }}>
      {children}
    </FinancesContext.Provider>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function financeSkeleton(className?: string, height = 'h-[300px]') {
  return <Skeleton className={cn(height, 'bg-card rounded-none', className)} />
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function RevenueCard({ className }: { className?: string }) {
  const { query } = useFinancesCtx()
  const { t } = useTranslation('dashboard')
  return (
    <QuerySection
      query={query}
      skeleton={financeSkeleton(className, 'h-[420px]')}
    >
      {(data) => {
        const stats = getCombinedStats(data)
        return (
          <TrendCard
            className={className}
            title={t('finances.revenue.title')}
            icon={<DollarSign className='size-4' />}
            iconTone='amber'
            comparison
            tall
            headline={formatCurrency(stats.monthRevenue.gross)}
            growth={comparisonDelta(data.revenueSeries)}
            sub={t('finances.revenue.sub', {
              amount: formatCurrency(stats.todaysRevenue.gross),
            })}
            series={data.revenueSeries}
            color='var(--warning)'
            gradientId='revenueArea'
            yFormat={formatCurrencyCompact}
          />
        )
      }}
    </QuerySection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function MrrCard({ className }: { className?: string }) {
  const { query } = useFinancesCtx()
  const { t } = useTranslation('dashboard')
  return (
    <QuerySection query={query} skeleton={financeSkeleton(className)}>
      {(data) => {
        const stats = getCombinedStats(data)
        return (
          <TrendCard
            className={className}
            title={t('finances.mrr.title')}
            icon={<CreditCard className='size-4' />}
            iconTone='emerald'
            headline={formatCurrency(stats.mrrOutOfTrial)}
            growth={growthPct(data.mrrSeries)}
            sub={t('finances.mrr.sub', {
              amount: formatCurrency(stats.mrrInTrial),
            })}
            series={data.mrrSeries}
            color='var(--chart-2)'
            gradientId='mrrArea'
            yFormat={formatCurrencyCompact}
          />
        )
      }}
    </QuerySection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function TrendCard({
  title,
  icon,
  iconTone,
  headline,
  growth,
  sub,
  series,
  color,
  gradientId,
  yFormat,
  comparison = false,
  tall = false,
  className,
}: {
  title: string
  icon: ReactNode
  iconTone: 'emerald' | 'blue' | 'amber'
  headline: string
  growth: number
  sub: string
  series: FinancePoint[]
  color: string
  gradientId: string
  yFormat: (value: number) => string
  comparison?: boolean
  tall?: boolean
  className?: string
}) {
  const { t } = useTranslation('dashboard')
  const up = growth >= 0
  const ticks = niceTicks(Math.max(...series.map((p) => p.value), 1))
  const chartConfig = {
    value: { label: title, color },
    previous: {
      label: t('finances.previous'),
      color: 'var(--muted-foreground)',
    },
  } satisfies ChartConfig
  return (
    <VitalsCard
      title={title}
      icon={icon}
      iconTone={iconTone}
      action={comparison ? <DeltaBadge value={growth} /> : undefined}
      className={cn('h-full', className)}
      bodyClassName='flex flex-1 flex-col'
    >
      <div className='flex items-baseline gap-2.5'>
        <p className='text-3xl font-semibold tracking-tight tabular-nums'>
          {headline}
        </p>
        {!comparison && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-sm font-medium tabular-nums',
              up ? 'text-success' : 'text-destructive'
            )}
          >
            {up ? (
              <ArrowUpRight className='size-4' />
            ) : (
              <ArrowDownRight className='size-4' />
            )}
            {Math.abs(growth).toFixed(1)}%
          </span>
        )}
      </div>
      <p className='text-muted-foreground mt-1 text-xs'>{sub}</p>

      <ChartContainer
        config={chartConfig}
        className={cn(
          'mt-4 aspect-auto w-full flex-1',
          tall ? 'min-h-[240px]' : 'min-h-[150px]'
        )}
      >
        <AreaChart data={series} margin={{ left: 0, right: 4, top: 24 }}>
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={color} stopOpacity={0.22} />
              <stop offset='100%' stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {comparison && (
            <CartesianGrid
              vertical={false}
              strokeDasharray='3 6'
              className='stroke-border'
            />
          )}
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={40}
            ticks={ticks}
            domain={[0, ticks[ticks.length - 1]]}
            className='text-caption2'
            tickFormatter={(value: number) => yFormat(value)}
          />
          <XAxis
            dataKey='date'
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            className='text-caption2'
            tickFormatter={(value: string) =>
              format(parseBucketDate(value), 'MMM')
            }
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const date = payload?.[0]?.payload?.date as string | undefined
                  return date ? format(parseBucketDate(date), 'MMMM yyyy') : ''
                }}
              />
            }
          />
          {comparison && (
            <Area
              dataKey='previous'
              type='monotone'
              stroke='var(--muted-foreground)'
              strokeWidth={1.5}
              strokeDasharray='4 4'
              fill='none'
              isAnimationActive={false}
            />
          )}
          <Area
            dataKey='value'
            type='monotone'
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </VitalsCard>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function KeyMetricsCard({ className }: { className?: string }) {
  const { query } = useFinancesCtx()
  const { t } = useTranslation('dashboard')
  return (
    <QuerySection query={query} skeleton={financeSkeleton(className)}>
      {(data) => (
        <VitalsCard
          title={t('finances.keyMetrics.title')}
          icon={<Receipt className='size-4' />}
          iconTone='amber'
          className={cn('h-full', className)}
          bodyClassName='flex flex-1 flex-col'
        >
          <div className='grid flex-1 grid-cols-2 content-around gap-x-6 gap-y-5'>
            <Stat
              label={t('finances.keyMetrics.ltvPerUser')}
              value={formatCurrency(data.ltv)}
            />
            <Stat
              label={t('finances.keyMetrics.avgRevenuePerUser')}
              value={formatCurrency(data.avgRevenuePerUser)}
            />
            <Stat
              label={t('finances.keyMetrics.paidRetention')}
              value={`${data.paidRetention.toFixed(1)}%`}
            />
            <Stat
              label={t('finances.keyMetrics.cancellations')}
              value={formatNumber(data.cancellations)}
            />
            <Stat
              label={t('finances.keyMetrics.totalPaidUsers')}
              value={formatNumber(data.totalPaidUsers)}
            />
            <Stat
              label={t('finances.keyMetrics.freeUsers')}
              value={formatNumber(data.freeUsers)}
            />
            <Stat
              label={t('finances.keyMetrics.activeTrials')}
              value={formatNumber(data.activeTrials)}
            />
          </div>
        </VitalsCard>
      )}
    </QuerySection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function MonthlyNetCard({ className }: { className?: string }) {
  const { query } = useFinancesCtx()
  const { t } = useTranslation('dashboard')
  return (
    <QuerySection query={query} skeleton={financeSkeleton(className)}>
      {(data) => {
        const revenue = data.net.revenue.gross
        const remaining =
          revenue -
          data.net.awsCost -
          data.net.mercuryCost -
          data.net.creatorPayoutsThisMonth
        return (
          <VitalsCard
            title={t('finances.monthlyNet.title')}
            icon={<DollarSign className='size-4' />}
            iconTone='ink'
            className={cn('h-full', className)}
            bodyClassName='flex flex-1 flex-col'
          >
            <div className='space-y-2.5'>
              <NetRow
                label={t('finances.monthlyNet.revenue')}
                value={revenue}
                sign='+'
              />
              <NetRow
                label={t('finances.monthlyNet.awsCosts')}
                value={data.net.awsCost}
                sign='−'
              />
              <NetRow
                label={t('finances.monthlyNet.mercuryCosts')}
                value={data.net.mercuryCost}
                sign='−'
              />
              <NetRow
                label={t('finances.monthlyNet.creatorPayouts')}
                value={data.net.creatorPayoutsThisMonth}
                sign='−'
              />
              <div className='flex items-baseline justify-between border-t pt-3'>
                <span className='text-sm font-medium'>
                  {t('finances.monthlyNet.remaining')}
                </span>
                <span
                  className={cn(
                    'text-2xl font-semibold tracking-tight tabular-nums',
                    remaining >= 0 ? 'text-emerald' : 'text-destructive'
                  )}
                >
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
            <div className='mt-auto border-t pt-3.5'>
              <div className='flex items-baseline justify-between'>
                <span className='text-muted-foreground text-sm'>
                  {t('finances.monthlyNet.upcomingPayouts')}
                </span>
                <span className='text-lg font-semibold tabular-nums'>
                  {formatCurrency(data.net.creatorPayoutsNextMonth)}
                </span>
              </div>
              <p className='text-muted-foreground text-caption2 mt-2'>
                {t('finances.monthlyNet.disclaimer')}
              </p>
            </div>
          </VitalsCard>
        )
      }}
    </QuerySection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function NetRow({
  label,
  value,
  sign,
}: {
  label: string
  value: number
  sign: '+' | '−'
}) {
  return (
    <div className='flex items-baseline justify-between text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span
        className={cn(
          'font-medium tabular-nums',
          sign === '−' && 'text-destructive'
        )}
      >
        {sign}
        {formatCurrency(value)}
      </span>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='text-2xl font-semibold tracking-tight tabular-nums'>
        {value}
      </p>
      <p className='text-muted-foreground mt-0.5 text-xs'>{label}</p>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function growthPct(series: FinancePoint[]) {
  if (series.length < 2) return 0
  const last = series[series.length - 1].value
  const prev = series[series.length - 2].value
  return prev ? ((last - prev) / prev) * 100 : 0
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function comparisonDelta(series: FinancePoint[]) {
  const total = series.reduce((sum, point) => sum + point.value, 0)
  const prev = series.reduce((sum, point) => sum + point.previous, 0)
  return prev ? ((total - prev) / prev) * 100 : 0
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function getCombinedStats(data: Finances): FinanceSourceStats {
  const a = data.apple
  const l = data.lemonsqueezy
  const addTriple = (x: RevenueTriple, y: RevenueTriple): RevenueTriple => ({
    gross: x.gross + y.gross,
    commission: x.commission + y.commission,
    taxes: x.taxes + y.taxes,
  })
  return {
    subscribersOutOfTrial: a.subscribersOutOfTrial + l.subscribersOutOfTrial,
    subscribersInTrial: a.subscribersInTrial + l.subscribersInTrial,
    mrrOutOfTrial: a.mrrOutOfTrial + l.mrrOutOfTrial,
    mrrInTrial: a.mrrInTrial + l.mrrInTrial,
    todaysRevenue: addTriple(a.todaysRevenue, l.todaysRevenue),
    newSubscribers: a.newSubscribers + l.newSubscribers,
    newTrials: a.newTrials + l.newTrials,
    monthRevenue: addTriple(a.monthRevenue, l.monthRevenue),
  }
}
