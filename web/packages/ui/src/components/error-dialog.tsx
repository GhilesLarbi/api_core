import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { MessageDialog } from '@shared/ui/components/message-dialog'
import { useErrorDialog } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ErrorDialog() {
  const { t } = useTranslation('common')
  const error = useErrorDialog((s) => s.error)
  const clearError = useErrorDialog((s) => s.clearError)

  return (
    <MessageDialog
      open={Boolean(error)}
      onOpenChange={(open) => {
        if (!open) clearError()
      }}
      icon={<AlertTriangle className='text-destructive size-6' />}
      title={t('errors.title')}
      description={error?.message}
    >
      <Button variant='brand' size='xl' block onClick={clearError}>
        {t('actions.close')}
      </Button>
    </MessageDialog>
  )
}
