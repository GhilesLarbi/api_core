import { useEffect, useRef, useState } from 'react'
import { type PostsSearch } from '@/routes/_authenticated/posts/index'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { type NavigateFn } from '@shared/ui/components/data-table/types'
import { DataTableViewOptions } from '@shared/ui/components/data-table/view-options'
import { Input } from '@shared/ui/components/input'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const VISIBILITY_OPTIONS = ['all', 'visible', 'hidden'] as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PostsToolbarProps = {
  table: Table<AdminPost>
  search: PostsSearch
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
export function PostsToolbar({ table, search, navigate }: PostsToolbarProps) {
  const { t } = useTranslation('posts')
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

  const isFiltered = !!search.q || search.is_hidden !== undefined

  const visibility =
    search.is_hidden === undefined
      ? 'all'
      : search.is_hidden
        ? 'hidden'
        : 'visible'

  return (
    <div className='flex items-center justify-between gap-2'>
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
            className='h-10 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-inset sm:w-[240px] sm:flex-none'
          />
          <Select
            value={visibility}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  is_hidden: value === 'all' ? undefined : value === 'hidden',
                  page: 1,
                }),
              })
            }
          >
            <SelectTrigger variant='grouped' className='h-10 w-[140px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`toolbar.visibility.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </JoinedGroup>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              setQueryInput('')
              navigate({
                search: (prev) => ({
                  ...prev,
                  q: undefined,
                  is_hidden: undefined,
                  page: 1,
                }),
              })
            }}
            className='h-8 px-2 lg:px-3'
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
