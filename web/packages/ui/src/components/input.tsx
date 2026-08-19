import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { fieldVariants } from '@shared/ui/lib/field-variants'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Input({
  className,
  type,
  variant,
  inputSize,
  ...props
}: React.ComponentProps<'input'> & VariantProps<typeof fieldVariants>) {
  const seat = useJoinedSeat()

  return (
    <input
      type={type}
      data-slot='input'
      autoCorrect='off'
      className={cn(
        fieldVariants({ variant, inputSize }),
        seat,
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'selection:bg-brand selection:text-white',
        className
      )}
      {...props}
    />
  )
}

export { Input }
