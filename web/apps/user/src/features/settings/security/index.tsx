import { useState } from 'react'
import { useDeleteUserAccount } from '@/services/use-account'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@shared/ui/components/confirm-dialog'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { ListRow } from '@shared/ui/components/list-row'
import { ContentSection } from '@shared/ui/features/settings/components/content-section'
import { SettingsHeading } from '@shared/ui/features/settings/components/settings-heading'

import { ConnectedDevicesView } from './connected-devices'
import { ChangePasswordView } from './password-section'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsSecurity() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteAccount = useDeleteUserAccount()
  const [changingPassword, setChangingPassword] = useState(false)
  const [viewingDevices, setViewingDevices] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleDelete() {
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear()
        navigate({ to: '/', replace: true })
      },
    })
  }

  return (
    <ContentSection>
      {changingPassword ? (
        <ChangePasswordView onBack={() => setChangingPassword(false)} />
      ) : viewingDevices ? (
        <ConnectedDevicesView onBack={() => setViewingDevices(false)} />
      ) : (
        <div className='space-y-6'>
          <SettingsHeading
            title={t('security.title')}
            description={t('security.description')}
          />

          <JoinedGroup radius='lg'>
            <ListRow
              joined
              label={t('security.changePassword')}
              chevron
              onClick={() => setChangingPassword(true)}
            />

            <ListRow
              joined
              label={t('security.connectedDevices')}
              chevron
              onClick={() => setViewingDevices(true)}
            />
          </JoinedGroup>

          <div>
            <ListRow
              tone='destructive'
              size='lg'
              onClick={() => setDeleteOpen(true)}
              label={
                <span className='font-medium'>
                  {t('security.deleteAccount')}
                </span>
              }
              className='bg-accent'
            />
            <p className='text-muted-foreground mt-2 px-1 text-sm'>
              {t('security.deleteAccountDesc')}
            </p>
          </div>

          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            destructive
            title={t('security.deleteAccount')}
            desc={t('security.deleteAccountConfirmDesc')}
            confirmText={tCommon('actions.delete')}
            isLoading={deleteAccount.isPending}
            handleConfirm={handleDelete}
          />
        </div>
      )}
    </ContentSection>
  )
}
