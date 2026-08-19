import { useTranslation } from 'react-i18next'

import { LegalDocument, type LegalDoc } from '../legal-document'
import { LegalLayout } from '../legal-layout'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Terms() {
  const { t } = useTranslation('legal')
  const doc = t('terms', { returnObjects: true }) as LegalDoc

  return (
    <LegalLayout>
      <LegalDocument doc={doc} />
    </LegalLayout>
  )
}
