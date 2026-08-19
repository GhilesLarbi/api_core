import { useState } from 'react'
import i18n from '@/i18n/config'
import { useResetAdminPassword } from '@/services/use-admins'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '@shared/ui/components/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form'
import {
  Modal,
  ModalAction,
  ModalContent,
  ModalFooter,
} from '@shared/ui/components/modal'
import { PasswordInput } from '@shared/ui/components/password-input'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        error: () => i18n.t('validation.passwordWeak', { ns: 'admins' }),
      })
      .refine(
        (value) =>
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /\d/.test(value) &&
          /[^a-zA-Z0-9]/.test(value),
        {
          error: () => i18n.t('validation.passwordWeak', { ns: 'admins' }),
        }
      ),
    confirm_password: z.string(),
  })
  .refine((values) => values.password === values.confirm_password, {
    path: ['confirm_password'],
    error: () => i18n.t('validation.passwordMismatch', { ns: 'admins' }),
  })

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AdminPasswordDialogProps = {
  admin: Admin
  open: boolean
  onOpenChange: (open: boolean) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AdminPasswordDialog(props: AdminPasswordDialogProps) {
  return (
    <Modal open={props.open} onOpenChange={props.onOpenChange}>
      <ModalContent showCloseButton={false} className='sm:max-w-lg'>
        <AdminPasswordDialogContent {...props} />
      </ModalContent>
    </Modal>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function AdminPasswordDialogContent({
  admin,
  onOpenChange,
}: AdminPasswordDialogProps) {
  const { t } = useTranslation('admins')
  const { t: tCommon } = useTranslation('common')

  const resetPassword = useResetAdminPassword()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirm_password: '' },
  })

  function onSubmit(values: FormValues) {
    setServerError(null)
    resetPassword.mutate(
      { adminId: admin.id, password: values.password },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          const { errorType, message } = parseApiError(error)
          if (errorType === 'COMPROMISED_PASSWORD') {
            form.setError('password', { type: 'server', message })
            return
          }
          setServerError(message)
        },
      }
    )
  }

  return (
    <>
      <Form {...form}>
        <form
          id='admin-password-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='-mx-5 min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4'
        >
          <div className='space-y-1'>
            <h2 className='text-lg font-bold'>{t('passwordDialog.title')}</h2>
            <p className='text-muted-foreground text-sm'>
              {admin.first_name} {admin.last_name}
            </p>
          </div>

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('passwordDialog.newPassword')}</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirm_password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('passwordDialog.confirmPassword')}</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {serverError && (
        <p className='text-destructive -mx-5 px-5 pb-2 text-sm'>
          {serverError}
        </p>
      )}

      <ModalFooter>
        <ModalAction
          type='submit'
          form='admin-password-form'
          tone='brand'
          emphasis='strong'
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending && (
            <Loader2 className='size-4 animate-spin' />
          )}
          {tCommon('actions.save')}
        </ModalAction>
        <ModalAction onClick={() => onOpenChange(false)}>
          {tCommon('actions.cancel')}
        </ModalAction>
      </ModalFooter>
    </>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PasswordButton({ admin }: { admin: Admin }) {
  const { t } = useTranslation('admins')
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant='ghost'
        size='icon-sm'
        shape='circle'
        onClick={() => setOpen(true)}
        aria-label={t('actions.changePassword')}
        title={t('actions.changePassword')}
        className='text-muted-foreground'
      >
        <KeyRound className='size-4' />
      </Button>

      {open && (
        <AdminPasswordDialog admin={admin} open={open} onOpenChange={setOpen} />
      )}
    </>
  )
}
