import { useCallback, useEffect, useRef, useState } from 'react'
import { Square, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useReactMediaRecorder } from 'react-media-recorder'

import { Button } from '@shared/ui/components/button'
import {
  CaptureDialog,
  type CaptureState,
} from '@shared/ui/components/capture/capture-dialog'
import { recorderMimeType } from '@shared/ui/lib/capture'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type VideoCaptureProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCaptured: (file: File) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function seconds(elapsed: number) {
  const minutes = Math.floor(elapsed / 60)
  return `${minutes}:${String(elapsed % 60).padStart(2, '0')}`
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function VideoCapture({
  open,
  onOpenChange,
  onCaptured,
}: VideoCaptureProps) {
  const { t } = useTranslation('common')
  const [elapsed, setElapsed] = useState(0)
  const previewRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const attach = useCallback((node: HTMLVideoElement | null) => {
    previewRef.current = node
    if (node && streamRef.current) node.srcObject = streamRef.current
  }, [])

  const [clip, setClip] = useState<Blob | null>(null)
  const mimeType = recorderMimeType('video')
  const fileType = mimeType?.split(';')[0]

  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl,
    mediaBlobUrl,
    previewStream,
    error,
  } = useReactMediaRecorder({
    video: { facingMode: 'environment' },
    audio: true,
    askPermissionOnMount: open,
    mediaRecorderOptions: mimeType ? { mimeType } : undefined,
    blobPropertyBag: fileType ? { type: fileType } : undefined,
    onStop: (_url, blob) => setClip(blob),
  })

  useEffect(() => {
    streamRef.current = previewStream
    if (previewRef.current && previewStream) {
      previewRef.current.srcObject = previewStream
    }
  }, [previewStream])

  useEffect(() => {
    if (status !== 'recording') return
    const id = setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => clearInterval(id)
  }, [status])

  function begin() {
    setElapsed(0)
    setClip(null)
    clearBlobUrl()
    startRecording()
  }

  const state: CaptureState =
    error === 'permission_denied'
      ? 'denied'
      : error === 'media_aborted' || error === 'media_in_use'
        ? 'unsupported'
        : status === 'acquiring_media'
          ? 'asking'
          : status === 'recording'
            ? 'recording'
            : clip
              ? 'review'
              : 'ready'

  function save() {
    if (!clip) return
    const extension = clip.type.includes('mp4') ? 'mp4' : 'webm'
    onCaptured(new File([clip], `recording.${extension}`, { type: clip.type }))
    onOpenChange(false)
  }

  return (
    <CaptureDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('capture.videoTitle')}
      state={state}
      onRetake={begin}
      stage={
        mediaBlobUrl ? (
          <video
            key={mediaBlobUrl}
            src={mediaBlobUrl}
            controls
            playsInline
            preload='auto'
            className='size-full object-contain'
            onLoadedMetadata={(event) => {
              const element = event.currentTarget
              if (element.duration > 0 && Number.isFinite(element.duration)) {
                return
              }
              const settle = () => {
                element.removeEventListener('durationchange', settle)
                element.removeEventListener('timeupdate', settle)
                element.currentTime = 0
              }
              element.addEventListener('durationchange', settle)
              element.addEventListener('timeupdate', settle)
              element.currentTime = 1e101
            }}
          />
        ) : (
          <>
            <video
              ref={attach}
              autoPlay
              muted
              playsInline
              className='size-full object-cover'
            />
            {status === 'recording' && (
              <p className='absolute end-3 top-3 rounded-full bg-black/55 px-2 py-1 text-xs font-semibold text-white tabular-nums'>
                {seconds(elapsed)}
              </p>
            )}
          </>
        )
      }
      action={
        state === 'review' ? (
          <Button
            variant='brand'
            size='lg'
            block
            className='rounded-xl'
            onClick={save}
          >
            {t('capture.use')}
          </Button>
        ) : state === 'recording' ? (
          <Button
            variant='destructive'
            size='lg'
            block
            className='rounded-xl'
            onClick={stopRecording}
          >
            <Square className='size-4' />
            {t('capture.stop')}
          </Button>
        ) : (
          <Button
            variant='brand'
            size='lg'
            block
            className='rounded-xl'
            disabled={state === 'asking' || state === 'denied'}
            onClick={begin}
          >
            <Video className='size-4' />
            {t('capture.record')}
          </Button>
        )
      }
    />
  )
}
