import { useState } from 'react'
import i18n from '@/i18n/config'
import { useForgotUserPassword } from '@/services/use-user'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailCheck } from 'lucide-react'
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
import { Input } from '@shared/ui/components/input'
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
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation('auth')
  const forgotPassword = useForgotUserPassword()
  const [sentTo, setSentTo] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  function onSubmit(data: FormValues) {
    forgotPassword.mutate(
      { email: data.email },
      {
        onSuccess: () => setSentTo(data.email),
        onError: (error) => {
          form.setError('email', {
            type: 'server',
            message: parseApiError(error).message,
          })
        },
      }
    )
  }

  if (sentTo) {
    return (
      <div className='flex flex-col items-center gap-3 py-4 text-center'>
        <div className='bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full'>
          <MailCheck className='size-5' />
        </div>
        <p className='text-sm'>
          {t('forgotPassword.emailSent', { email: sentTo })}
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  variant='filled'
                  inputSize='row'
                  className='rounded-xl'
                  placeholder={t('login.emailLabel')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={forgotPassword.isPending}
          variant='brand'
          block
          size='xl'
          className='mt-6'
        >
          {forgotPassword.isPending && <Loader2 className='animate-spin' />}
          {t('forgotPassword.submit')}
        </Button>
      </form>
    </Form>
  )
}
