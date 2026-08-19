import { useState } from 'react'
import i18n from '@/i18n/config'
import { useFileUpload } from '@/services/use-storage'
import { useCreateUser, useUpdateUser } from '@/services/use-users'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useCan } from '@/lib/permissions'

import { Button } from '@shared/ui/components/button'
import { PhotoWell } from '@shared/ui/components/file-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form'
import { Input } from '@shared/ui/components/input'
import { PasswordInput } from '@shared/ui/components/password-input'
import { SidePanel } from '@shared/ui/components/side-panel'
import { parseApiError } from '@shared/ui/lib/error-dialog-store'

import { DeleteUserButton } from './delete-user-button'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const NAME = z.union([
  z.literal(''),
  z
    .string()
    .min(2, {
      error: () => i18n.t('validation.nameTooShort', { ns: 'users' }),
    })
    .max(255),
])

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const baseSchema = z.object({
  email: z.email({
    error: () => i18n.t('validation.emailInvalid', { ns: 'users' }),
  }),
  first_name: NAME,
  last_name: NAME,
  avatar_url: z.string(),
  password: z.string(),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof baseSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const createSchema = baseSchema.extend({
  password: z
    .string()
    .min(8, {
      error: () => i18n.t('validation.passwordWeak', { ns: 'users' }),
    })
    .refine(
      (value) =>
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /\d/.test(value) &&
        /[^a-zA-Z0-9]/.test(value),
      { error: () => i18n.t('validation.passwordWeak', { ns: 'users' }) }
    ),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type UserPanelProps = {
  user: User | null
  isCreate: boolean
  open: boolean
  onClose: () => void
  onCreated: (user: User) => void
  onDeleted: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function UserPanel({
  user,
  isCreate,
  open,
  onClose,
  onCreated,
  onDeleted,
}: UserPanelProps) {
  const { t } = useTranslation('users')
  const { t: tCommon } = useTranslation('common')
  const upload = useFileUpload()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const [serverError, setServerError] = useState<string | null>(null)

  const canEdit = useCan(isCreate ? 'users.create' : 'users.update')
  const canDelete = useCan('users.delete')

  const schema: z.ZodType<FormValues, FormValues> = isCreate
    ? (createSchema as unknown as z.ZodType<FormValues, FormValues>)
    : baseSchema

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? '',
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      avatar_url: user?.avatar_url ?? '',
      password: '',
    },
  })

  function handleError(error: unknown) {
    const { errorType, message } = parseApiError(error)
    if (errorType === 'ALREADY_EXISTS') {
      form.setError('email', { type: 'server', message })
      return
    }
    if (errorType === 'COMPROMISED_PASSWORD') {
      form.setError('password', { type: 'server', message })
      return
    }
    setServerError(message)
  }

  async function onSubmit(values: FormValues) {
    setServerError(null)

    try {
      if (!user) {
        const created = await createUser.mutateAsync({
          email: values.email,
          first_name: values.first_name || undefined,
          last_name: values.last_name || undefined,
          avatar_url: values.avatar_url || undefined,
          password: values.password,
        })
        onCreated(created)
        return
      }

      if (form.formState.isDirty) {
        await updateUser.mutateAsync({
          userId: user.id,
          payload: {
            email: values.email,
            first_name: values.first_name || null,
            last_name: values.last_name || null,
            avatar_url: values.avatar_url || null,
          },
        })
      }
      form.reset(values)
    } catch (error) {
      handleError(error)
    }
  }

  const isSubmitting = createUser.isPending || updateUser.isPending
  const disabled = !canEdit || isSubmitting
  const canSave = disabled ? false : isCreate || form.formState.isDirty

  if (!isCreate && !user) {
    return (
      <SidePanel title={t('panel.emptyTitle')} open={open} onClose={onClose}>
        <p className='text-muted-foreground text-sm'>{t('panel.emptyBody')}</p>
      </SidePanel>
    )
  }

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : ''

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={isCreate ? t('panel.createTitle') : displayName}
      actions={
        user &&
        canDelete && <DeleteUserButton user={user} onDeleted={onDeleted} />
      }
      footer={
        <Button
          type='submit'
          form='user-form'
          disabled={!canSave}
          variant='brand'
          size='lg'
          block
          className='rounded-xl'
        >
          {isSubmitting && <Loader2 className='size-4 animate-spin' />}
          {tCommon('actions.save')}
        </Button>
      }
    >
      <Form {...form}>
        <form
          id='user-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <Section title={t('panel.profile')}>
            <FormField
              control={form.control}
              name='avatar_url'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PhotoWell
                      kind='person'
                      label={t('fields.avatar')}
                      value={field.value}
                      onChange={(url: string | null) =>
                        field.onChange(url ?? '')
                      }
                      upload={upload}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.firstName')}</FormLabel>
                    <FormControl>
                      <Input disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='last_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.lastName')}</FormLabel>
                    <FormControl>
                      <Input disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          <Section title={t('panel.account')}>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('fields.email')}
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input type='email' disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCreate && (
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('fields.password')}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <PasswordInput disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </Section>

          {serverError && (
            <p className='text-destructive text-sm'>{serverError}</p>
          )}
        </form>
      </Form>
    </SidePanel>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function RequiredMark() {
  return <span className='text-destructive'> *</span>
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-3'>
      <h3 className='text-muted-foreground text-xs font-semibold uppercase'>
        {title}
      </h3>
      {children}
    </div>
  )
}
