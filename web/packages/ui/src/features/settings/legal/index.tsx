import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  JoinedGroup,
  JoinedSeatBoundary,
} from '@shared/ui/components/joined-group'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { cn } from '@shared/ui/lib/utils'

import { ContentSection } from '../components/content-section'
import { SettingsHeading } from '../components/settings-heading'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SettingsLegal() {
  const { t } = useTranslation('settings')
  const year = new Date().getFullYear()

  return (
    <ContentSection>
      <div className='space-y-6'>
        <SettingsHeading
          title={t('legal.title')}
          description={t('legal.description')}
        />
        <div>
          <JoinedGroup radius='lg'>
            <LegalRow to='/terms' label={t('legal.terms')} />
            <LegalRow to='/privacy' label={t('legal.privacy')} />
          </JoinedGroup>
          <p className='text-muted-foreground mt-2 text-xs'>
            {t('legal.copyright', { year })}
          </p>
        </div>
      </div>
    </ContentSection>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function LegalRow({ to, label }: { to: LinkProps['to']; label: string }) {
  const seat = useJoinedSeat()

  return (
    <Link
      to={to}
      className={cn(
        'bg-accent hover:bg-accent flex items-center justify-between px-4 py-3 text-sm transition-colors',
        seat ?? 'rounded-lg'
      )}
    >
      <JoinedSeatBoundary>
        {label}
        <ChevronRight className='text-muted-foreground size-4 rtl:rotate-180' />
      </JoinedSeatBoundary>
    </Link>
  )
}
