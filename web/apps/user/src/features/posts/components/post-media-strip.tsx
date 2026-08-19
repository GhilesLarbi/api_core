import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { PhotoStrip } from '@shared/ui/components/photo-strip'
import { IMAGE_ACCEPT } from '@shared/ui/hooks/use-file-drop'
import { type FileUpload } from '@shared/ui/lib/upload'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const MEDIA_ACCEPT = {
  ...IMAGE_ACCEPT,
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PostMediaStripProps = {
  value: PostMedia[]
  onChange: (media: PostMedia[]) => void
  upload: FileUpload
  disabled?: boolean
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PostMediaStrip({
  value,
  onChange,
  upload,
  disabled,
  className,
}: PostMediaStripProps) {
  const { t } = useTranslation('posts')
  const uploadedTypes = useRef(new Map<string, PostMediaType>())

  const tracked: FileUpload = {
    isPending: upload.isPending,
    mutate: (file, handlers) =>
      upload.mutate(file, {
        onSuccess: (url) => {
          uploadedTypes.current.set(
            url,
            file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
          )
          handlers.onSuccess(url)
        },
        onError: handlers.onError,
      }),
  }

  return (
    <PhotoStrip
      upload={tracked}
      accept={MEDIA_ACCEPT}
      maxSizeMb={50}
      label={t('form.addMedia')}
      disabled={disabled}
      className={className}
      value={value.map((item) => item.url)}
      onChange={(urls) =>
        onChange(
          urls.map(
            (url) =>
              value.find((item) => item.url === url) ?? {
                url,
                type: uploadedTypes.current.get(url) ?? 'IMAGE',
              }
          )
        )
      }
      isVideo={(url) =>
        value.some((item) => item.url === url && item.type === 'VIDEO')
      }
    />
  )
}
