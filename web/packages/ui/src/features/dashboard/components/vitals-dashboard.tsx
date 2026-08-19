import { AvgTimeCard } from '@shared/ui/components/dashboard/avg-time-card'
import { DateTimeFilter } from '@shared/ui/components/dashboard/date-time-filter'
import { FeatureUsageSection } from '@shared/ui/components/dashboard/feature-usage-section'
import {
  FinancesProvider,
  KeyMetricsCard,
  MonthlyNetCard,
  MrrCard,
  RevenueCard,
} from '@shared/ui/components/dashboard/finances-section'
import { GeneralErrorsCard } from '@shared/ui/components/dashboard/general-errors-card'
import { LoadTimesCard } from '@shared/ui/components/dashboard/load-times-card'
import { OnboardingFunnelSection } from '@shared/ui/components/dashboard/onboarding-funnel-section'
import { QuerySection } from '@shared/ui/components/dashboard/query-section'
import { RetentionSection } from '@shared/ui/components/dashboard/retention-section'
import { Skeleton } from '@shared/ui/components/skeleton'
import { useDashboardRangeStore } from '@shared/ui/lib/date-range-store'

import { useDashboardFiltersStore } from '../filters-store'
import {
  useAvgTime,
  useChurn,
  useFeatureUsage,
  useFinances,
  useGeneralErrors,
  useLoadTimes,
  useOnboarding,
  useRetention,
} from '../hooks'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const cardSkeleton = <Skeleton className='bg-card h-[440px] rounded-none' />

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const GRID =
  'grid min-w-0 grid-cols-1 items-stretch gap-[2px] overflow-hidden rounded-[1.25rem] *:min-w-0 lg:grid-cols-3'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function VitalsDashboard() {
  const errors = useGeneralErrors()
  const avgTime = useAvgTime()
  const loadTimes = useLoadTimes()
  const featureUsage = useFeatureUsage()
  const onboarding = useOnboarding()
  const retention = useRetention()
  const churn = useChurn()
  const finances = useFinances()

  const startISO = useDashboardRangeStore((state) => state.startISO)
  const endISO = useDashboardRangeStore((state) => state.endISO)
  const granularity = useDashboardFiltersStore((state) => state.granularity)
  const setGranularity = useDashboardFiltersStore(
    (state) => state.setGranularity
  )

  return (
    <FinancesProvider query={finances}>
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <DateTimeFilter
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
        </div>

        <div className={GRID}>
          <RevenueCard className='lg:col-span-2' />
          <MrrCard />

          <QuerySection query={errors} skeleton={cardSkeleton}>
            {(data) => (
              <GeneralErrorsCard
                data={data}
                startISO={startISO}
                endISO={endISO}
              />
            )}
          </QuerySection>
          <QuerySection query={avgTime} skeleton={cardSkeleton}>
            {(data) => <AvgTimeCard data={data} />}
          </QuerySection>
          <KeyMetricsCard />

          <MonthlyNetCard className='lg:col-span-2' />
          <QuerySection query={loadTimes} skeleton={cardSkeleton}>
            {(data) => <LoadTimesCard data={data} />}
          </QuerySection>

          <RetentionSection
            query={retention}
            churnQuery={churn}
            className='lg:col-span-3'
          />

          <FeatureUsageSection query={featureUsage} className='lg:col-span-2' />
          <OnboardingFunnelSection query={onboarding} />
        </div>
      </div>
    </FinancesProvider>
  )
}
