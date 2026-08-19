import { useLayoutEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Bookmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { JoinedSeatBoundary } from '@shared/ui/components/joined-group'
import { Media } from '@shared/ui/components/media'
import { PhotoStrip } from '@shared/ui/components/photo-strip'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PostCardProps = {
  post: Post
  saved: boolean
  onToggleSave: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PostCard({ post, saved, onToggleSave }: PostCardProps) {
  const { t } = useTranslation('posts')
  const seat = useJoinedSeat()
  const frame = useRef<HTMLDivElement>(null)
  const caption = useRef<HTMLDivElement>(null)
  const authorName = [post.author.first_name, post.author.last_name]
    .filter(Boolean)
    .join(' ')
  const date = format(new Date(post.created_at), 'd MMM yyyy')
  const mediaUrls = post.media.map((item) => item.url)

  useLayoutEffect(() => {
    const node = frame.current
    const text = caption.current
    if (!node || !text) return
    const publish = () => {
      node.style.setProperty(
        '--caption-h',
        `${text.getBoundingClientRect().height}px`
      )
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(text)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      className={cn(
        'bg-card relative isolate flex min-h-96 flex-col overflow-hidden',
        seat ?? 'rounded-2xl'
      )}
    >
      <JoinedSeatBoundary>
        {mediaUrls.length > 0 ? (
          <div
            ref={frame}
            className='relative z-10 aspect-[3/4] w-full [--caption-h:0px]'
          >
            <PhotoStrip
              fill
              value={mediaUrls}
              isVideo={(url) =>
                post.media.some(
                  (item) => item.url === url && item.type === 'VIDEO'
                )
              }
              dotsClassName='bottom-[calc(var(--caption-h)+22px)]'
              name={post.title}
              seed={post.id}
            />
            <div className='pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/40 to-transparent pt-16'>
              <div ref={caption} className='px-4 pb-4'>
                <h3 className='text-subhead line-clamp-1 font-medium text-white'>
                  {post.title}
                </h3>
                <p className='text-footnote mt-0.5 line-clamp-2 leading-relaxed text-white/80'>
                  {post.content}
                </p>
                <p className='text-caption mt-1 text-white/60'>{date}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 px-8 pt-16 pb-10 text-center'>
            <h3 className='text-body font-semibold'>{post.title}</h3>
            <p className='text-muted-foreground text-footnote line-clamp-4 leading-relaxed'>
              {post.content}
            </p>
            <p className='text-muted-foreground text-caption'>{date}</p>
          </div>
        )}

        <div className='bg-background/80 pointer-events-none absolute start-3 top-3 z-10 flex max-w-[70%] items-center gap-1.5 rounded-full py-1 ps-1 pe-2.5 backdrop-blur'>
          <Media
            kind='person'
            size='sm'
            src={post.author.avatar_url}
            name={authorName}
            seed={post.author.id}
          />
          <span className='text-caption truncate font-medium'>
            {authorName}
          </span>
        </div>

        <Button
          variant='photo'
          size='icon'
          shape='circle'
          aria-label={t('save')}
          aria-pressed={saved}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onToggleSave()
          }}
          className='absolute end-3 top-3 z-10'
        >
          <Bookmark className={cn('size-4', saved && 'fill-current')} />
        </Button>
      </JoinedSeatBoundary>
    </article>
  )
}
