import i18n from '@/i18n/config'
import { useUserRegister } from '@/services/use-user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { IconFacebook, IconGoogle } from '@shared/ui/assets/brand-icons'
import { Button } from '@shared/ui/components/button'
import { Field } from '@shared/ui/components/field'
import { FieldGroup } from '@shared/ui/components/field-group'
import { Form } from '@shared/ui/components/form'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { useReturnTo } from '@shared/ui/hooks/use-return-to'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const NAME_MIN = 2

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z
  .object({
    first_name: z.string().min(NAME_MIN, {
      error: () => i18n.t('signUp.firstNameRequired', { ns: 'auth' }),
    }),
    last_name: z.string().min(NAME_MIN, {
      error: () => i18n.t('signUp.lastNameRequired', { ns: 'auth' }),
    }),
    email: z.email({
      error: (iss) =>
        iss.input === ''
          ? i18n.t('login.emailRequired', { ns: 'auth' })
          : undefined,
    }),
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
export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation('auth')
  const { resume } = useReturnTo()
  const register = useUserRegister()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: FormValues) {
    register.mutate(
      {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      },
      {
        onSuccess: () => resume(),
        onError: (error) => {
          form.setError('email', {
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
        <FieldGroup>
          <JoinedGroup direction='grid' radius='none'>
            <Field
              name='first_name'
              autoComplete='given-name'
              placeholder={t('signUp.firstNameLabel')}
            />
            <Field
              name='last_name'
              autoComplete='family-name'
              placeholder={t('signUp.lastNameLabel')}
            />
          </JoinedGroup>
          <Field
            name='email'
            type='email'
            autoComplete='email'
            placeholder={t('signUp.emailLabel')}
          />
          <Field
            name='password'
            as='password'
            autoComplete='new-password'
            placeholder={t('signUp.passwordLabel')}
          />
          <Field
            name='confirmPassword'
            as='password'
            autoComplete='new-password'
            placeholder={t('signUp.confirmPasswordLabel')}
          />
        </FieldGroup>

        <span className='text-muted-foreground py-1 text-center text-sm'>
          {t('social.or')}
        </span>

        <Button
          type='button'
          disabled={register.isPending}
          variant='outline'
          block
          className='h-12 rounded-xl'
        >
          <IconGoogle className='size-5' /> {t('social.google')}
        </Button>
        <Button
          type='button'
          disabled={register.isPending}
          variant='outline'
          block
          className='h-12 rounded-xl'
        >
          <IconFacebook className='size-5' /> {t('social.facebook')}
        </Button>

        <Button
          type='submit'
          disabled={register.isPending}
          variant='brand'
          block
          size='xl'
          className='mt-6'
        >
          {register.isPending && <Loader2 className='animate-spin' />}
          {t('signUp.submit')}
        </Button>
      </form>
    </Form>
  )
}
