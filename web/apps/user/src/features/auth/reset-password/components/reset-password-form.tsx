import i18n from '@/i18n/config'
import { useResetUserPassword } from '@/services/use-user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useAuthStore } from '@/stores/auth-store'

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
import { useReturnTo } from '@shared/ui/hooks/use-return-to'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z
  .object({
    password: z.string().regex(PASSWORD_REGEX, {
      error: () => i18n.t('signUp.passwordWeak', { ns: 'auth' }),
    }),
    confirmPassword: z.string().min(1, {
      error: () => i18n.t('signUp.confirmPasswordRequired', { ns: 'auth' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: () => i18n.t('signUp.passwordMismatch', { ns: 'auth' }),
    path: ['confirmPassword'],
  })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ResetPasswordFormProps = React.HTMLAttributes<HTMLFormElement> & {
  token: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const { t } = useTranslation('auth')
  const { resume } = useReturnTo()
  const resetPassword = useResetUserPassword()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: FormValues) {
    resetPassword.mutate(
      { token, new_password: data.password },
      {
        onSuccess: (result) => {
          useAuthStore.getState().setSession({
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            user: result.user,
          })
          resume()
        },
        onError: (error) => {
          form.setError('confirmPassword', {
            type: 'server',
            message: parseApiError(error).message,
          })
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <JoinedGroup>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    variant='grouped'
                    inputSize='row'
                    autoComplete='new-password'
                    placeholder={t('signUp.passwordLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    variant='grouped'
                    inputSize='row'
                    autoComplete='new-password'
                    placeholder={t('signUp.confirmPasswordLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
        </JoinedGroup>
        <Button
          disabled={resetPassword.isPending}
          variant='brand'
          block
          size='xl'
          className='mt-6'
        >
          {resetPassword.isPending && <Loader2 className='animate-spin' />}
          {t('resetPassword.submit')}
        </Button>
        <Link
          to='/forgot-password'
          search={(prev) => prev}
          className='text-brand py-1 text-center text-sm font-semibold hover:opacity-80'
        >
          {t('resetPassword.requestNewLink')}
        </Link>
      </form>
    </Form>
  )
}
