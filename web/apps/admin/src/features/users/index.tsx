import { useUsers } from '@/services/use-users'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useUserPanel } from '@/stores/user-panel-store'

import { Button } from '@shared/ui/components/button'
import { ResourcePage } from '@shared/ui/components/resource-page'
import { Can } from '@/components/can'

import { UserPanel } from './components/user-panel'
import { UsersTable } from './components/users-table'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const route = getRouteApi('/_authenticated/users/')

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const DEFAULT_LIMIT = 10

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Users() {
  const { t } = useTranslation('users')
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { id, isCreating, isOpen, select, startCreate, close } = useUserPanel()

  const limit = search.limit ?? DEFAULT_LIMIT
  const { data, isFetching } = useUsers({
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
        <Can permission='users.create'>
          <Button variant='brand' onClick={startCreate} className='shrink-0'>
            <Plus className='size-4' />
            {t('actions.addUser')}
          </Button>
        </Can>
      }
      panel={
        <UserPanel
          key={isCreating ? 'create' : (selected?.id ?? 'empty')}
          user={isCreating ? null : selected}
          isCreate={isCreating}
          open={isOpen}
          onClose={close}
          onCreated={(user) => select(user.id)}
          onDeleted={close}
        />
      }
    >
      <UsersTable
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
