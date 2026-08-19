import i18n from '@/i18n/config'
import { useCreatePost } from '@/services/use-posts'
import { useFileUpload } from '@/services/use-public-storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@shared/ui/components/form'
import { Input } from '@shared/ui/components/input'
import {
  Modal,
  ModalAction,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@shared/ui/components/modal'
import { Textarea } from '@shared/ui/components/textarea'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'

import { PostMediaStrip } from './post-media-strip'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const TITLE_MIN = 2

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const MEDIA_MAX = 10

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z.object({
  title: z.string().min(TITLE_MIN, {
    error: () => i18n.t('form.titleRequired', { ns: 'posts' }),
  }),
  content: z.string().min(1, {
    error: () => i18n.t('form.contentRequired', { ns: 'posts' }),
  }),
  media: z
    .array(z.object({ url: z.string(), type: z.enum(['IMAGE', 'VIDEO']) }))
    .max(MEDIA_MAX),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type NewPostModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function NewPostModal({ open, onOpenChange }: NewPostModalProps) {
  const { t } = useTranslation('posts')
  const createPost = useCreatePost()
  const upload = useFileUpload()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', content: '', media: [] },
  })

  function close(next: boolean) {
    onOpenChange(next)
    if (!next) form.reset()
  }

  function onSubmit(values: FormValues) {
    createPost.mutate(values, {
      onSuccess: () => close(false),
      onError: (error) => {
        form.setError('title', {
          type: 'server',
          message: parseApiError(error).message,
        })
      },
    })
  }

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent closeLabel={t('form.close')}>
        <ModalHeader>
          <ModalTitle>{t('form.title')}</ModalTitle>
        </ModalHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex min-h-0 flex-1 flex-col'
          >
            <ModalBody className='space-y-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={t('form.titleLabel')}
                        aria-label={t('form.titleLabel')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='px-4' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t('form.contentLabel')}
                        aria-label={t('form.contentLabel')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='px-4' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='media'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PostMediaStrip
                        value={field.value}
                        onChange={field.onChange}
                        upload={upload}
                      />
                    </FormControl>
                    <FormMessage className='px-4' />
                  </FormItem>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <ModalAction
                tone='brand'
                variant='button'
                type='submit'
                disabled={createPost.isPending || upload.isPending}
              >
                {createPost.isPending && (
                  <Loader2 className='size-4 animate-spin' />
                )}
                {t('form.submit')}
              </ModalAction>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}
