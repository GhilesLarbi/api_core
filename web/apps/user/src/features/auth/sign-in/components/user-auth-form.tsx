import i18n from '@/i18n/config'
import { useUserLogin } from '@/services/use-user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

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
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { PasswordInput } from '@shared/ui/components/password-input'
import { useReturnTo } from '@shared/ui/hooks/use-return-to'
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
type UserAuthFormProps = React.HTMLAttributes<HTMLFormElement>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { t } = useTranslation('auth')
  const { resume } = useReturnTo()
  const login = useUserLogin()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: FormValues) {
    login.mutate(data, {
      onSuccess: () => resume(),
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

        <span className='text-muted-foreground py-1 text-center text-sm'>
          {t('social.or')}
        </span>

        <Button
          type='button'
          disabled={login.isPending}
          variant='outline'
          block
          className='h-12 rounded-xl'
        >
          <IconGoogle className='size-5' /> {t('social.google')}
        </Button>
        <Button
          type='button'
          disabled={login.isPending}
          variant='outline'
          block
          className='h-12 rounded-xl'
        >
          <IconFacebook className='size-5' /> {t('social.facebook')}
        </Button>

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

        <Link
          to='/forgot-password'
          search={(prev) => prev}
          className='text-brand py-1 text-center text-sm font-semibold hover:opacity-80'
        >
          {t('login.forgotPassword')}
        </Link>

        <p className='text-muted-foreground text-center text-sm'>
          {t('login.noAccount')}{' '}
          <Link
            to='/sign-up'
            search={(prev) => prev}
            className='text-brand font-semibold hover:opacity-80'
          >
            {t('login.signUpLink')}
          </Link>
        </p>
      </form>
    </Form>
  )
}
