import { type Table } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select'
import { cn, getPageNumbers } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type DataTablePaginationProps<TData> = {
  table: Table<TData>
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DataTablePagination<TData>({
  table,
  className,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation('common')
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = Math.max(1, table.getPageCount())
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div
      className={cn('flex items-center justify-between gap-4 px-1', className)}
    >
      <div className='flex items-center gap-2'>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger inputSize='sm' className='w-[4.5rem]'>
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side='top'>
            {[10, 15, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='text-muted-foreground text-footnote hidden sm:block'>
          {t('table.rowsPerPage')}
        </p>
      </div>

      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon-sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>{t('table.goToPreviousPage')}</span>
          <ChevronLeft className='size-4 rtl:rotate-180' />
        </Button>

        {pageNumbers.map((pageNumber, index) =>
          pageNumber === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className='text-muted-foreground text-footnote flex size-8 items-center justify-center'
            >
              …
            </span>
          ) : (
            <Button
              key={`${pageNumber}-${index}`}
              variant={currentPage === pageNumber ? 'default' : 'ghost'}
              size='icon-sm'
              className='text-footnote tabular-nums'
              onClick={() => table.setPageIndex((pageNumber as number) - 1)}
            >
              <span className='sr-only'>
                {t('table.goToPage', { page: pageNumber })}
              </span>
              {pageNumber}
            </Button>
          )
        )}

        <Button
          variant='ghost'
          size='icon-sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>{t('table.goToNextPage')}</span>
          <ChevronRight className='size-4 rtl:rotate-180' />
        </Button>
      </div>
    </div>
  )
}
