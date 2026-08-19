import { useRef, useState } from 'react'
import i18n from '@/i18n/config'
import { useUpdatePost } from '@/services/use-posts'
import { useFileUpload } from '@/services/use-storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useCan } from '@/lib/permissions'

import { Button } from '@shared/ui/components/button'
import { Checkbox } from '@shared/ui/components/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form'
import { Input } from '@shared/ui/components/input'
import { ListRow } from '@shared/ui/components/list-row'
import { PhotoStrip } from '@shared/ui/components/photo-strip'
import { SidePanel } from '@shared/ui/components/side-panel'
import { Textarea } from '@shared/ui/components/textarea'
import { IMAGE_ACCEPT } from '@shared/ui/hooks/use-file-drop'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'
import { type FileUpload } from '@shared/ui/lib/upload'

import { DeletePostButton } from './delete-post-button'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const MEDIA_ACCEPT = {
  ...IMAGE_ACCEPT,
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z.object({
  title: z
    .string()
    .min(2, {
      error: () => i18n.t('validation.titleTooShort', { ns: 'posts' }),
    })
    .max(255),
  content: z.string().min(1, {
    error: () => i18n.t('validation.contentRequired', { ns: 'posts' }),
  }),
  media: z
    .array(
      z.object({
        url: z.string(),
        type: z.enum(['IMAGE', 'VIDEO']),
      })
    )
    .max(10),
  is_hidden: z.boolean(),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PostPanelProps = {
  post: AdminPost | null
  open: boolean
  onClose: () => void
  onDeleted: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PostPanel({ post, open, onClose, onDeleted }: PostPanelProps) {
  const { t } = useTranslation('posts')
  const { t: tCommon } = useTranslation('common')
  const updatePost = useUpdatePost()
  const upload = useFileUpload()
  const uploadedTypes = useRef(new Map<string, PostMediaType>())
  const [serverError, setServerError] = useState<string | null>(null)

  const canEdit = useCan('posts.update')
  const canDelete = useCan('posts.delete')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title ?? '',
      content: post?.content ?? '',
      media: post?.media ?? [],
      is_hidden: post?.is_hidden ?? false,
    },
  })

  const mediaUpload: FileUpload = {
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

  async function onSubmit(values: FormValues) {
    if (!post) return
    setServerError(null)
    try {
      if (form.formState.isDirty) {
        await updatePost.mutateAsync({ postId: post.id, payload: values })
      }
      form.reset(values)
    } catch (error) {
      setServerError(parseApiError(error).message)
    }
  }

  const disabled = !canEdit || updatePost.isPending
  const canSave = disabled ? false : form.formState.isDirty

  if (!post) {
    return (
      <SidePanel title={t('panel.emptyTitle')} open={open} onClose={onClose}>
        <p className='text-muted-foreground text-sm'>{t('panel.emptyBody')}</p>
      </SidePanel>
    )
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={post.title}
      actions={
        canDelete && <DeletePostButton post={post} onDeleted={onDeleted} />
      }
      footer={
        <Button
          type='submit'
          form='post-form'
          disabled={!canSave}
          variant='brand'
          size='lg'
          block
          className='rounded-xl'
        >
          {updatePost.isPending && <Loader2 className='size-4 animate-spin' />}
          {tCommon('actions.save')}
        </Button>
      }
    >
      <Form {...form}>
        <form
          id='post-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <Section title={t('panel.details')}>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.title')}</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.content')}</FormLabel>
                  <FormControl>
                    <Textarea disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title={t('panel.media')}>
            <FormField
              control={form.control}
              name='media'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <PhotoStrip
                      upload={mediaUpload}
                      accept={MEDIA_ACCEPT}
                      maxSizeMb={50}
                      value={field.value.map((item) => item.url)}
                      onChange={(urls) =>
                        field.onChange(
                          urls.map(
                            (url) =>
                              field.value.find((item) => item.url === url) ?? {
                                url,
                                type: uploadedTypes.current.get(url) ?? 'IMAGE',
                              }
                          )
                        )
                      }
                      isVideo={(url) =>
                        field.value.some(
                          (item) => item.url === url && item.type === 'VIDEO'
                        )
                      }
                      disabled={disabled}
                      error={fieldState.error?.message}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Section>

          <Section title={t('panel.visibility')}>
            <FormField
              control={form.control}
              name='is_hidden'
              render={({ field }) => (
                <FormItem>
                  <div className='bg-muted hover:bg-accent flex items-center gap-3 rounded-lg ps-4 transition-colors'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={disabled}
                      />
                    </FormControl>
                    <ListRow
                      tone='plain'
                      hover={false}
                      className='min-w-0 flex-1 ps-0'
                      label={t('fields.hiddenLabel')}
                      onClick={() => {
                        if (!disabled) field.onChange(!field.value)
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          {serverError && (
            <p className='text-destructive text-sm'>{serverError}</p>
          )}
        </form>
      </Form>
    </SidePanel>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-3'>
      <h3 className='text-muted-foreground text-xs font-semibold uppercase'>
        {title}
      </h3>
      {children}
    </div>
  )
}
