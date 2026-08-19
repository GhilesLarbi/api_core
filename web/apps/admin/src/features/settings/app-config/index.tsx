import { useAppConfig } from '@/services/use-app-config'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@shared/ui/components/skeleton'
import { ContentSection } from '@shared/ui/features/settings/components/content-section'
import { SettingsHeading } from '@shared/ui/features/settings/components/settings-heading'

import { AppConfigForm } from './app-config-form'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsAppConfig() {
  const { t } = useTranslation('settings')
  const appConfig = useAppConfig()

  return (
    <ContentSection>
      <div className='space-y-6'>
        <SettingsHeading
          title={t('appConfig.title')}
          description={t('appConfig.description')}
        />
        {appConfig.isPending ? (
          <div className='space-y-2'>
            {[0, 1].map((i) => (
              <Skeleton key={i} className='h-16 w-full rounded-lg' />
            ))}
          </div>
        ) : appConfig.isError ? (
          <p className='text-destructive text-sm'>
            {t('appConfig.loadFailed')}
          </p>
        ) : (
          <AppConfigForm config={appConfig.data} />
        )}
      </div>
    </ContentSection>
  )
}
