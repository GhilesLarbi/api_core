import { cva } from 'class-variance-authority'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const fieldVariants = cva(
  [
    'flex w-full min-w-0 text-base transition-[background-color,box-shadow] outline-none md:text-sm',
    'placeholder:text-muted-foreground',
    'disabled:pointer-events-none disabled:opacity-40',
    'aria-invalid:ring-destructive/25 aria-invalid:ring-[3px]',
  ],
  {
    variants: {
      variant: {
        filled:
          'bg-muted rounded-lg focus-visible:ring-ring/40 focus-visible:ring-[3px]',
        outline:
          'bg-card hover:bg-accent rounded-lg border focus-visible:ring-ring/40 focus-visible:ring-[3px]',
        grouped:
          'bg-muted rounded-none focus-visible:ring-ring/40 focus-visible:ring-[3px] focus-visible:ring-inset',
        plain: 'bg-transparent rounded-none px-0',
      },
      inputSize: {
        sm: 'h-8 px-2.5',
        default: 'h-9 px-3',
        lg: 'h-11 px-3.5',
        row: 'h-12 px-4',
      },
    },
    defaultVariants: { variant: 'filled', inputSize: 'default' },
  }
)
