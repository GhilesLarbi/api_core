import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { useDashboardRangeStore } from '@shared/ui/lib/date-range-store'
import { cn } from '@shared/ui/lib/utils'

import { RANGE_PRESETS } from './presets'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type RangePresetRailProps = {
  onApply: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function RangePresetRail({ onApply }: RangePresetRailProps) {
  const { t } = useTranslation('dashboard')
  const presetKey = useDashboardRangeStore((state) => state.presetKey)
  const setPreset = useDashboardRangeStore((state) => state.setPreset)

  return (
    <div className='grid w-full shrink-0 grid-cols-2 gap-0.5 border-b p-2 sm:flex sm:w-40 sm:flex-col sm:border-r sm:border-b-0'>
      {RANGE_PRESETS.map((preset) => (
        <Button
          key={preset.key}
          variant='ghost'
          size='sm'
          onClick={() => {
            setPreset(preset.key)
            onApply()
          }}
          className={cn(
            'justify-start text-sm font-normal',
            preset.key === presetKey && 'bg-accent text-accent-foreground'
          )}
        >
          {t(`filters.presets.${preset.key}`)}
        </Button>
      ))}
    </div>
  )
}
