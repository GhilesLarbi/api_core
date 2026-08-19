import { useState } from 'react'
import i18n from '@/i18n/config'
import {
  useCreateAdmin,
  useReplaceAdminPermissions,
  useUpdateAdmin,
} from '@/services/use-admins'
import { useFileUpload } from '@/services/use-storage'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useAuthStore } from '@/stores/auth-store'
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

import { PasswordButton } from './admin-password-dialog'
import { DeleteAdminButton } from './delete-admin-button'
import { PermissionFields } from './permission-fields'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const NAME = z
  .string()
  .min(2, {
    error: () => i18n.t('validation.nameTooShort', { ns: 'admins' }),
  })
  .max(255)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const PHONE_PATTERN = /^[0-9\s\-+()]{10,20}$/

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const baseSchema = z.object({
  email: z.email({
    error: () => i18n.t('validation.emailInvalid', { ns: 'admins' }),
  }),
  first_name: NAME,
  last_name: NAME,
  avatar_url: z.string(),
  phone: z.union([
    z.literal(''),
    z.string().regex(PHONE_PATTERN, {
      error: () => i18n.t('validation.phoneInvalid', { ns: 'admins' }),
    }),
  ]),
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
      error: () => i18n.t('validation.passwordWeak', { ns: 'admins' }),
    })
    .refine(
      (value) =>
        /[a-z]/.test(value) &&
        /[A-Z]/.test(value) &&
        /\d/.test(value) &&
        /[^a-zA-Z0-9]/.test(value),
      { error: () => i18n.t('validation.passwordWeak', { ns: 'admins' }) }
    ),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AdminPanelProps = {
  admin: Admin | null
  isCreate: boolean
  open: boolean
  onClose: () => void
  onCreated: (admin: Admin) => void
  onDeleted: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AdminPanel({
  admin,
  isCreate,
  open,
  onClose,
  onCreated,
  onDeleted,
}: AdminPanelProps) {
  const { t } = useTranslation('admins')
  const { t: tCommon } = useTranslation('common')
  const upload = useFileUpload()
  const createAdmin = useCreateAdmin()
  const updateAdmin = useUpdateAdmin()
  const replacePermissions = useReplaceAdminPermissions()
  const [serverError, setServerError] = useState<string | null>(null)

  const canEdit = useCan(isCreate ? 'admins.create' : 'admins.update')
  const canGrant = useCan('admins.grant')
  const canDelete = useCan('admins.delete')
  const canResetPassword = useCan('admins.reset_password')
  const isSelf = useAuthStore((s) => s.admin?.id) === admin?.id

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set<string>(admin?.permissions ?? [])
  )
  const [savedPermissions, setSavedPermissions] = useState<Set<string>>(
    () => new Set<string>(admin?.permissions ?? [])
  )

  const schema: z.ZodType<FormValues, FormValues> = isCreate
    ? (createSchema as unknown as z.ZodType<FormValues, FormValues>)
    : baseSchema

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: admin?.email ?? '',
      first_name: admin?.first_name ?? '',
      last_name: admin?.last_name ?? '',
      phone: admin?.phone ?? '',
      avatar_url: admin?.avatar_url ?? '',
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

  const permissionsChanged =
    selected.size !== savedPermissions.size ||
    [...selected].some((path) => !savedPermissions.has(path))

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const profile = {
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone || undefined,
      avatar_url: values.avatar_url || undefined,
    }

    try {
      if (!admin) {
        const created = await createAdmin.mutateAsync({
          ...profile,
          password: values.password,
        })
        if (canGrant && selected.size > 0) {
          await replacePermissions.mutateAsync({
            adminId: created.id,
            permissions: [...selected],
          })
        }
        onCreated(created)
        return
      }

      if (form.formState.isDirty) {
        await updateAdmin.mutateAsync({ adminId: admin.id, payload: profile })
      }
      if (canGrant && permissionsChanged) {
        await replacePermissions.mutateAsync({
          adminId: admin.id,
          permissions: [...selected],
        })
        setSavedPermissions(new Set(selected))
      }
      form.reset(values)
    } catch (error) {
      handleError(error)
    }
  }

  const isSubmitting =
    createAdmin.isPending ||
    updateAdmin.isPending ||
    replacePermissions.isPending
  const disabled = !canEdit || isSubmitting
  const canSave = disabled
    ? false
    : isCreate || form.formState.isDirty || (canGrant && permissionsChanged)

  if (!isCreate && !admin) {
    return (
      <SidePanel title={t('panel.emptyTitle')} open={open} onClose={onClose}>
        <p className='text-muted-foreground text-sm'>{t('panel.emptyBody')}</p>
      </SidePanel>
    )
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={
        isCreate
          ? t('panel.createTitle')
          : `${admin?.first_name} ${admin?.last_name}`
      }
      actions={
        admin && (
          <>
            {canResetPassword && <PasswordButton admin={admin} />}
            {canDelete && !isSelf && (
              <DeleteAdminButton admin={admin} onDeleted={onDeleted} />
            )}
          </>
        )
      }
      footer={
        <Button
          type='submit'
          form='admin-form'
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
          id='admin-form'
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
                    <FormLabel>
                      {t('fields.firstName')}
                      <RequiredMark />
                    </FormLabel>
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
                    <FormLabel>
                      {t('fields.lastName')}
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input disabled={disabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.phone')}</FormLabel>
                  <FormControl>
                    <Input disabled={disabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

          <Section title={t('panel.permissions')}>
            {isSelf && (
              <p className='text-muted-foreground bg-accent rounded-lg px-3 py-2 text-xs'>
                {t('permissionsDialog.selfWarning')}
              </p>
            )}
            <PermissionFields
              selected={selected}
              disabled={!canGrant || isSubmitting}
              onChange={setSelected}
            />
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
