import { useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { CloseButton } from '@shared/ui/components/close-button'
import { usePanelPosition } from '@shared/ui/hooks/use-panel-position'
import { useScrollEdges } from '@shared/ui/hooks/use-scroll-edges'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const panelVariants = cva(
  [
    'fixed inset-y-0 end-0 z-[60] w-full p-0 sm:max-w-md sm:p-4',
    'lg:static lg:z-auto lg:h-full lg:max-w-none lg:shrink-0 lg:ps-2',
  ],
  {
    variants: {
      size: {
        default: 'lg:w-[27rem]',
        md: 'lg:w-[24.5rem]',
        sm: 'lg:w-[23rem]',
      },
    },
    defaultVariants: { size: 'default' },
  }
)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type SidePanelProps = VariantProps<typeof panelVariants> & {
  open: boolean
  onClose: () => void
  leading?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SidePanel({
  open,
  onClose,
  leading,
  title,
  subtitle,
  actions,
  children,
  footer,
  size,
  className,
}: SidePanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const body = useScrollEdges(bodyRef)
  const { isTop, isFirst, stacked } = usePanelPosition()

  if (!open) return null

  return (
    <>
      {isTop && (
        <div
          onClick={onClose}
          className='animate-in fade-in fixed inset-0 z-[55] bg-black/40 duration-200 lg:hidden'
        />
      )}

      <aside
        className={cn(
          panelVariants({ size }),
          stacked && !isTop && 'max-xl:hidden lg:pe-2',
          className
        )}
      >
        <div className='bg-card shadow-sheet flex h-full flex-col overflow-hidden rounded-none sm:rounded-2xl lg:shadow-none'>
          <div className='shrink-0 px-5 pt-4 pb-3'>
            <div className='flex items-center gap-2'>
              {leading}
              <div className='min-w-0 flex-1'>
                <h2 className='text-body truncate font-semibold tracking-[-0.01em]'>
                  {title}
                </h2>
                {subtitle && (
                  <p className='text-muted-foreground text-footnote truncate'>
                    {subtitle}
                  </p>
                )}
              </div>
              {actions}
              {(!stacked || isFirst) && <CloseButton onClick={onClose} />}
            </div>
          </div>
          <div
            aria-hidden
            className={cn(
              'mx-5 shrink-0 border-b transition-colors duration-200',
              body.top ? 'border-border' : 'border-transparent'
            )}
          />

          <div
            ref={bodyRef}
            className='min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-5'
          >
            {children}
          </div>

          {footer && (
            <>
              <div
                aria-hidden
                className={cn(
                  'mx-5 shrink-0 border-b transition-colors duration-200',
                  body.bottom ? 'border-border' : 'border-transparent'
                )}
              />
              <div className='shrink-0 px-5 pt-3 pb-4'>{footer}</div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
