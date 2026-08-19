import { useEffect, useRef, useState } from 'react'
import {
  useSavedPostsFeed,
  useSavePost,
  useUnsavePost,
} from '@/services/use-posts'
import { usePublicPosts, usePublicPostsFeed } from '@/services/use-public-posts'
import { useNavigate } from '@tanstack/react-router'
import { Newspaper, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/stores/auth-store'
import { toggleSavedPost, useSavedPostsStore } from '@/stores/saved-posts-store'

import { Button } from '@shared/ui/components/button'
import { SegmentedControl } from '@shared/ui/components/segmented-control'
import { Skeleton } from '@shared/ui/components/skeleton'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'
import { Container } from '@/components/layout/container'

import { NewPostModal } from './components/new-post-modal'
import { PostCard } from './components/post-card'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PostsTab = 'all' | 'saved'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SKELETON_CELLS = [0, 1, 2, 3, 4, 5]

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Posts() {
  const { t } = useTranslation('posts')
  const navigate = useNavigate()
  const signedIn = useAuthStore((state) => Boolean(state.accessToken))
  const savedIds = useSavedPostsStore((state) => state.ids)
  const savePost = useSavePost()
  const unsavePost = useUnsavePost()
  const [tab, setTab] = useState<PostsTab>('all')
  const [composing, setComposing] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const visitorSaved = tab === 'saved' && !signedIn

  const publicFeed = usePublicPostsFeed()
  const savedFeed = useSavedPostsFeed()
  const visitorSavedQuery = usePublicPosts(
    { ids: savedIds },
    visitorSaved && savedIds.length > 0
  )

  const feed = tab === 'saved' && signedIn ? savedFeed : publicFeed
  const pages = feed.data?.pages ?? []
  const feedItems = pages.flatMap((page) => page.items)
  const visitorItems = (visitorSavedQuery.data?.items ?? []).filter((post) =>
    savedIds.includes(post.id)
  )
  const posts = visitorSaved ? visitorItems : feedItems
  const loading = visitorSaved ? visitorSavedQuery.isLoading : feed.isPending
  const queryError = visitorSaved
    ? visitorSavedQuery.isError
      ? visitorSavedQuery.error
      : null
    : feed.isError
      ? feed.error
      : null

  const { fetchNextPage, hasNextPage } = feed
  const showSentinel = !visitorSaved && !loading && posts.length > 0

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage({ cancelRefetch: false })
        }
      },
      { rootMargin: '400px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage, showSentinel])

  function isSaved(post: Post) {
    return signedIn ? post.is_saved : savedIds.includes(post.id)
  }

  function toggleSave(post: Post) {
    if (!signedIn) {
      toggleSavedPost(post.id)
      return
    }
    if (post.is_saved) {
      unsavePost.mutate(post.id)
    } else {
      savePost.mutate(post.id)
    }
  }

  function compose() {
    if (signedIn) {
      setComposing(true)
    } else {
      void navigate({ to: '/login', search: { redirect: '/posts' } })
    }
  }

  return (
    <Container className='w-full space-y-6 py-(--page-gutter) [--page-gutter:--spacing(8)]'>
      <div className='bg-background/85 z-sticky sticky top-(--navbar-height) -mx-4 flex flex-wrap items-center justify-between gap-3 px-4 py-3 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'>
        <SegmentedControl
          value={tab}
          onValueChange={setTab}
          label={t('title')}
          options={[
            { value: 'all', label: t('tabs.all') },
            { value: 'saved', label: t('tabs.saved') },
          ]}
        />
        <Button variant='brand' onClick={compose}>
          <Plus />
          {t('newPost')}
        </Button>
      </div>

      <div className='mx-auto w-full max-w-lg space-y-6'>
        <div className='space-y-3'>
          {loading ? (
            SKELETON_CELLS.map((index) => (
              <div
                key={index}
                className='bg-card flex min-h-96 flex-col overflow-hidden rounded-2xl'
              >
                <Skeleton className='aspect-[3/4] w-full rounded-none' />
                <div className='space-y-2 p-4'>
                  <Skeleton className='h-4 w-2/3 rounded-md' />
                  <Skeleton className='h-3 w-full rounded-md' />
                </div>
              </div>
            ))
          ) : queryError ? (
            <div className='bg-card flex min-h-80 items-center justify-center rounded-2xl px-8'>
              <p className='text-destructive text-footnote text-center'>
                {parseApiError(queryError).message}
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className='bg-card flex min-h-80 flex-col items-center justify-center gap-2 rounded-2xl px-8 text-center'>
              <Newspaper className='text-muted-foreground/40 size-8' />
              <p className='text-subhead font-medium'>
                {tab === 'saved' ? t('emptySaved.title') : t('empty.title')}
              </p>
              <p className='text-muted-foreground text-footnote'>
                {tab === 'saved'
                  ? t('emptySaved.description')
                  : t('empty.description')}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                saved={isSaved(post)}
                onToggleSave={() => toggleSave(post)}
              />
            ))
          )}
        </div>

        {showSentinel && <div ref={sentinelRef} />}
      </div>

      <NewPostModal open={composing} onOpenChange={setComposing} />
    </Container>
  )
}
