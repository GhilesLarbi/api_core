import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@shared/ui/components/button'
import { JoinedSeatBoundary } from '@shared/ui/components/joined-group'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { fieldVariants } from '@shared/ui/lib/field-variants'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> &
  VariantProps<typeof fieldVariants> & {
    ref?: React.Ref<HTMLInputElement>
    wrapperClassName?: string
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PasswordInput({
  className,
  wrapperClassName,
  disabled,
  ref,
  variant,
  inputSize,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const seat = useJoinedSeat()

  return (
    <div className={cn('relative', wrapperClassName)}>
      <input
        type={showPassword ? 'text' : 'password'}
        data-slot='input'
        className={cn(
          fieldVariants({ variant, inputSize }),
          'pe-10',
          seat,
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      <JoinedSeatBoundary>
        <Button
          type='button'
          size='icon-sm'
          variant='ghost'
          disabled={disabled}
          className='text-muted-foreground absolute end-1 top-1/2 -translate-y-1/2'
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <Eye className='size-4' />
          ) : (
            <EyeOff className='size-4' />
          )}
        </Button>
      </JoinedSeatBoundary>
    </div>
  )
}
