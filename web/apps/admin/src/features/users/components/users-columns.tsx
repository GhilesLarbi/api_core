import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { Badge } from '@shared/ui/components/badge'
import { DataTableColumnHeader } from '@shared/ui/components/data-table/column-header'
import { Media } from '@shared/ui/components/media'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function fullName(user: User): string {
  return [user.first_name, user.last_name].filter(Boolean).join(' ')
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function useUsersColumns(): ColumnDef<User>[] {
  const { t } = useTranslation('users')

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
      accessorFn: (row) => fullName(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.name')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        const name = fullName(user)
        return (
          <div className='flex min-w-0 items-center gap-3'>
            <Media
              kind='person'
              size='lg'
              src={user.avatar_url}
              name={name || user.email}
              seed={user.id}
            />
            <p className='text-subhead min-w-0 truncate font-medium tracking-[-0.01em]'>
              {name}
            </p>
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
      id: 'email_verified_at',
      accessorFn: (row) => !!row.email_verified_at,
      header: t('columns.verified'),
      cell: ({ row }) => (
        <Badge variant={row.original.email_verified_at ? 'success' : 'muted'}>
          {row.original.email_verified_at
            ? t('status.verified')
            : t('status.unverified')}
        </Badge>
      ),
      meta: { title: t('columns.verified'), className: 'w-[150px]' },
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
