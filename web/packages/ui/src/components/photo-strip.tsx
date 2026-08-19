import * as React from 'react'
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import { type Accept } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { CloseButton } from '@shared/ui/components/close-button'
import {
  JoinedGroup,
  JoinedSeatBoundary,
} from '@shared/ui/components/joined-group'
import { Media } from '@shared/ui/components/media'
import { IMAGE_ACCEPT, useFileDrop } from '@shared/ui/hooks/use-file-drop'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { type FileUpload } from '@shared/ui/lib/upload'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const CARD = 'size-64 shrink-0'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SEAM = 2

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const CARD_STEP = 256 + SEAM

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const DRAG_THRESHOLD = 3

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const FLICK = 0.15

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function alignTo(node: HTMLDivElement | null, size: number, smooth: boolean) {
  if (!node || !size) return
  const target = Math.round(node.scrollLeft / size) * size
  if (Math.abs(node.scrollLeft - target) > 1) {
    node.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' })
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PhotoStripProps = {
  value: string[]
  onChange?: (urls: string[]) => void
  upload?: FileUpload
  accept?: Accept
  isVideo?: (url: string) => boolean
  dotsClassName?: string
  name?: string | null
  seed?: string | null
  fill?: boolean
  label?: React.ReactNode
  disabled?: boolean
  maxSizeMb?: number
  error?: React.ReactNode
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PhotoStrip({
  value,
  onChange,
  upload,
  accept,
  isVideo,
  dotsClassName,
  name,
  seed,
  fill,
  label,
  disabled,
  maxSizeMb,
  error,
  className,
}: PhotoStripProps) {
  const { t } = useTranslation('common')
  const track = React.useRef<HTMLDivElement>(null)
  const drag = React.useRef<{
    from: number
    left: number
    pulled: boolean
  } | null>(null)

  const [page, setPage] = React.useState(0)
  const [atStart, setAtStart] = React.useState(true)
  const [atEnd, setAtEnd] = React.useState(true)
  const [shown, setShown] = React.useState(0)
  const [uploadError, setUploadError] = React.useState<string | null>(null)

  const editing = Boolean(onChange && upload)
  const size = editing ? CARD_STEP : fill ? page : page + SEAM

  const measure = React.useCallback(() => {
    const node = track.current
    if (!node) return
    const travelled = Math.abs(node.scrollLeft)
    const travel = node.scrollWidth - node.clientWidth
    setAtStart(travelled <= 1)
    setAtEnd(travelled >= travel - 1)
    if (node.clientWidth > 0) {
      setShown(Math.round(travelled / node.clientWidth))
    }
  }, [])

  React.useEffect(measure, [measure, value.length, page])

  React.useEffect(() => {
    alignTo(track.current, size, false)
  }, [size])

  React.useEffect(() => {
    const node = track.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      setPage(entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width)
      measure()
    })
    observer.observe(node)
    setPage(node.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [measure])

  function facing() {
    const node = track.current
    if (!node) return 1
    return getComputedStyle(node).direction === 'rtl' ? -1 : 1
  }

  function scroll(direction: -1 | 1) {
    track.current?.scrollBy({
      left: direction * facing() * size,
      behavior: 'smooth',
    })
  }

  function scrollTo(index: number) {
    track.current?.scrollTo({
      left: facing() * index * size,
      behavior: 'smooth',
    })
  }

  function align() {
    if (drag.current) return
    alignTo(track.current, size, true)
  }

  function settle() {
    const node = track.current
    if (!node || !size || !drag.current?.pulled) return
    const from = Math.round(drag.current.left / size)
    const moved = node.scrollLeft - drag.current.left
    const flicked = Math.abs(moved) > size * FLICK
    node.scrollTo({
      left: (from + (flicked ? Math.sign(moved) : 0)) * size,
      behavior: 'smooth',
    })
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const node = track.current
    if (!node) return
    drag.current = { from: event.clientX, left: node.scrollLeft, pulled: false }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = track.current
    if (!drag.current || !node) return
    const moved = event.clientX - drag.current.from
    if (!drag.current.pulled && Math.abs(moved) < DRAG_THRESHOLD) return
    drag.current.pulled = true
    node.scrollLeft = drag.current.left - moved
  }

  function onPointerUp() {
    settle()
    drag.current = null
  }

  const shownError = error ?? uploadError

  return (
    <div
      className={cn(
        'min-w-0',
        fill ? 'bg-card h-full' : 'space-y-1.5',
        className
      )}
    >
      {label && (
        <span className='block text-sm leading-none font-medium select-none'>
          {label}
        </span>
      )}

      <div className={cn('@container relative min-w-0', fill && 'h-full')}>
        <div
          ref={track}
          onScroll={measure}
          onScrollEnd={align}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className={cn(
            'w-full cursor-grab overflow-x-auto select-none active:cursor-grabbing',
            fill && 'h-full',
            '[scrollbar-width:none] [&_img]:pointer-events-none [&::-webkit-scrollbar]:hidden'
          )}
        >
          {editing ? (
            <JoinedGroup direction='row' radius='2xl' className='w-max'>
              {value.map((url, index) => (
                <PhotoCard
                  key={`${url}-${index}`}
                  url={url}
                  video={isVideo?.(url)}
                  disabled={disabled}
                  removeLabel={t('upload.removeDocument')}
                  onRemove={() =>
                    onChange?.(value.filter((_, at) => at !== index))
                  }
                />
              ))}
              <AddCard
                upload={upload}
                accept={accept}
                maxSizeMb={maxSizeMb}
                disabled={disabled}
                label={t('upload.uploadImage')}
                onAdd={(url) => onChange?.([...value, url])}
                onError={setUploadError}
              />
            </JoinedGroup>
          ) : (
            <JoinedGroup
              direction='row'
              radius={fill ? 'none' : '2xl'}
              gap={fill ? 'none' : 'hairline'}
              className={cn('w-max', fill && 'h-full')}
            >
              {(value.length > 0 ? value : ['']).map((url, index) => (
                <PhotoCard
                  key={`${url}-${index}`}
                  url={url || undefined}
                  video={isVideo?.(url)}
                  page
                  fill={fill}
                  name={name}
                  seed={seed}
                />
              ))}
            </JoinedGroup>
          )}
        </div>

        <StripEdge
          side='start'
          shown={!atStart}
          fill={fill}
          label={t('actions.back')}
          onClick={() => scroll(-1)}
        />
        <StripEdge
          side='end'
          shown={!atEnd}
          fill={fill}
          label={t('actions.next')}
          onClick={() => scroll(1)}
        />

        {!editing && value.length > 1 && (
          <span
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-3 flex justify-center',
              dotsClassName
            )}
          >
            <span className='pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1.5 backdrop-blur-sm'>
              {value.map((url, index) => (
                <Dot
                  key={`${url}-${index}`}
                  index={index}
                  active={index === shown}
                  onClick={() => scrollTo(index)}
                />
              ))}
            </span>
          </span>
        )}
      </div>

      {shownError && <p className='text-destructive text-sm'>{shownError}</p>}
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Dot({
  index,
  active,
  onClick,
}: {
  index: number
  active: boolean
  onClick: () => void
}) {
  return (
    <Button
      type='button'
      variant='plain'
      size='icon-sm'
      shape='circle'
      aria-label={String(index + 1)}
      aria-current={active}
      onClick={onClick}
      className={cn(
        'size-1.5 min-h-0 rounded-full p-0 shadow-xs transition-[width,background-color] duration-200',
        active ? 'w-4 bg-white' : 'bg-white/55 hover:bg-white/80'
      )}
    />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function StripEdge({
  side,
  shown,
  fill,
  label,
  onClick,
}: {
  side: 'start' | 'end'
  shown: boolean
  fill?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type='button'
      variant='plain'
      aria-label={label}
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
      onClick={onClick}
      className={cn(
        'absolute inset-y-0 flex h-auto w-16 items-center rounded-none p-0 transition-opacity duration-200',
        shown ? 'opacity-100' : 'pointer-events-none opacity-0',
        fill
          ? 'from-black/45 via-black/10 to-transparent'
          : 'from-card via-card/60 to-transparent',
        side === 'start'
          ? 'start-0 justify-start ps-1 ltr:bg-gradient-to-r rtl:bg-gradient-to-l'
          : 'end-0 justify-end pe-1 ltr:bg-gradient-to-l rtl:bg-gradient-to-r'
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center px-2',
          fill ? 'text-white drop-shadow-sm' : 'text-foreground'
        )}
      >
        {side === 'start' ? (
          <ChevronLeft className='size-6 rtl:rotate-180' strokeWidth={2.25} />
        ) : (
          <ChevronRight className='size-6 rtl:rotate-180' strokeWidth={2.25} />
        )}
      </span>
    </Button>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function PhotoCard({
  url,
  video,
  page,
  fill,
  name,
  seed,
  onRemove,
  removeLabel,
  disabled,
}: {
  url?: string
  video?: boolean
  page?: boolean
  fill?: boolean
  name?: string | null
  seed?: string | null
  onRemove?: () => void
  removeLabel?: string
  disabled?: boolean
}) {
  const seat = useJoinedSeat()

  return (
    <div
      className={cn(
        'bg-accent relative shrink-0',
        page ? 'w-[100cqw]' : CARD,
        fill ? 'h-full rounded-none' : page ? 'aspect-square' : undefined,
        !fill && (seat ?? 'rounded-2xl')
      )}
    >
      <JoinedSeatBoundary>
        {video && url ? (
          <video
            src={url}
            muted
            playsInline
            preload='metadata'
            className='pointer-events-none size-full rounded-[inherit] object-cover'
          />
        ) : (
          <Media
            kind='document'
            size='full'
            fit='cover'
            src={url}
            name={name}
            seed={seed}
            className='aspect-auto size-full rounded-[inherit]'
          />
        )}
        {onRemove && !disabled && (
          <CloseButton
            tone='photo'
            onClick={onRemove}
            label={removeLabel}
            className='absolute end-2 top-2 size-8'
          />
        )}
      </JoinedSeatBoundary>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function AddCard({
  upload,
  accept = IMAGE_ACCEPT,
  label,
  onAdd,
  onError,
  disabled,
  maxSizeMb = 2,
}: {
  upload?: FileUpload
  accept?: Accept
  label: string
  onAdd: (url: string) => void
  onError: (message: string | null) => void
  disabled?: boolean
  maxSizeMb?: number
}) {
  const seat = useJoinedSeat()
  const drop = useFileDrop({
    upload: upload as FileUpload,
    onChange: (url) => {
      if (url) onAdd(url)
    },
    accept,
    disabled,
    maxSizeMb,
  })

  React.useEffect(() => onError(drop.error), [drop.error, onError])

  return (
    <div
      {...drop.getRootProps()}
      aria-label={label}
      className={cn(
        'press bg-muted text-muted-foreground flex cursor-pointer items-center justify-center outline-none',
        CARD,
        seat ?? 'rounded-2xl',
        drop.isDragActive && 'ring-ring ring-2 ring-inset',
        disabled && 'pointer-events-none opacity-40'
      )}
    >
      <JoinedSeatBoundary>
        <input {...drop.getInputProps()} />
        {drop.isPending ? (
          <Loader2 className='size-6 animate-spin' />
        ) : (
          <Plus className='size-8' strokeWidth={1.5} />
        )}
      </JoinedSeatBoundary>
    </div>
  )
}
