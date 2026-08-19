import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import {
  CaptureDialog,
  type CaptureState,
} from '@shared/ui/components/capture/capture-dialog'
import { canCapture } from '@shared/ui/lib/capture'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PhotoCaptureProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCaptured: (file: File) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PhotoCapture({
  open,
  onOpenChange,
  onCaptured,
}: PhotoCaptureProps) {
  const { t } = useTranslation('common')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [state, setState] = useState<CaptureState>(() =>
    canCapture() ? 'asking' : 'unsupported'
  )
  const [shot, setShot] = useState<string | null>(null)

  const attach = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node
    if (node && streamRef.current) node.srcObject = streamRef.current
  }, [])

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    if (!canCapture()) return
    let left = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (left) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setState('ready')
      })
      .catch(() => {
        if (!left) setState('denied')
      })

    return () => {
      left = true
      release()
    }
  }, [release])

  function take() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    setShot(canvas.toDataURL('image/jpeg', 0.92))
    setState('review')
  }

  function retake() {
    setShot(null)
    setState('ready')
  }

  async function save() {
    if (!shot) return
    const blob = await (await fetch(shot)).blob()
    onCaptured(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
    onOpenChange(false)
  }

  return (
    <CaptureDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('capture.photoTitle')}
      state={state}
      onRetake={retake}
      stage={
        shot ? (
          <img src={shot} alt='' className='size-full object-cover' />
        ) : (
          <video
            ref={attach}
            autoPlay
            muted
            playsInline
            className='size-full object-cover'
          />
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
        ) : (
          <Button
            variant='brand'
            size='lg'
            block
            className='rounded-xl'
            disabled={state !== 'ready'}
            onClick={take}
          >
            <Camera className='size-4' />
            {t('capture.take')}
          </Button>
        )
      }
    />
  )
}
