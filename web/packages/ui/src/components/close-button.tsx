import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function CloseButton({
  onClick,
  label,
  tone = 'default',
  className,
}: {
  onClick: () => void
  label?: string
  tone?: 'default' | 'photo'
  className?: string
}) {
  const { t } = useTranslation('common')

  return (
    <Button
      variant={tone === 'photo' ? 'photo' : 'secondary'}
      size='icon-sm'
      shape='circle'
      onClick={onClick}
      aria-label={label ?? t('actions.close')}
      className={cn(
        'size-7 shrink-0',
        tone === 'default' && 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <X className='size-3.5' strokeWidth={2.5} />
    </Button>
  )
}
