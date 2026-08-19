import { useEffect, useState } from 'react'
import { Mic, Square } from 'lucide-react'
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
type AudioCaptureProps = {
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
export function AudioCapture({
  open,
  onOpenChange,
  onCaptured,
}: AudioCaptureProps) {
  const { t } = useTranslation('common')
  const [elapsed, setElapsed] = useState(0)
  const [clip, setClip] = useState<Blob | null>(null)
  const mimeType = recorderMimeType('audio')
  const fileType = mimeType?.split(';')[0]

  const {
    status,
    startRecording,
    stopRecording,
    clearBlobUrl,
    mediaBlobUrl,
    error,
  } = useReactMediaRecorder({
    audio: true,
    video: false,
    askPermissionOnMount: false,
    mediaRecorderOptions: mimeType ? { mimeType } : undefined,
    blobPropertyBag: fileType ? { type: fileType } : undefined,
    onStop: (_url, blob) => setClip(blob),
  })

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
    const extension = clip.type.includes('mp4') ? 'm4a' : 'webm'
    onCaptured(new File([clip], `voice-note.${extension}`, { type: clip.type }))
    onOpenChange(false)
  }

  return (
    <CaptureDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('capture.audioTitle')}
      state={state}
      onRetake={begin}
      stage={
        mediaBlobUrl ? (
          <audio src={mediaBlobUrl} controls className='w-4/5' />
        ) : (
          <div className='flex flex-col items-center gap-3 text-white'>
            <Mic
              className={
                status === 'recording' ? 'size-10 animate-pulse' : 'size-10'
              }
            />
            <p className='text-2xl font-semibold tabular-nums'>
              {seconds(elapsed)}
            </p>
          </div>
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
            <Mic className='size-4' />
            {t('capture.record')}
          </Button>
        )
      }
    />
  )
}
