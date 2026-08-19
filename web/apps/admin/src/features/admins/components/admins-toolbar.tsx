import { useEffect, useRef, useState } from 'react'
import { type AdminsSearch } from '@/routes/_authenticated/admins/index'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { type NavigateFn } from '@shared/ui/components/data-table/types'
import { DataTableViewOptions } from '@shared/ui/components/data-table/view-options'
import { Input } from '@shared/ui/components/input'
import { JoinedGroup } from '@shared/ui/components/joined-group'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AdminsToolbarProps = {
  table: Table<Admin>
  search: AdminsSearch
  navigate: NavigateFn
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AdminsToolbar({ table, search, navigate }: AdminsToolbarProps) {
  const { t } = useTranslation('admins')
  const [queryInput, setQueryInput] = useState(search.q ?? '')

  const debouncedQuery = useDebounce(queryInput, 400)

  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) return
    navigate({
      search: (prev) => ({ ...prev, q: debouncedQuery || undefined }),
    })
  }, [debouncedQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true
  }, [])

  const isFiltered = !!search.q

  const handleReset = () => {
    setQueryInput('')
    navigate({
      search: (prev) => ({ ...prev, q: undefined }),
    })
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
            placeholder={t('toolbar.searchPlaceholder')}
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className='h-10 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-inset sm:w-[280px] sm:flex-none'
          />
        </JoinedGroup>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleReset}
            size='sm'
            className='lg:px-3'
          >
            {t('actions.reset', { ns: 'common' })}
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
