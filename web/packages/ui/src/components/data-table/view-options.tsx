import { type Column, type Table } from '@tanstack/react-table'
import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@shared/ui/components/dropdown-menu'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function getColumnTitle<TData>(column: Column<TData>) {
  const header = column.columnDef.header

  if (column.columnDef.meta?.title) return column.columnDef.meta.title
  if (typeof header === 'string') return header

  return column.id
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation('common')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          shape='circle'
          aria-label={t('table.toggleColumns')}
          title={t('table.toggleColumns')}
          className='text-muted-foreground data-[state=open]:bg-accent ms-auto hidden shrink-0 lg:inline-flex'
        >
          <SlidersHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-52 rounded-xl p-1'>
        <p className='text-muted-foreground px-3 pt-1.5 pb-1 text-xs'>
          {t('table.toggleColumns')}
        </p>
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            const title = getColumnTitle(column)
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='max-w-full rounded-lg py-2 pe-3'
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                <span className='block min-w-0 flex-1 truncate' title={title}>
                  {title}
                </span>
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
