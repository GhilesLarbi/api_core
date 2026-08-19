import { cva } from 'class-variance-authority'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export const buttonVariants = cva(
  [
    'press inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap',
    'outline-none focus-visible:ring-ring/40 focus-visible:ring-[3px]',
    'disabled:pointer-events-none disabled:opacity-40',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    'aria-invalid:ring-destructive/30',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        brand: 'bg-brand text-white hover:bg-brand/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        tinted: 'bg-brand/12 text-brand hover:bg-brand/20',
        secondary: 'bg-secondary text-foreground hover:bg-accent',
        outline: 'bg-card border text-foreground hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent',
        photo:
          'bg-black/45 text-white backdrop-blur-sm hover:bg-black/65 dark:bg-black/55 dark:hover:bg-black/70',
        plain: 'text-brand hover:opacity-70',
        quiet: 'text-muted-foreground hover:text-foreground',
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 gap-1 px-2 text-xs',
        sm: 'h-8 gap-1.5 px-3 text-footnote',
        default: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-subhead',
        xl: 'h-14 rounded-2xl px-6 text-base font-semibold',
        icon: 'size-9',
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-11 rounded-xl',
      },
      block: { true: 'w-full', false: '' },
      shape: { default: '', circle: 'rounded-full', square: 'rounded-none' },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      block: false,
      shape: 'default',
    },
  }
)
