import { useMutation } from '@tanstack/react-query'

import { apiClient, ApiRoutes } from '@/lib/api-client'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
async function requestPresignedUrl(
  contentType: string
): Promise<StoragePresignedUrlResponse> {
  const { data } = await apiClient.post<StoragePresignedUrlResponse>(
    ApiRoutes.publicStorage.presignUrl,
    null,
    { params: { content_type: contentType } }
  )
  return data
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
async function uploadToPresignedUrl(
  presigned: StoragePresignedUrlResponse,
  file: File
): Promise<string> {
  if (!presigned.url || !presigned.cdn_url) {
    throw new Error('Invalid presigned upload response')
  }
  const formData = new FormData()
  for (const [key, value] of Object.entries(presigned.fields ?? {})) {
    formData.append(key, value)
  }
  formData.append('file', file)

  const response = await fetch(presigned.url, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error('File upload failed')
  }
  return presigned.cdn_url
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function useFileUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const presigned = await requestPresignedUrl(file.type)
      return uploadToPresignedUrl(presigned, file)
    },
    meta: { skipGlobalError: true },
  })
}
