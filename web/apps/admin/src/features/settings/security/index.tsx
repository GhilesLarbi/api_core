import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const [changingPassword, setChangingPassword] = useState(false)
  const [viewingDevices, setViewingDevices] = useState(false)

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
        </div>
      )}
    </ContentSection>
  )
}
