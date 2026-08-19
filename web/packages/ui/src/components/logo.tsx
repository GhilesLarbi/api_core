import { type ImgHTMLAttributes } from 'react'

import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Logo({
  className,
  alt = 'SaaS Template',
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src='/images/logo.png'
      alt={alt}
      height={24}
      width={24}
      className={cn('size-6', className)}
      {...props}
    />
  )
}
