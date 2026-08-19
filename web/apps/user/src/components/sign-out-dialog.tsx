import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/stores/auth-store'

import { ConfirmDialog } from '@shared/ui/components/confirm-dialog'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type SignOutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clear = useAuthStore((s) => s.clear)
  const { t } = useTranslation('common')

  function handleSignOut() {
    clear()
    queryClient.clear()
    navigate({ to: '/', replace: true })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('signOutDialog.title')}
      desc={t('signOutDialog.description')}
      confirmText={t('actions.signOut')}
      destructive
      handleConfirm={handleSignOut}
    />
  )
}
