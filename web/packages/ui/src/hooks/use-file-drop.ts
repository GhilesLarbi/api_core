import { useCallback, useState } from 'react'
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { type FileUpload } from '@shared/ui/lib/upload'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const IMAGE_ACCEPT: Accept = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const DOCUMENT_ACCEPT: Accept = {
  ...IMAGE_ACCEPT,
  'application/pdf': ['.pdf'],
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type UseFileDropOptions = {
  upload: FileUpload
  onChange: (url: string | null) => void
  accept?: Accept
  disabled?: boolean
  maxSizeMb?: number
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function useFileDrop({
  upload,
  onChange,
  accept = IMAGE_ACCEPT,
  disabled,
  maxSizeMb = 2,
}: UseFileDropOptions) {
  const { t } = useTranslation('common')
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null)
      if (rejected.length > 0) {
        const code = rejected[0].errors[0]?.code
        setError(
          code === 'file-too-large'
            ? t('upload.fileTooLarge')
            : t('upload.invalidFileType')
        )
        return
      }
      const file = accepted[0]
      if (!file) return
      upload.mutate(file, {
        onSuccess: (cdnUrl) => onChange(cdnUrl),
        onError: () => setError(t('upload.failed')),
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, t]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeMb * 1024 * 1024,
    maxFiles: 1,
    multiple: false,
    disabled: disabled || upload.isPending,
  })

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    error,
    isPending: upload.isPending,
  }
}
