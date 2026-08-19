import { useTranslation } from 'react-i18next'

import { ContentSection } from '@shared/ui/features/settings/components/content-section'
import { SettingsHeading } from '@shared/ui/features/settings/components/settings-heading'

import { ProfileForm } from './profile-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsProfile() {
  const { t } = useTranslation('settings')

  return (
    <ContentSection>
      <div className='space-y-6'>
        <SettingsHeading
          title={t('profile.title')}
          description={t('profile.description')}
        />
        <ProfileForm />
      </div>
    </ContentSection>
  )
}
