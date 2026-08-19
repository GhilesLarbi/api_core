import { type UseQueryResult } from '@tanstack/react-query'
import { Footprints } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@shared/ui/components/skeleton'
import { type OnboardingFunnel } from '@shared/ui/lib/dashboard-types'
import { formatNumber } from '@shared/ui/lib/format'

import { QuerySection } from './query-section'
import { VitalsCard } from './vitals-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type OnboardingFunnelSectionProps = {
  query: UseQueryResult<OnboardingFunnel>
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function OnboardingFunnelSection({
  query,
}: OnboardingFunnelSectionProps) {
  return (
    <QuerySection
      query={query}
      skeleton={<Skeleton className='bg-card h-[420px] rounded-none' />}
    >
      {(data) => <OnboardingCard data={data} />}
    </QuerySection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function OnboardingCard({ data }: { data: OnboardingFunnel }) {
  const { t } = useTranslation('dashboard')
  const start = data.steps[0]?.users ?? 0
  const finish = data.steps[data.steps.length - 1]?.users ?? 0
  const completion = start ? (finish / start) * 100 : 0

  return (
    <VitalsCard
      title={t('onboarding.title')}
      icon={<Footprints className='size-4' />}
      iconTone='emerald'
      action={
        <span className='text-muted-foreground text-xs font-medium'>
          {t('onboarding.stepsCount', { count: data.steps.length })}
        </span>
      }
    >
      <div className='flex items-baseline gap-2.5'>
        <p className='text-3xl font-semibold tracking-tight tabular-nums'>
          {completion.toFixed(1)}%
        </p>
        <span className='text-muted-foreground text-sm'>
          {t('onboarding.finishedCaption', {
            finish: formatNumber(finish),
            start: formatNumber(start),
          })}
        </span>
      </div>

      <div className='mt-6 space-y-2'>
        {data.steps.map((step, i) => {
          const ofStart = start ? (step.users / start) * 100 : 0
          const prev = i === 0 ? step.users : data.steps[i - 1].users
          const stepDrop = prev ? ((prev - step.users) / prev) * 100 : 0
          return (
            <div key={step.label} className='flex items-center gap-2 sm:gap-3'>
              <span className='text-muted-foreground w-5 shrink-0 text-right text-xs tabular-nums'>
                {i + 1}
              </span>
              <span className='w-16 shrink-0 truncate text-sm font-medium sm:w-24'>
                {step.label}
              </span>
              <div className='bg-muted h-6 min-w-0 flex-1 overflow-hidden rounded-md'>
                <div
                  className='bg-chart-1/85 flex h-full items-center justify-end rounded-md pr-2'
                  style={{ width: `${Math.max(ofStart, 3)}%` }}
                >
                  {ofStart >= 15 && (
                    <span className='text-caption2 font-semibold text-white tabular-nums'>
                      {ofStart.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <span className='w-12 shrink-0 text-right text-xs tabular-nums sm:w-16'>
                {formatNumber(step.users)}
              </span>
              <span className='text-muted-foreground text-caption2 w-9 shrink-0 text-right tabular-nums sm:w-12'>
                {i === 0 ? '' : `-${stepDrop.toFixed(0)}%`}
              </span>
            </div>
          )
        })}
      </div>
    </VitalsCard>
  )
}
