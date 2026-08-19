import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon, MinusIcon } from 'lucide-react'

import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer bg-muted size-[18px] shrink-0 rounded-[6px] border transition-colors outline-none',
        'focus-visible:ring-ring/40 focus-visible:ring-[3px]',
        'data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-white',
        'data-[state=indeterminate]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:text-white',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/25',
        'disabled:pointer-events-none disabled:opacity-40',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current'
      >
        {props.checked === 'indeterminate' ? (
          <MinusIcon className='size-3.5' strokeWidth={3} />
        ) : (
          <CheckIcon className='size-3.5' strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
