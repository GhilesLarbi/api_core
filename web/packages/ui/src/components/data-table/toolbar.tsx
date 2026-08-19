import { useEffect, useRef, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { ChevronDownIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { DataTableViewOptions } from '@shared/ui/components/data-table/view-options'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shared/ui/components/dropdown-menu'
import { Input } from '@shared/ui/components/input'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { useDebounce } from '@shared/ui/hooks/use-debounce'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { fieldVariants } from '@shared/ui/lib/field-variants'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SEARCH_DELAY = 400

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type ToolbarFilter<TValue extends string> = {
  placeholder: string
  summary: (count: number) => string
  options: { value: TValue; label: React.ReactNode }[]
  selected: TValue[]
  onChange: (selected: TValue[]) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type DataTableToolbarProps<TData, TValue extends string> = {
  table: Table<TData>
  searchPlaceholder: string
  search: string
  onSearch: (search: string) => void
  filter?: ToolbarFilter<TValue>
  onReset: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DataTableToolbar<TData, TValue extends string>({
  table,
  searchPlaceholder,
  search,
  onSearch,
  filter,
  onReset,
}: DataTableToolbarProps<TData, TValue>) {
  const { t } = useTranslation('common')
  const [draft, setDraft] = useState(search)
  const settled = useDebounce(draft, SEARCH_DELAY)
  const typed = useRef(false)

  useEffect(() => {
    if (typed.current) onSearch(settled)
  }, [settled]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtering = Boolean(search) || (filter?.selected.length ?? 0) > 0

  function reset() {
    typed.current = false
    setDraft('')
    onReset()
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <JoinedGroup
          direction='row'
          radius='lg'
          className='h-10 w-full sm:w-auto'
        >
          <Input
            placeholder={searchPlaceholder}
            value={draft}
            onChange={(event) => {
              typed.current = true
              setDraft(event.target.value)
            }}
            className='h-10 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-inset sm:w-[240px] sm:flex-none'
          />
          {filter && <FilterMenu filter={filter} />}
        </JoinedGroup>
        {filtering && (
          <Button variant='ghost' onClick={reset} size='sm' className='lg:px-3'>
            {t('actions.reset')}
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function FilterMenu<TValue extends string>({
  filter,
}: {
  filter: ToolbarFilter<TValue>
}) {
  const seat = useJoinedSeat()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          fieldVariants({ variant: 'grouped' }),
          seat,
          'h-10 w-[130px] items-center justify-between gap-2 whitespace-nowrap sm:w-[150px]'
        )}
      >
        <span
          className={cn(
            'truncate',
            filter.selected.length === 0 && 'text-muted-foreground'
          )}
        >
          {filter.selected.length === 0
            ? filter.placeholder
            : filter.summary(filter.selected.length)}
        </span>
        <ChevronDownIcon className='size-4 opacity-50' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        {filter.options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            className='rounded-lg py-2 pe-3'
            checked={filter.selected.includes(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) =>
              filter.onChange(
                checked
                  ? [...filter.selected, option.value]
                  : filter.selected.filter((value) => value !== option.value)
              )
            }
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
