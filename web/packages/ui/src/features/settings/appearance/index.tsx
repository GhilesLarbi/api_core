import { useTranslation } from 'react-i18next'

import { ContentSection } from '../components/content-section'
import { SettingsHeading } from '../components/settings-heading'
import { AppearanceForm } from './appearance-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsAppearance() {
  const { t } = useTranslation('settings')

  return (
    <ContentSection>
      <div className='space-y-6'>
        <SettingsHeading
          title={t('appearance.title')}
          description={t('appearance.description')}
        />
        <AppearanceForm />
      </div>
    </ContentSection>
  )
}
