import { useState } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import { arDZ, enUS, fr, type Locale } from 'date-fns/locale'
import { type DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import { Calendar } from '@shared/ui/components/calendar'
import { useDashboardRangeStore } from '@shared/ui/lib/date-range-store'

import { DASHBOARD_MIN_DATE } from './presets'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const DATE_LOCALES: Record<string, Locale> = { en: enUS, fr, ar: arDZ }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type RangeCalendarProps = {
  onApply: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function RangeCalendar({ onApply }: RangeCalendarProps) {
  const { i18n } = useTranslation()
  const locale = DATE_LOCALES[i18n.language.split('-')[0]] ?? enUS
  const startISO = useDashboardRangeStore((state) => state.startISO)
  const endISO = useDashboardRangeStore((state) => state.endISO)
  const setCustom = useDashboardRangeStore((state) => state.setCustom)

  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(startISO),
    to: new Date(endISO),
  })

  function handleSelect(_next: DateRange | undefined, triggerDate: Date) {
    if (!range?.from || range.to) {
      setRange({ from: triggerDate, to: undefined })
      return
    }
    const ordered =
      triggerDate < range.from
        ? { from: triggerDate, to: range.from }
        : { from: range.from, to: triggerDate }
    setRange(ordered)
    setCustom({ start: startOfDay(ordered.from), end: endOfDay(ordered.to) })
    onApply()
  }

  return (
    <Calendar
      mode='range'
      numberOfMonths={2}
      autoFocus
      defaultMonth={range?.from ?? DASHBOARD_MIN_DATE}
      selected={range}
      onSelect={handleSelect}
      disabled={[{ before: DASHBOARD_MIN_DATE }, { after: new Date() }]}
      locale={locale}
      className='p-3'
    />
  )
}
