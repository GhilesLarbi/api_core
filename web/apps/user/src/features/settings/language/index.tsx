import { type Language } from '@/i18n/config'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { JoinedGroup } from '@shared/ui/components/joined-group'
import { ListRow } from '@shared/ui/components/list-row'
import { useLanguage } from '@shared/ui/context/language-provider'
import { ContentSection } from '@shared/ui/features/settings/components/content-section'
import { SettingsHeading } from '@shared/ui/features/settings/components/settings-heading'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsLanguage() {
  const { t } = useTranslation('settings')
  const { language, setLanguage, supported } = useLanguage()

  return (
    <ContentSection>
      <div className='space-y-6'>
        <SettingsHeading
          title={t('language.title')}
          description={t('language.description')}
        />
        <JoinedGroup radius='lg'>
          {supported.map((lng) => (
            <ListRow
              key={lng}
              joined
              onClick={() => setLanguage(lng)}
              label={
                <span className={cn(lng === language && 'font-medium')}>
                  {LANGUAGE_NAMES[lng]}
                </span>
              }
              trailing={
                lng === language ? (
                  <Check className='text-brand size-4' />
                ) : undefined
              }
            />
          ))}
        </JoinedGroup>
      </div>
    </ContentSection>
  )
}
