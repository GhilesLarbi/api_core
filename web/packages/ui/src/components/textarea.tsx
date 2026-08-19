import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { fieldVariants } from '@shared/ui/lib/field-variants'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<'textarea'> &
  Omit<VariantProps<typeof fieldVariants>, 'inputSize'>) {
  const seat = useJoinedSeat()

  return (
    <textarea
      data-slot='textarea'
      className={cn(
        fieldVariants({ variant }),
        'field-sizing-content min-h-20 px-3 py-2.5',
        seat,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
