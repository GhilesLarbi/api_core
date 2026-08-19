import i18n from '@/i18n/config'
import { useUpdateAppConfig } from '@/services/use-app-config'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useCan } from '@/lib/permissions'

import { Button } from '@shared/ui/components/button'
import { Checkbox } from '@shared/ui/components/checkbox'
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
  maintenance_mode: z.boolean(),
  support_email: z.union([
    z.literal(''),
    z.email({
      error: () => i18n.t('appConfig.supportEmailInvalid', { ns: 'settings' }),
    }),
  ]),
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FormValues = z.infer<typeof formSchema>

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AppConfigForm({ config }: { config: AppConfig }) {
  const { t } = useTranslation('settings')
  const updateAppConfig = useUpdateAppConfig()

  const canEdit = useCan('app_config.update')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maintenance_mode: config.maintenance_mode,
      support_email: config.support_email ?? '',
    },
  })

  function onSubmit(values: FormValues) {
    updateAppConfig.mutate(
      {
        maintenance_mode: values.maintenance_mode,
        support_email: values.support_email || null,
      },
      {
        onSuccess: () => form.reset(values),
        onError: (error) => {
          form.setError('support_email', {
            type: 'server',
            message: parseApiError(error).message,
          })
        },
      }
    )
  }

  const disabled = !canEdit || updateAppConfig.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='maintenance_mode'
          render={({ field }) => (
            <FormItem>
              <div className='bg-muted hover:bg-accent flex items-center gap-3 rounded-lg ps-4 transition-colors'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
                <ListRow
                  tone='plain'
                  hover={false}
                  className='min-w-0 flex-1 ps-0'
                  label={t('appConfig.maintenanceLabel')}
                  description={t('appConfig.maintenanceDescription')}
                  onClick={() => {
                    if (!disabled) field.onChange(!field.value)
                  }}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-3'>
          <h3 className='font-semibold'>{t('appConfig.supportEmailLabel')}</h3>
          <FormField
            control={form.control}
            name='support_email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type='email'
                    variant='filled'
                    inputSize='row'
                    placeholder={t('appConfig.supportEmailLabel')}
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' disabled={disabled}>
          {updateAppConfig.isPending && (
            <Loader2 className='size-4 animate-spin' />
          )}
          {t('appConfig.submit')}
        </Button>
      </form>
    </Form>
  )
}
