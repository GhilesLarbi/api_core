import i18n from '@/i18n/config'
import { useChangeUserPassword } from '@/services/use-account'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@shared/ui/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@shared/ui/components/form'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { PasswordInput } from '@shared/ui/components/password-input'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z
  .object({
    old_password: z.string().min(1, {
      error: () => i18n.t('security.oldPasswordRequired', { ns: 'settings' }),
    }),
    new_password: z
      .string()
      .min(8, {
        error: () => i18n.t('security.passwordMinLength', { ns: 'settings' }),
      })
      .regex(/[a-z]/, {
        error: () => i18n.t('security.passwordLowercase', { ns: 'settings' }),
      })
      .regex(/[A-Z]/, {
        error: () => i18n.t('security.passwordUppercase', { ns: 'settings' }),
      })
      .regex(/[0-9]/, {
        error: () => i18n.t('security.passwordNumber', { ns: 'settings' }),
      })
      .regex(/[^a-zA-Z0-9]/, {
        error: () => i18n.t('security.passwordSpecialChar', { ns: 'settings' }),
      }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    error: () => i18n.t('security.passwordMismatch', { ns: 'settings' }),
    path: ['confirm_password'],
  })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ChangePasswordView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const changePassword = useChangeUserPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { old_password: '', new_password: '', confirm_password: '' },
  })

  function onSubmit(values: FormValues) {
    changePassword.mutate(
      { old_password: values.old_password, new_password: values.new_password },
      {
        onSuccess: () => {
          form.reset()
          onBack()
        },
        onError: (error) => {
          const parsed = parseApiError(error)
          form.setError(
            parsed.errorType === 'COMPROMISED_PASSWORD'
              ? 'new_password'
              : 'old_password',
            {
              type: 'server',
              message: parsed.message,
            }
          )
        },
      }
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon-sm'
          shape='circle'
          onClick={onBack}
          className='-ms-2'
        >
          <ChevronLeft className='size-6 rtl:rotate-180' />
        </Button>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('security.changePassword')}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='old_password'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    variant='filled'
                    inputSize='row'
                    placeholder={t('security.oldPasswordLabel')}
                    autoComplete='current-password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <JoinedGroup radius='lg'>
            <FormField
              control={form.control}
              name='new_password'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      variant='grouped'
                      inputSize='row'
                      placeholder={t('security.newPasswordLabel')}
                      autoComplete='new-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='px-4' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirm_password'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      variant='grouped'
                      inputSize='row'
                      placeholder={t('security.confirmPasswordLabel')}
                      autoComplete='new-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='px-4' />
                </FormItem>
              )}
            />
          </JoinedGroup>

          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={onBack}
              className='text-muted-foreground'
            >
              {tCommon('actions.cancel')}
            </Button>
            <Button
              type='submit'
              disabled={changePassword.isPending}
              variant='brand'
              className='px-6'
            >
              {changePassword.isPending && <Loader2 className='animate-spin' />}
              {tCommon('actions.done')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
