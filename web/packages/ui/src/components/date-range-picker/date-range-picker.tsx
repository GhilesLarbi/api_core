import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarRange } from 'lucide-react'

import { Button } from '@shared/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/ui/components/popover'
import { useDashboardRangeStore } from '@shared/ui/lib/date-range-store'

import { RangeCalendar } from './range-calendar'
import { RangePresetRail } from './range-preset-rail'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DateRangePicker() {
  const [open, setOpen] = useState(false)
  const startISO = useDashboardRangeStore((state) => state.startISO)
  const endISO = useDashboardRangeStore((state) => state.endISO)

  const label = `${format(new Date(startISO), 'MMM d, yyyy')} – ${format(
    new Date(endISO),
    'MMM d, yyyy'
  )}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2 transition-none'>
          <CalendarRange className='size-3.5' />
          <span className='truncate'>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        sideOffset={8}
        className='flex w-auto max-w-[calc(100vw-1.5rem)] overflow-hidden p-0'
      >
        <Content onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Content({ onClose }: { onClose: () => void }) {
  return (
    <div className='flex flex-col sm:flex-row'>
      <RangePresetRail onApply={onClose} />
      <RangeCalendar onApply={onClose} />
    </div>
  )
}
