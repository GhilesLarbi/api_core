import { useState } from 'react'
import {
  ArrowUpRight,
  Camera,
  Loader2,
  Mic,
  Plus,
  Video,
  X,
} from 'lucide-react'
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { AudioCapture } from '@shared/ui/components/capture/audio-capture'
import { PhotoCapture } from '@shared/ui/components/capture/photo-capture'
import { VideoCapture } from '@shared/ui/components/capture/video-capture'
import { CloseButton } from '@shared/ui/components/close-button'
import {
  JoinedGroup,
  JoinedSeatBoundary,
} from '@shared/ui/components/joined-group'
import { Media } from '@shared/ui/components/media'
import { useAttachmentLabels } from '@shared/ui/hooks/use-attachment-labels'
import {
  DOCUMENT_ACCEPT,
  IMAGE_ACCEPT,
  useFileDrop,
} from '@shared/ui/hooks/use-file-drop'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { type FileUpload } from '@shared/ui/lib/upload'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PhotoWellProps = {
  value?: string | null
  onChange: (url: string | null) => void
  upload: FileUpload
  kind?: 'person' | 'brand'
  size?: 'lg' | 'xl' | '2xl' | 'full'
  name?: string | null
  seed?: string | null
  label?: string
  disabled?: boolean
  maxSizeMb?: number
  capture?: boolean
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PhotoWell({
  value,
  onChange,
  upload,
  kind = 'person',
  size = 'xl',
  name,
  seed,
  label,
  disabled,
  maxSizeMb = 2,
  capture,
  className,
}: PhotoWellProps) {
  const { t } = useTranslation('common')
  const { getRootProps, getInputProps, isDragActive, error, isPending } =
    useFileDrop({ upload, onChange, accept: IMAGE_ACCEPT, disabled, maxSizeMb })
  const [shooting, setShooting] = useState(false)
  const [captureError, setCaptureError] = useState<string | null>(null)
  const shownError = error ?? captureError

  const fills = size === 'full'

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        fills ? 'w-full' : 'items-center',
        className
      )}
    >
      {label && fills && (
        <p className='text-sm leading-none font-medium'>{label}</p>
      )}
      <div className={cn('relative', fills && 'w-full')}>
        <div
          {...getRootProps()}
          aria-label={t('upload.uploadImage')}
          className={cn(
            'press bg-accent cursor-pointer overflow-hidden rounded-full outline-none',
            fills && 'block w-full',
            isDragActive && 'ring-ring ring-2 ring-offset-2',
            disabled && 'pointer-events-none opacity-40'
          )}
        >
          <input {...getInputProps()} />
          <Media kind={kind} size={size} src={value} name={name} seed={seed} />
          {isPending && (
            <div className='absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/40'>
              <Loader2 className='size-5 animate-spin text-white' />
            </div>
          )}
        </div>

        {capture ? (
          <Button
            type='button'
            variant='brand'
            shape='circle'
            size='icon-sm'
            disabled={disabled || isPending}
            aria-label={t('capture.photoTitle')}
            onClick={() => setShooting(true)}
            className={cn(
              'ring-card absolute ring-2',
              fills ? 'end-3 bottom-3 size-9' : '-end-0.5 -bottom-0.5 size-7'
            )}
          >
            <Camera className={fills ? 'size-4' : 'size-3.5'} />
          </Button>
        ) : (
          <span
            aria-hidden
            className={cn(
              'bg-brand ring-card pointer-events-none absolute flex items-center justify-center rounded-full ring-2',
              fills ? 'end-3 bottom-3 size-9' : '-end-0.5 -bottom-0.5 size-7'
            )}
          >
            <Camera
              className={cn('text-white', fills ? 'size-4' : 'size-3.5')}
            />
          </span>
        )}

        {shooting && (
          <PhotoCapture
            open
            onOpenChange={() => setShooting(false)}
            onCaptured={(file) => {
              setCaptureError(null)
              upload.mutate(file, {
                onSuccess: (url) => onChange(url),
                onError: () => setCaptureError(t('upload.failed')),
              })
            }}
          />
        )}

        {value && !isPending && (
          <CloseButton
            onClick={() => onChange(null)}
            label={t('upload.removeDocument')}
            className={cn(
              'ring-card absolute ring-2',
              fills ? 'end-3 top-3 size-8' : '-end-0.5 -top-0.5 size-6'
            )}
          />
        )}
      </div>

      {label && !fills && !shownError && (
        <p className='text-muted-foreground text-footnote text-center'>
          {label}
        </p>
      )}
      {shownError && (
        <p
          className={cn(
            'text-destructive text-footnote',
            fills ? 'px-1' : 'text-center'
          )}
        >
          {shownError}
        </p>
      )}
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type RowProps = {
  label: string
  src?: string | null
  busy?: boolean
  filled: boolean
  onOpen?: () => void
  onClear: () => void
  disabled?: boolean
  trailing?: React.ReactNode
  rootProps: Record<string, unknown>
  inputProps: Record<string, unknown>
  isDragActive: boolean
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Row({
  label,
  src,
  busy,
  filled,
  onOpen,
  onClear,
  disabled,
  trailing,
  rootProps,
  inputProps,
  isDragActive,
}: RowProps) {
  const { t } = useTranslation('common')
  const seat = useJoinedSeat()

  return (
    <div
      {...rootProps}
      className={cn(
        'bg-muted flex min-w-0 cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
        'hover:bg-accent',
        seat ?? 'rounded-2xl',
        isDragActive && 'ring-ring ring-2 ring-inset',
        disabled && 'pointer-events-none opacity-40'
      )}
    >
      <input {...inputProps} />
      <Media kind='document' size='md' src={src} />
      <span className='min-w-0 flex-1 truncate text-sm'>{label}</span>
      {busy ? (
        <Loader2 className='text-muted-foreground size-4 shrink-0 animate-spin' />
      ) : filled ? (
        <span className='flex shrink-0 items-center gap-1'>
          {onOpen && (
            <Button
              variant='secondary'
              size='icon-sm'
              shape='circle'
              data-row-passive
              onClick={(event) => {
                event.stopPropagation()
                onOpen()
              }}
              aria-label={t('upload.viewDocument')}
              className='text-muted-foreground hover:text-foreground size-6'
            >
              <ArrowUpRight className='size-3.5' strokeWidth={2.5} />
            </Button>
          )}
          <button
            type='button'
            data-row-passive
            onClick={(event) => {
              event.stopPropagation()
              onClear()
            }}
            aria-label={t('upload.removeDocument')}
            className='bg-accent text-muted-foreground hover:text-destructive press flex size-6 items-center justify-center rounded-full'
          >
            <X className='size-3' strokeWidth={2.5} />
          </button>
        </span>
      ) : (
        <span className='flex shrink-0 items-center gap-1'>
          {trailing}
          <Plus className='text-muted-foreground size-4' />
        </span>
      )}
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FileRowProps = {
  value?: string | null
  onChange: (url: string | null) => void
  upload: FileUpload
  label: string
  accept?: Accept
  disabled?: boolean
  maxSizeMb?: number
  trailing?: React.ReactNode
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function FileRow({
  value,
  onChange,
  upload,
  label,
  accept = DOCUMENT_ACCEPT,
  disabled,
  maxSizeMb = 5,
  trailing,
  className,
}: FileRowProps) {
  const { getRootProps, getInputProps, isDragActive, error, isPending } =
    useFileDrop({ upload, onChange, accept, disabled, maxSizeMb })

  return (
    <div className={className}>
      <Row
        label={label}
        src={value}
        busy={isPending}
        filled={Boolean(value)}
        onOpen={
          value
            ? () => window.open(value, '_blank', 'noopener,noreferrer')
            : undefined
        }
        onClear={() => onChange(null)}
        disabled={disabled}
        trailing={trailing}
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
      />
      {error && (
        <p className='text-destructive text-footnote mt-1 px-4'>{error}</p>
      )}
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LocalFileRowProps = {
  file: File | null
  onFile: (file: File | null) => void
  label: string
  accept?: Accept
  disabled?: boolean
  maxSizeMb?: number
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LocalFileRow({
  file,
  onFile,
  label,
  accept = DOCUMENT_ACCEPT,
  disabled,
  maxSizeMb = 10,
  className,
}: LocalFileRowProps) {
  const { t } = useTranslation('common')
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize: maxSizeMb * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
    disabled,
    onDrop: (accepted: File[], rejected: FileRejection[]) => {
      setError(null)
      if (rejected.length > 0) {
        setError(
          rejected[0].errors[0]?.code === 'file-too-large'
            ? t('upload.fileTooLarge')
            : t('upload.invalidFileType')
        )
        return
      }
      if (accepted[0]) onFile(accepted[0])
    },
  })

  return (
    <div className={cn('min-w-0', className)}>
      <Row
        label={file ? file.name : label}
        busy={false}
        filled={Boolean(file)}
        onOpen={
          file
            ? () => {
                const url = URL.createObjectURL(file)
                window.open(url, '_blank', 'noopener,noreferrer')
                setTimeout(() => URL.revokeObjectURL(url), 0)
              }
            : undefined
        }
        onClear={() => onFile(null)}
        disabled={disabled}
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
      />
      {error && (
        <p className='text-destructive text-footnote mt-1 px-4'>{error}</p>
      )}
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LocalFileRowsProps = {
  files: File[]
  onFiles: (files: File[]) => void
  addLabel: string
  accept?: Accept
  disabled?: boolean
  maxSizeMb?: number
  max?: number
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LocalFileRows({
  files,
  onFiles,
  addLabel,
  accept = DOCUMENT_ACCEPT,
  disabled,
  maxSizeMb = 10,
  max = 5,
  className,
}: LocalFileRowsProps) {
  return (
    <JoinedGroup className={className}>
      {files.map((file, index) => (
        <LocalFileRow
          key={`${file.name}-${index}`}
          file={file}
          label={file.name}
          accept={accept}
          disabled={disabled}
          maxSizeMb={maxSizeMb}
          onFile={(next) => {
            const copy = [...files]
            if (next) copy[index] = next
            else copy.splice(index, 1)
            onFiles(copy)
          }}
        />
      ))}
      {files.length < max && (
        <LocalFileRow
          file={null}
          label={addLabel}
          accept={accept}
          disabled={disabled}
          maxSizeMb={maxSizeMb}
          onFile={(next) => {
            if (next) onFiles([...files, next])
          }}
        />
      )}
    </JoinedGroup>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FileRowsProps = {
  values: string[]
  onChange: (urls: string[]) => void
  upload: FileUpload
  addLabel: string
  itemLabel?: (index: number) => string
  accept?: Accept
  disabled?: boolean
  maxSizeMb?: number
  max?: number
  capture?: boolean
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function FileRows({
  values,
  onChange,
  upload,
  addLabel,
  itemLabel,
  accept = DOCUMENT_ACCEPT,
  disabled,
  maxSizeMb = 5,
  max = 5,
  capture,
  className,
}: FileRowsProps) {
  const { t } = useTranslation('common')
  const labelFor = useAttachmentLabels()(values)
  const [recorder, setRecorder] = useState<'photo' | 'video' | 'audio' | null>(
    null
  )
  const [busy, setBusy] = useState(false)

  function keep(file: File) {
    setBusy(true)
    upload.mutate(file, {
      onSuccess: (url) => {
        setBusy(false)
        onChange([...values, url])
      },
      onError: () => setBusy(false),
    })
  }

  return (
    <JoinedGroup className={className}>
      {values.map((url, index) => (
        <FileRow
          key={url}
          value={url}
          label={itemLabel ? itemLabel(index) : labelFor[index]}
          upload={upload}
          accept={accept}
          disabled={disabled}
          maxSizeMb={maxSizeMb}
          onChange={(next) => {
            const copy = [...values]
            if (next) copy[index] = next
            else copy.splice(index, 1)
            onChange(copy)
          }}
        />
      ))}
      {values.length < max && (
        <FileRow
          label={addLabel}
          upload={upload}
          accept={accept}
          disabled={disabled || busy}
          maxSizeMb={maxSizeMb}
          onChange={(next) => {
            if (next) onChange([...values, next])
          }}
          trailing={
            capture &&
            (busy ? (
              <Loader2 className='text-muted-foreground size-4 animate-spin' />
            ) : (
              (
                [
                  ['photo', Camera, 'capture.photoTitle'],
                  ['video', Video, 'capture.videoTitle'],
                  ['audio', Mic, 'capture.audioTitle'],
                ] as const
              ).map(([kind, Icon, label]) => (
                <Button
                  key={kind}
                  type='button'
                  variant='secondary'
                  size='icon-sm'
                  shape='circle'
                  data-row-passive
                  disabled={disabled}
                  aria-label={t(label)}
                  onClick={(event) => {
                    event.stopPropagation()
                    setRecorder(kind)
                  }}
                  className='size-6'
                >
                  <Icon className='size-3.5' />
                </Button>
              ))
            ))
          }
        />
      )}

      {recorder === 'photo' && (
        <PhotoCapture
          open
          onOpenChange={() => setRecorder(null)}
          onCaptured={keep}
        />
      )}
      {recorder === 'video' && (
        <VideoCapture
          open
          onOpenChange={() => setRecorder(null)}
          onCaptured={keep}
        />
      )}
      {recorder === 'audio' && (
        <AudioCapture
          open
          onOpenChange={() => setRecorder(null)}
          onCaptured={keep}
        />
      )}
    </JoinedGroup>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AttachmentRowsProps = {
  urls: string[]
  itemLabel?: (index: number) => string
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AttachmentRows({
  urls,
  itemLabel,
  className,
}: AttachmentRowsProps) {
  const { t } = useTranslation('common')
  const labelFor = useAttachmentLabels()(urls)

  if (urls.length === 0) return null

  return (
    <JoinedGroup radius='xl' className={className}>
      {urls.map((url, index) => (
        <AttachmentRow
          key={url}
          url={url}
          label={itemLabel ? itemLabel(index) : labelFor[index]}
          openLabel={t('upload.viewDocument')}
        />
      ))}
    </JoinedGroup>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function AttachmentRow({
  url,
  label,
  openLabel,
}: {
  url: string
  label: string
  openLabel: string
}) {
  const seat = useJoinedSeat()

  return (
    <button
      type='button'
      onClick={() => window.open(url, '_blank', 'noopener')}
      aria-label={openLabel}
      className={cn(
        'bg-muted hover:bg-accent flex min-w-0 cursor-pointer items-center gap-3 px-4 py-3 text-start transition-colors',
        seat ?? 'rounded-xl'
      )}
    >
      <JoinedSeatBoundary>
        <Media kind='document' size='md' src={url} />
        <span className='min-w-0 flex-1 truncate text-sm'>{label}</span>
        <ArrowUpRight
          className='text-muted-foreground size-4 shrink-0'
          strokeWidth={2.5}
        />
      </JoinedSeatBoundary>
    </button>
  )
}
