import { useTranslation } from 'react-i18next'

import { DateRangePicker } from '@shared/ui/components/date-range-picker/date-range-picker'
import { SegmentedControl } from '@shared/ui/components/segmented-control'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type DateGranularity = 'day' | 'week' | 'month'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type DateTimeFilterProps = {
  granularity: DateGranularity
  onGranularityChange: (granularity: DateGranularity) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const RANGES: { value: DateGranularity; labelKey: string }[] = [
  { value: 'day', labelKey: 'filters.day' },
  { value: 'week', labelKey: 'filters.week' },
  { value: 'month', labelKey: 'filters.month' },
]

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DateTimeFilter({
  granularity,
  onGranularityChange,
}: DateTimeFilterProps) {
  const { t } = useTranslation('dashboard')

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='[&>button]:bg-card [&>button]:hover:bg-accent [&>button]:h-10 [&>button]:rounded-lg [&>button]:px-4 [&>button]:font-medium'>
        <DateRangePicker />
      </div>

      <SegmentedControl
        value={granularity}
        onValueChange={onGranularityChange}
        options={RANGES.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
        }))}
      />
    </div>
  )
}
