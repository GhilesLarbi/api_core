import { type UseQueryResult } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@shared/ui/components/chart'
import { Skeleton } from '@shared/ui/components/skeleton'
import {
  type FeatureUsage,
  type FeatureUsageOverview,
} from '@shared/ui/lib/dashboard-types'
import { formatCompact, formatNumber } from '@shared/ui/lib/format'
import { cn } from '@shared/ui/lib/utils'

import { QuerySection } from './query-section'
import { VitalsCard } from './vitals-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FeatureUsageSectionProps = {
  query: UseQueryResult<FeatureUsageOverview>
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function FeatureUsageSection({
  query,
  className,
}: FeatureUsageSectionProps) {
  return (
    <QuerySection
      query={query}
      skeleton={
        <Skeleton className={cn('bg-card h-[360px] rounded-none', className)} />
      }
    >
      {(data) => <FeatureUsageCard data={data} className={className} />}
    </QuerySection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function FeatureUsageCard({
  data,
  className,
}: {
  data: FeatureUsageOverview
  className?: string
}) {
  const { t } = useTranslation('dashboard')
  const chartConfig = {
    uses: {
      label: t('featureUsage.chartLabel'),
      color: 'var(--warning)',
    },
  } satisfies ChartConfig
  return (
    <VitalsCard
      title={t('featureUsage.title')}
      icon={<BarChart3 className='size-4' />}
      className={className}
      action={
        <span className='text-muted-foreground text-xs font-medium'>
          {t('featureUsage.usesCaption', { min: data.useWindowMinutes })}
        </span>
      }
    >
      <ChartContainer config={chartConfig} className='h-[280px] w-full'>
        <BarChart data={data.features} margin={{ left: 0, right: 4, top: 8 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray='3 6'
            className='stroke-border'
          />
          <XAxis
            dataKey='name'
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            className='text-caption2'
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={40}
            className='text-caption2'
            tickFormatter={(value: number) => formatCompact(value)}
          />
          <ChartTooltip cursor={false} content={<FeatureTooltip />} />
          <Bar
            dataKey='uses'
            fill='var(--warning)'
            radius={[8, 8, 0, 0]}
            maxBarSize={56}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </VitalsCard>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function FeatureTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: FeatureUsage }[]
}) {
  const { t } = useTranslation('dashboard')
  if (!active || !payload?.length) return null
  const feature = payload[0].payload
  return (
    <div className='bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs shadow-md'>
      <p className='font-medium'>{feature.name}</p>
      <p className='text-muted-foreground tabular-nums'>
        {t('featureUsage.tooltipCaption', {
          uses: formatNumber(feature.uses),
          retention: feature.retention,
        })}
      </p>
    </div>
  )
}
