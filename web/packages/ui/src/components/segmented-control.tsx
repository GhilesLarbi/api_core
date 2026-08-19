import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const trackVariants = cva('bg-muted inline-flex items-center', {
  variants: {
    size: {
      sm: 'h-8 gap-0.5 rounded-lg p-0.5',
      default: 'h-9 gap-0.5 rounded-lg p-0.5',
      lg: 'h-11 gap-0.5 rounded-full p-1 sm:h-14 sm:gap-1 sm:p-1.5',
    },
    block: { true: 'flex w-full', false: '' },
  },
  defaultVariants: { size: 'default', block: false },
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const segmentVariants = cva(
  [
    'press flex h-full items-center justify-center font-medium whitespace-nowrap',
    'transition-[background-color,color,box-shadow]',
    'outline-none focus-visible:ring-ring/40 focus-visible:ring-[3px]',
    'disabled:pointer-events-none disabled:opacity-40',
  ],
  {
    variants: {
      size: {
        sm: 'rounded-md px-2.5 text-caption',
        default: 'rounded-md px-3 text-footnote',
        lg: 'rounded-full px-2.5 text-footnote sm:px-6 sm:text-body',
      },
      selected: {
        true: '',
        false: 'text-muted-foreground hover:text-foreground',
      },
      tone: { raised: '', brand: '' },
      block: { true: 'flex-1', false: '' },
    },
    compoundVariants: [
      {
        tone: 'raised',
        selected: true,
        className: 'bg-card text-foreground shadow-xs',
      },
      {
        tone: 'brand',
        selected: true,
        className: 'bg-brand text-white shadow-xs',
      },
    ],
    defaultVariants: {
      size: 'default',
      selected: false,
      tone: 'raised',
      block: false,
    },
  }
)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type Option<T extends string> = {
  value: T
  label: React.ReactNode
  disabled?: boolean
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type SegmentedControlProps<T extends string> = VariantProps<
  typeof trackVariants
> &
  Pick<VariantProps<typeof segmentVariants>, 'tone'> & {
    value: T
    onValueChange: (value: T) => void
    options: Option<T>[]
    label?: string
    className?: string
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size,
  tone,
  block,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role='radiogroup'
      aria-label={label}
      className={cn(trackVariants({ size, block }), className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={selected}
            disabled={option.disabled}
            onClick={() => onValueChange(option.value)}
            className={segmentVariants({ size, selected, tone, block })}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
