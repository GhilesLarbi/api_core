import { type UsersSearch } from '@/routes/_authenticated/users/index'
import { useTranslation } from 'react-i18next'
import { FaUsers } from 'react-icons/fa'

import { useUserPanel } from '@/stores/user-panel-store'

import { DataTable } from '@shared/ui/components/data-table/data-table'
import { type NavigateFn } from '@shared/ui/components/data-table/types'

import { useUsersColumns } from './users-columns'
import { UsersToolbar } from './users-toolbar'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SORTABLE_COLUMNS: Record<string, UserSortBy> = {
  first_name: 'FIRST_NAME',
  email: 'EMAIL',
  created_at: 'CREATED_AT',
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type UsersTableProps = {
  data: User[]
  pageCount: number
  isFetching: boolean
  selectedId: string | undefined
  search: UsersSearch
  navigate: NavigateFn
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function UsersTable({
  data,
  pageCount,
  isFetching,
  selectedId,
  search,
  navigate,
}: UsersTableProps) {
  const { t } = useTranslation('users')
  const columns = useUsersColumns()
  const select = useUserPanel((s) => s.select)

  return (
    <DataTable
      data={data}
      columns={columns}
      isFetching={isFetching}
      search={search}
      navigate={navigate}
      sortable={SORTABLE_COLUMNS}
      defaultSortBy='CREATED_AT'
      pageCount={pageCount}
      getRowId={(user) => user.id}
      selectedId={selectedId}
      onRowClick={(user) => select(user.id)}
      toolbar={(table) => (
        <UsersToolbar table={table} search={search} navigate={navigate} />
      )}
      empty={{
        icon: <FaUsers className='text-muted-foreground/40 size-8' />,
        title: t('table.emptyTitle'),
        subtitle: t('table.emptySubtitle'),
      }}
    />
  )
}
