import { type ReactNode } from 'react'

import { Card } from '@shared/ui/components/card'
import { cn } from '@shared/ui/lib/utils'

import { MetricIcon, type MetricIconTone } from './metric-icon'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type VitalsCardProps = {
  title?: ReactNode
  icon?: ReactNode
  iconTone?: MetricIconTone
  action?: ReactNode
  tone?: 'light' | 'dark'
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function VitalsCard({
  title,
  icon,
  iconTone,
  action,
  tone = 'light',
  className,
  bodyClassName,
  children,
}: VitalsCardProps) {
  const hasHeader = Boolean(title || action)

  return (
    <Card
      className={cn(
        'gap-0 rounded-none border-0 py-0 shadow-none',
        tone === 'dark' ? 'dark bg-popover' : 'bg-card',
        className
      )}
    >
      {hasHeader && (
        <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-5 pb-0 sm:p-8 sm:pb-0'>
          <div className='flex items-center gap-3'>
            {icon && <MetricIcon tone={iconTone}>{icon}</MetricIcon>}
            {title && (
              <h3 className='text-lg font-medium tracking-tight sm:text-xl'>
                {title}
              </h3>
            )}
          </div>
          {action}
        </div>
      )}
      <div
        className={cn('p-5 sm:p-8', hasHeader && 'pt-5 sm:pt-6', bodyClassName)}
      >
        {children}
      </div>
    </Card>
  )
}
