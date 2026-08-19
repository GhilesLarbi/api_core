import { usePosts } from '@/services/use-posts'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { usePostPanel } from '@/stores/post-panel-store'

import { ResourcePage } from '@shared/ui/components/resource-page'

import { PostPanel } from './components/post-panel'
import { PostsTable } from './components/posts-table'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const route = getRouteApi('/_authenticated/posts/')

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const DEFAULT_LIMIT = 10

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Posts() {
  const { t } = useTranslation('posts')
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { id, isOpen, close } = usePostPanel()

  const limit = search.limit ?? DEFAULT_LIMIT
  const { data, isFetching } = usePosts({
    page: search.page ?? 1,
    limit,
    q: search.q || undefined,
    is_hidden: search.is_hidden,
    sort_by: search.sort_by,
    sort_direction: search.sort_direction,
  })

  const rows = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / limit))

  const selected = rows.find((row) => row.id === id) ?? null

  return (
    <ResourcePage
      title={t('title')}
      panel={
        <PostPanel
          key={selected?.id ?? 'empty'}
          post={selected}
          open={isOpen}
          onClose={close}
          onDeleted={close}
        />
      }
    >
      <PostsTable
        data={rows}
        pageCount={pageCount}
        isFetching={isFetching}
        selectedId={isOpen ? selected?.id : undefined}
        search={search}
        navigate={navigate}
      />
    </ResourcePage>
  )
}
