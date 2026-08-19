import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronRight } from 'lucide-react'

import { JoinedSeatBoundary } from '@shared/ui/components/joined-group'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const rowVariants = cva(
  [
    'flex w-full items-center gap-3 text-start transition-colors',
    'outline-none focus-visible:ring-ring/40 focus-visible:ring-[3px] focus-visible:ring-inset',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      tone: {
        default: 'bg-muted',
        plain: '',
        destructive: 'text-destructive',
      },
      joined: { true: 'rounded-none', false: 'rounded-lg' },
      size: { default: 'px-4 py-3', lg: 'px-4 py-3.5' },
      interactive: { true: '', false: '' },
      hover: { true: '', false: '' },
    },
    compoundVariants: [
      {
        interactive: true,
        hover: true,
        tone: 'default',
        class: 'hover:bg-accent',
      },
      {
        interactive: true,
        hover: true,
        tone: 'plain',
        class: 'hover:bg-accent',
      },
      {
        interactive: true,
        hover: true,
        tone: 'destructive',
        class: 'hover:bg-destructive/10',
      },
    ],
    defaultVariants: {
      tone: 'default',
      joined: false,
      size: 'default',
      interactive: true,
      hover: true,
    },
  }
)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ListRowProps = Omit<React.ComponentProps<'button'>, 'value'> &
  VariantProps<typeof rowVariants> & {
    leading?: React.ReactNode
    label: React.ReactNode
    description?: React.ReactNode
    trailing?: React.ReactNode
    chevron?: boolean
    interactive?: boolean
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ListRow({
  leading,
  label,
  description,
  trailing,
  chevron,
  tone,
  joined,
  size,
  interactive = true,
  hover,
  className,
  ...props
}: ListRowProps) {
  const seat = useJoinedSeat()
  const classes = cn(
    rowVariants({ tone, joined, size, interactive, hover }),
    seat,
    className
  )
  const content = (
    <JoinedSeatBoundary>
      {leading}
      <span className='min-w-0 flex-1'>
        <span className='block truncate text-sm'>{label}</span>
        {description && (
          <span className='text-muted-foreground text-footnote block truncate'>
            {description}
          </span>
        )}
      </span>
      {trailing && (
        <span className='text-muted-foreground text-footnote shrink-0'>
          {trailing}
        </span>
      )}
      {chevron && (
        <ChevronRight className='text-muted-foreground/60 size-4 shrink-0 rtl:rotate-180' />
      )}
    </JoinedSeatBoundary>
  )

  if (!interactive) {
    return (
      <div
        data-slot='list-row'
        className={classes}
        {...(props as React.ComponentProps<'div'>)}
      >
        {content}
      </div>
    )
  }

  return (
    <button type='button' data-slot='list-row' className={classes} {...props}>
      {content}
    </button>
  )
}
