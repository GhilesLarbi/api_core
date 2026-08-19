import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'

import { JoinedSeatBoundary } from '@shared/ui/components/joined-group'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { buttonVariants } from '@shared/ui/lib/button-variants'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Button({
  className,
  variant,
  size,
  block,
  shape,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  const seat = useJoinedSeat()

  return (
    <Comp
      data-slot='button'
      className={cn(
        buttonVariants({ variant, size, block, shape }),
        seat,
        className
      )}
      {...props}
    >
      {asChild ? children : <JoinedSeatBoundary>{children}</JoinedSeatBoundary>}
    </Comp>
  )
}

export { Button }
