import { useState } from 'react'
import i18n from '@/i18n/config'
import {
  useRequestUserEmailChange,
  useResendUserVerification,
} from '@/services/use-account'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useAuthStore } from '@/stores/auth-store'

import { IconFacebook, IconGoogle } from '@shared/ui/assets/brand-icons'
import { Button } from '@shared/ui/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@shared/ui/components/form'
import { Input } from '@shared/ui/components/input'
import { ListRow } from '@shared/ui/components/list-row'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z.object({
  email: z.email({
    error: () => i18n.t('email.newEmailRequired', { ns: 'settings' }),
  }),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function EmailSection() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const user = useAuthStore((s) => s.user)
  const requestEmailChange = useRequestUserEmailChange()
  const resendVerification = useResendUserVerification()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const defaults = {
    email: user?.email ?? '',
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  })

  const isPending = requestEmailChange.isPending

  function onSubmit(values: FormValues) {
    setSuccessMessage(null)
    if (values.email !== user?.email) {
      requestEmailChange.mutate(
        { new_email: values.email },
        {
          onSuccess: () => {
            setSuccessMessage(t('email.changeRequested'))
            form.resetField('email', { defaultValue: user?.email ?? '' })
          },
          onError: (error) => {
            form.setError('email', {
              type: 'server',
              message: parseApiError(error).message,
            })
          },
        }
      )
    }
  }

  return (
    <div className='space-y-8'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-3'>
            <h3 className='font-semibold'>{t('email.emailLabel')}</h3>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type='email'
                      variant='filled'
                      inputSize='row'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!user?.email_verified_at && (
              <Button
                variant='plain'
                size='sm'
                disabled={resendVerification.isPending}
                onClick={() => resendVerification.mutate()}
                className='h-auto px-0 font-semibold'
              >
                {t('email.resendVerification')}
              </Button>
            )}
            {successMessage && (
              <p className='text-success text-sm'>{successMessage}</p>
            )}
          </div>

          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => {
                form.reset(defaults)
                setSuccessMessage(null)
              }}
              className='text-muted-foreground'
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={isPending}
              variant='brand'
              className='px-6'
            >
              {isPending && <Loader2 className='animate-spin' />}
              {tCommon('actions.done')}
            </Button>
          </div>
        </form>
      </Form>

      <div className='space-y-3'>
        <h3 className='font-semibold'>{t('email.connectedAccounts')}</h3>
        <div className='grid gap-3 sm:grid-cols-2'>
          <ListRow
            size='lg'
            label={
              <span className='font-medium'>{t('email.connectGoogle')}</span>
            }
            trailing={<IconGoogle className='size-5' />}
          />
          <ListRow
            size='lg'
            label={
              <span className='font-medium'>{t('email.connectFacebook')}</span>
            }
            trailing={<IconFacebook className='size-5' />}
          />
        </div>
      </div>
    </div>
  )
}
