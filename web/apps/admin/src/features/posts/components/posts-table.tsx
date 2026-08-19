import { type PostsSearch } from '@/routes/_authenticated/posts/index'
import { useTranslation } from 'react-i18next'
import { FaRegNewspaper } from 'react-icons/fa'

import { usePostPanel } from '@/stores/post-panel-store'

import { DataTable } from '@shared/ui/components/data-table/data-table'
import { type NavigateFn } from '@shared/ui/components/data-table/types'

import { usePostsColumns } from './posts-columns'
import { PostsToolbar } from './posts-toolbar'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SORTABLE_COLUMNS: Record<string, PostSortBy> = {
  title: 'TITLE',
  created_at: 'CREATED_AT',
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PostsTableProps = {
  data: AdminPost[]
  pageCount: number
  isFetching: boolean
  selectedId: string | undefined
  search: PostsSearch
  navigate: NavigateFn
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PostsTable({
  data,
  pageCount,
  isFetching,
  selectedId,
  search,
  navigate,
}: PostsTableProps) {
  const { t } = useTranslation('posts')
  const columns = usePostsColumns()
  const select = usePostPanel((s) => s.select)

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
      getRowId={(post) => post.id}
      selectedId={selectedId}
      onRowClick={(post) => select(post.id)}
      toolbar={(table) => (
        <PostsToolbar table={table} search={search} navigate={navigate} />
      )}
      empty={{
        icon: <FaRegNewspaper className='text-muted-foreground/40 size-8' />,
        title: t('table.emptyTitle'),
        subtitle: t('table.emptySubtitle'),
      }}
    />
  )
}
