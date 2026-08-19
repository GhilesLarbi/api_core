import { useTranslation } from 'react-i18next'

import { ContentSection } from '@shared/ui/features/settings/components/content-section'
import { SettingsHeading } from '@shared/ui/features/settings/components/settings-heading'

import { EmailSection } from './email-section'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsEmail() {
  const { t } = useTranslation('settings')

  return (
    <ContentSection>
      <div className='space-y-6'>
        <SettingsHeading
          title={t('email.title')}
          description={t('email.description')}
        />
        <EmailSection />
      </div>
    </ContentSection>
  )
}
