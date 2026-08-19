import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/components/table'
import { cn } from '@shared/ui/lib/utils'

import { DataTablePagination } from './pagination'
import { type NavigateFn } from './types'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type SortDirection = 'ASC' | 'DESC'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const TRAILING_CELL = 'w-auto text-end'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const TRAILING_HEAD = 'w-auto text-end [&>*]:justify-end'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type DataTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  isFetching?: boolean

  search: Record<string, unknown>
  navigate: NavigateFn

  sortable?: Record<string, string>
  defaultSortBy?: string
  defaultSortDirection?: SortDirection

  pageCount: number
  defaultLimit?: number

  getRowId: (row: TData) => string
  selectedId?: string
  onRowClick?: (row: TData) => void
  rowClassName?: (row: TData) => string | undefined

  toolbar?: (table: TanStackTable<TData>) => React.ReactNode
  empty: { icon?: React.ReactNode; title: string; subtitle?: string }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DataTable<TData>({
  data,
  columns,
  isFetching = false,
  search,
  navigate,
  sortable,
  defaultSortBy,
  defaultSortDirection = 'DESC',
  pageCount,
  defaultLimit = 10,
  getRowId,
  selectedId,
  onRowClick,
  rowClassName,
  toolbar,
  empty,
}: DataTableProps<TData>) {
  const { t } = useTranslation('common')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const sorting: SortingState = useMemo(() => {
    if (!sortable) return []
    const sortBy = (search.sort_by as string | undefined) ?? defaultSortBy
    const id =
      Object.entries(sortable).find(([, value]) => value === sortBy)?.[0] ?? ''
    if (!id) return []
    const direction =
      (search.sort_direction as SortDirection | undefined) ??
      defaultSortDirection
    return [{ id, desc: direction === 'DESC' }]
  }, [sortable, search, defaultSortBy, defaultSortDirection])

  function onSortingChange(
    updater: SortingState | ((prev: SortingState) => SortingState)
  ) {
    if (!sortable) return
    const next = typeof updater === 'function' ? updater(sorting) : updater
    const column = next[0]
    navigate({
      search: (prev) => ({
        ...prev,
        sort_by:
          column && sortable[column.id] ? sortable[column.id] : defaultSortBy,
        sort_direction: (column?.desc ?? true) ? 'DESC' : 'ASC',
      }),
    })
  }

  const page = (search.page as number | undefined) ?? 1
  const limit = (search.limit as number | undefined) ?? defaultLimit

  function onPaginationChange(updater: unknown) {
    const previous = { pageIndex: page - 1, pageSize: limit }
    const next =
      typeof updater === 'function'
        ? (updater as (p: typeof previous) => typeof previous)(previous)
        : (updater as typeof previous)
    navigate({
      search: (prev) => ({
        ...prev,
        page: next.pageIndex + 1,
        limit: next.pageSize,
      }),
    })
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount,
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleFlatColumns().length

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-visible md:overflow-hidden',
        isFetching && 'opacity-70 transition-opacity'
      )}
    >
      {toolbar && <div className='shrink-0'>{toolbar(table)}</div>}

      <div className='table-surface -mx-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-none md:mx-0 md:rounded-2xl'>
        <Table
          className='w-max min-w-full table-fixed'
          containerClassName='min-h-0 flex-1 overflow-auto px-2'
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header, headerIndex) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-card border-border text-footnote sticky top-0 z-10 h-11 border-b px-4 font-medium',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName,
                      headerIndex === headerGroup.headers.length - 1 &&
                        TRAILING_HEAD
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length ? (
              rows.map((row) => {
                const id = getRowId(row.original)
                const isSelected = selectedId === id
                const cells = row.getVisibleCells()

                return (
                  <TableRow
                    key={row.id}
                    onClick={
                      onRowClick
                        ? (event) => {
                            if (
                              (event.target as HTMLElement).closest(
                                '[data-row-passive]'
                              )
                            ) {
                              return
                            }
                            onRowClick(row.original)
                          }
                        : undefined
                    }
                    className={cn(
                      'group/row border-0 hover:bg-transparent',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {cells.map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'group-hover/row:bg-accent px-4 py-4',
                          rowClassName?.(row.original),
                          cellIndex === 0 && 'rounded-s-xl',
                          isSelected && 'bg-accent',
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName,
                          cellIndex === cells.length - 1 &&
                            cn(TRAILING_CELL, 'rounded-e-xl')
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={columnCount} className='h-64 text-center'>
                  {isFetching ? (
                    <span className='text-muted-foreground'>
                      {t('status.loading')}
                    </span>
                  ) : (
                    <div className='flex flex-col items-center justify-center gap-3 py-6'>
                      {empty.icon}
                      <div className='space-y-1 text-center'>
                        <p className='font-semibold'>{empty.title}</p>
                        {empty.subtitle && (
                          <p className='text-muted-foreground text-sm'>
                            {empty.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className='shrink-0' />
    </div>
  )
}
