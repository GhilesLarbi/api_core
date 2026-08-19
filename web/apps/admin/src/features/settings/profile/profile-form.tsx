import i18n from '@/i18n/config'
import { useAdminMe, useUpdateAdmin } from '@/services/use-admin-auth'
import { useFileUpload } from '@/services/use-storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

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
const PHONE_PATTERN = /^[0-9\s\-+()]{10,20}$/

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z.object({
  first_name: z.string().min(2, {
    error: () => i18n.t('profile.firstNameRequired', { ns: 'settings' }),
  }),
  last_name: z.string().min(2, {
    error: () => i18n.t('profile.lastNameRequired', { ns: 'settings' }),
  }),
  email: z.email({
    error: () => i18n.t('profile.emailInvalid', { ns: 'settings' }),
  }),
  phone: z.union([
    z.literal(''),
    z.string().regex(PHONE_PATTERN, {
      error: () => i18n.t('profile.phoneInvalid', { ns: 'settings' }),
    }),
  ]),
  avatar_url: z.string().nullable(),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ProfileForm() {
  const { t } = useTranslation('settings')
  const { data: admin } = useAdminMe()
  const updateAdmin = useUpdateAdmin()
  const upload = useFileUpload()

  const name =
    [admin?.first_name, admin?.last_name].filter(Boolean).join(' ') ||
    admin?.email

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: admin?.first_name ?? '',
      last_name: admin?.last_name ?? '',
      email: admin?.email ?? '',
      phone: admin?.phone ?? '',
      avatar_url: admin?.avatar_url ?? null,
    },
  })

  function onSubmit(values: FormValues) {
    updateAdmin.mutate(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone || undefined,
        avatar_url: values.avatar_url,
      },
      {
        onSuccess: () => form.reset(values),
        onError: (error) => {
          form.setError(
            values.email !== admin?.email ? 'email' : 'first_name',
            {
              type: 'server',
              message: parseApiError(error).message,
            }
          )
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
                    placeholder={t('profile.lastNameLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant='grouped'
                    inputSize='row'
                    type='email'
                    autoComplete='email'
                    placeholder={t('profile.emailLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant='grouped'
                    inputSize='row'
                    type='tel'
                    placeholder={t('profile.phoneLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
        </JoinedGroup>
        <Button type='submit' disabled={updateAdmin.isPending}>
          {updateAdmin.isPending && <Loader2 className='size-4 animate-spin' />}
          {t('profile.submit')}
        </Button>
      </form>
    </Form>
  )
}
