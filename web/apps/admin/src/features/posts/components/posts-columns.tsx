import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { Badge } from '@shared/ui/components/badge'
import { DataTableColumnHeader } from '@shared/ui/components/data-table/column-header'
import { Media } from '@shared/ui/components/media'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function authorName(author: PostAuthor): string {
  return [author.first_name, author.last_name].filter(Boolean).join(' ')
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function usePostsColumns(): ColumnDef<AdminPost>[] {
  const { t } = useTranslation('posts')

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
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.title')} />
      ),
      cell: ({ row }) => (
        <div className='max-w-[280px] min-w-0'>
          <p className='text-subhead truncate font-medium tracking-[-0.01em]'>
            {row.original.title}
          </p>
          <p className='text-muted-foreground text-footnote truncate'>
            {row.original.content}
          </p>
        </div>
      ),
      meta: { title: t('columns.title'), className: 'w-[300px]' },
      enableHiding: false,
    },
    {
      id: 'author',
      accessorFn: (row) => authorName(row.author),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('columns.author')} />
      ),
      cell: ({ row }) => {
        const author = row.original.author
        const name = authorName(author)
        return (
          <div className='flex min-w-0 items-center gap-3'>
            <Media
              kind='person'
              size='lg'
              src={author.avatar_url}
              name={name || author.email}
              seed={author.id}
            />
            <div className='min-w-0'>
              <p className='text-subhead truncate font-medium tracking-[-0.01em]'>
                {name}
              </p>
              <p className='text-muted-foreground text-footnote truncate'>
                {author.email}
              </p>
            </div>
          </div>
        )
      },
      meta: { title: t('columns.author'), className: 'w-[260px]' },
      enableSorting: false,
    },
    {
      id: 'media',
      header: t('columns.media'),
      cell: ({ row }) => {
        const media = row.original.media
        if (media.length === 0) return <span />
        return (
          <div className='flex -space-x-2'>
            {media
              .slice(0, 3)
              .map((item, index) =>
                item.type === 'VIDEO' ? (
                  <video
                    key={index}
                    src={item.url}
                    muted
                    playsInline
                    preload='metadata'
                    className='ring-background bg-accent size-8 rounded-lg object-cover ring-2'
                  />
                ) : (
                  <img
                    key={index}
                    src={item.url}
                    alt=''
                    className='ring-background bg-accent size-8 rounded-lg object-cover ring-2'
                  />
                )
              )}
            {media.length > 3 && (
              <span className='bg-muted text-muted-foreground text-footnote ring-background flex size-8 items-center justify-center rounded-lg font-medium tabular-nums ring-2'>
                +{media.length - 3}
              </span>
            )}
          </div>
        )
      },
      meta: { title: t('columns.media'), className: 'w-[120px]' },
      enableSorting: false,
    },
    {
      id: 'is_hidden',
      accessorKey: 'is_hidden',
      header: t('columns.visibility'),
      cell: ({ row }) => (
        <Badge variant={row.original.is_hidden ? 'muted' : 'success'}>
          {row.original.is_hidden
            ? t('visibility.hidden')
            : t('visibility.visible')}
        </Badge>
      ),
      meta: { title: t('columns.visibility'), className: 'w-[130px]' },
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
