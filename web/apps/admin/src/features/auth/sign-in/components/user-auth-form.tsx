import i18n from '@/i18n/config'
import { useAdminLogin } from '@/services/use-admin-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
import { Input } from '@shared/ui/components/input'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { PasswordInput } from '@shared/ui/components/password-input'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === ''
        ? i18n.t('login.emailRequired', { ns: 'auth' })
        : undefined,
  }),
  password: z.string().min(1, {
    error: () => i18n.t('login.passwordRequired', { ns: 'auth' }),
  }),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const login = useAdminLogin()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: FormValues) {
    login.mutate(data, {
      onSuccess: (result) => {
        useAuthStore.getState().setSession({
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          admin: result.admin,
        })
        navigate({ to: redirectTo || '/', replace: true })
      },
      onError: (error) => {
        form.setError('password', {
          type: 'server',
          message: parseApiError(error).message,
        })
      },
    })
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
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    variant='grouped'
                    inputSize='row'
                    placeholder={t('login.emailLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    variant='grouped'
                    inputSize='row'
                    placeholder={t('login.passwordLabel')}
                    {...field}
                  />
                </FormControl>
                <FormMessage className='px-4' />
              </FormItem>
            )}
          />
        </JoinedGroup>

        <Button
          type='submit'
          disabled={login.isPending}
          variant='brand'
          block
          size='xl'
          className='mt-6'
        >
          {login.isPending && <Loader2 className='animate-spin' />}
          {t('login.signIn')}
        </Button>
      </form>
    </Form>
  )
}
