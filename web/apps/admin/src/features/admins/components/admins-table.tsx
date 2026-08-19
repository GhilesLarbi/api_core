import { type AdminsSearch } from '@/routes/_authenticated/admins/index'
import { useTranslation } from 'react-i18next'
import { FaUserShield } from 'react-icons/fa'

import { useAdminPanel } from '@/stores/admin-panel-store'

import { DataTable } from '@shared/ui/components/data-table/data-table'
import { type NavigateFn } from '@shared/ui/components/data-table/types'

import { useAdminsColumns } from './admins-columns'
import { AdminsToolbar } from './admins-toolbar'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SORTABLE_COLUMNS: Record<string, AdminSortBy> = {
  first_name: 'FIRST_NAME',
  email: 'EMAIL',
  created_at: 'CREATED_AT',
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AdminsTableProps = {
  data: Admin[]
  pageCount: number
  isFetching: boolean
  selectedId: string | undefined
  search: AdminsSearch
  navigate: NavigateFn
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AdminsTable({
  data,
  pageCount,
  isFetching,
  selectedId,
  search,
  navigate,
}: AdminsTableProps) {
  const { t } = useTranslation('admins')
  const columns = useAdminsColumns()
  const select = useAdminPanel((s) => s.select)

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
      getRowId={(admin) => admin.id}
      selectedId={selectedId}
      onRowClick={(admin) => select(admin.id)}
      toolbar={(table) => (
        <AdminsToolbar table={table} search={search} navigate={navigate} />
      )}
      empty={{
        icon: <FaUserShield className='text-muted-foreground/40 size-8' />,
        title: t('table.emptyTitle'),
        subtitle: t('table.emptySubtitle'),
      }}
    />
  )
}
