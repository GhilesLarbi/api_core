import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { DataTableColumnHeader } from '@shared/ui/components/data-table/column-header'
import { Media } from '@shared/ui/components/media'

import { AdminPermissionsCell } from './admin-permissions-popover'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function useAdminsColumns(): ColumnDef<Admin>[] {
  const { t } = useTranslation('admins')

  return [
    {
      id: 'index',
      header: '',
      cell: ({ row }) => (
        <span className='text-muted-foreground text-xs tabular-nums'>
          #{row.index + 1}
        </span>
      ),
      meta: { className: 'w-[56px]' },
      enableHiding: false,
      enableSorting: false,
    },
    {
      id: 'first_name',
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.name')} />
      ),
      cell: ({ row }) => {
        const admin = row.original
        return (
          <div className='flex min-w-0 items-center gap-3'>
            <Media
              kind='person'
              size='lg'
              src={admin.avatar_url}
              name={`${admin.first_name} ${admin.last_name}`}
              seed={admin.id}
            />
            <div className='min-w-0'>
              <p className='text-subhead truncate font-medium tracking-[-0.01em]'>
                {admin.first_name} {admin.last_name}
              </p>
              {admin.phone && (
                <p className='text-muted-foreground text-footnote truncate'>
                  {admin.phone}
                </p>
              )}
            </div>
          </div>
        )
      },
      meta: { title: t('columns.name'), className: 'w-[280px]' },
      enableHiding: false,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.email')} />
      ),
      cell: ({ row }) => (
        <span className='text-subhead truncate tracking-[-0.01em]'>
          {row.original.email}
        </span>
      ),
      meta: { title: t('columns.email'), className: 'w-[260px] truncate' },
    },
    {
      id: 'permissions',
      accessorFn: (row) => row.permissions.length,
      header: t('columns.permissions'),
      cell: ({ row }) => <AdminPermissionsCell admin={row.original} />,
      meta: { title: t('columns.permissions'), className: 'w-[150px]' },
      enableSorting: false,
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.original.created_at
        if (!createdAt) return <span />
        return (
          <div className='inline-block whitespace-nowrap tabular-nums'>
            <p className='text-subhead tracking-[-0.01em]'>
              {format(new Date(createdAt), 'MMM d, yyyy')}
            </p>
            <p className='text-muted-foreground text-footnote text-end'>
              {format(new Date(createdAt), 'hh:mm a')}
            </p>
          </div>
        )
      },
      meta: { title: t('columns.createdAt') },
    },
  ]
}
