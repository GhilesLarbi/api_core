import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean | 'md'
  fluid?: boolean
  ref?: React.Ref<HTMLElement>
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Main({ fixed, className, fluid, ...props }: MainProps) {
  return (
    <main
      data-layout={
        fixed === true ? 'fixed' : fixed === 'md' ? 'fixed-md' : 'auto'
      }
      className={cn(
        'px-4 pt-6 pb-6 md:pt-16',

        fixed === true && 'flex min-h-0 grow flex-col overflow-hidden',
        fixed === 'md' && 'flex grow flex-col md:min-h-0 md:overflow-hidden',

        !fluid &&
          '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
        className
      )}
      {...props}
    />
  )
}
