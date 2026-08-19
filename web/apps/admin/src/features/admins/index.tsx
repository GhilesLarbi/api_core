import { useAdmins } from '@/services/use-admins'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAdminPanel } from '@/stores/admin-panel-store'

import { Button } from '@shared/ui/components/button'
import { ResourcePage } from '@shared/ui/components/resource-page'
import { Can } from '@/components/can'

import { AdminPanel } from './components/admin-panel'
import { AdminsTable } from './components/admins-table'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const route = getRouteApi('/_authenticated/admins/')

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const DEFAULT_LIMIT = 10

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Admins() {
  const { t } = useTranslation('admins')
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { id, isCreating, isOpen, select, startCreate, close } = useAdminPanel()

  const limit = search.limit ?? DEFAULT_LIMIT
  const { data, isFetching } = useAdmins({
    page: search.page ?? 1,
    limit,
    q: search.q || undefined,
    sort_by: search.sort_by,
    sort_direction: search.sort_direction,
  })

  const rows = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / limit))

  const selected = rows.find((row) => row.id === id) ?? null

  return (
    <ResourcePage
      title={t('title')}
      action={
        <Can permission='admins.create'>
          <Button variant='brand' onClick={startCreate} className='shrink-0'>
            <Plus className='size-4' />
            {t('actions.addAdmin')}
          </Button>
        </Can>
      }
      panel={
        <AdminPanel
          key={isCreating ? 'create' : (selected?.id ?? 'empty')}
          admin={isCreating ? null : selected}
          isCreate={isCreating}
          open={isOpen}
          onClose={close}
          onCreated={(admin) => select(admin.id)}
          onDeleted={close}
        />
      }
    >
      <AdminsTable
        data={rows}
        pageCount={pageCount}
        isFetching={isFetching}
        selectedId={isOpen && !isCreating ? selected?.id : undefined}
        search={search}
        navigate={navigate}
      />
    </ResourcePage>
  )
}
