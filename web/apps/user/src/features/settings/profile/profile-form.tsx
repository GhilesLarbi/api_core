import i18n from '@/i18n/config'
import { useUpdateUser } from '@/services/use-account'
import { useFileUpload } from '@/services/use-public-storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useAuthStore } from '@/stores/auth-store'

import { Button } from '@shared/ui/components/button'
import { PhotoWell } from '@shared/ui/components/file-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@shared/ui/components/form'
import { Input } from '@shared/ui/components/input'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const NAME_MIN = 2

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z.object({
  first_name: z.string().min(NAME_MIN, {
    error: () => i18n.t('profile.firstNameRequired', { ns: 'settings' }),
  }),
  last_name: z.string().min(NAME_MIN, {
    error: () => i18n.t('profile.lastNameRequired', { ns: 'settings' }),
  }),
  avatar_url: z.string().nullable(),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ProfileForm() {
  const { t } = useTranslation('settings')
  const user = useAuthStore((s) => s.user)
  const updateUser = useUpdateUser()
  const upload = useFileUpload()

  const name =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      avatar_url: user?.avatar_url ?? null,
    },
  })

  function onSubmit(values: FormValues) {
    updateUser.mutate(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        avatar_url: values.avatar_url,
      },
      {
        onError: (error) => {
          form.setError('first_name', {
            type: 'server',
            message: parseApiError(error).message,
          })
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='avatar_url'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PhotoWell
                  value={field.value}
                  onChange={field.onChange}
                  upload={upload}
                  name={name}
                  label={t('profile.photoLabel')}
                />
              </FormControl>
              <FormMessage className='text-center' />
            </FormItem>
          )}
        />
        <JoinedGroup radius='lg'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant='grouped'
                    inputSize='row'
                    autoComplete='given-name'
                    placeholder={t('profile.firstNameLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant='grouped'
                    inputSize='row'
                    autoComplete='family-name'
                    placeholder={t('profile.lastNameLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
        </JoinedGroup>
        <Button type='submit' disabled={updateUser.isPending}>
          {updateUser.isPending && <Loader2 className='size-4 animate-spin' />}
          {t('profile.submit')}
        </Button>
      </form>
    </Form>
  )
}
