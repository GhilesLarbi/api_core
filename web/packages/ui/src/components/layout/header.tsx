import { useEffect, useState } from 'react'

import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  contentClassName?: string
  ref?: React.Ref<HTMLElement>
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Header({
  className,
  fixed,
  contentClassName,
  children,
  ...props
}: HeaderProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!fixed) return

    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    document.addEventListener('scroll', onScroll, { passive: true })

    return () => document.removeEventListener('scroll', onScroll)
  }, [fixed])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'sticky top-0',
        offset > 10 && fixed ? 'border-b' : 'border-b-0',
        'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg',
          contentClassName
        )}
      >
        {children}
      </div>
    </header>
  )
}
