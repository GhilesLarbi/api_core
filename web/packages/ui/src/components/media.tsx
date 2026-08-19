import { cva, type VariantProps } from 'class-variance-authority'
import { FileText, ImageIcon } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@shared/ui/components/avatar'
import { JoinedGroup } from '@shared/ui/components/joined-group'
import { avatarTint } from '@shared/ui/lib/avatar-color'
import { cn, isPdfUrl } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const mediaVariants = cva('relative shrink-0 overflow-hidden', {
  variants: {
    kind: {
      person: 'rounded-full',
      brand: 'rounded-full',
      document: 'rounded-lg',
    },
    size: {
      xs: 'size-5 text-[0.625rem]',
      sm: 'size-6 text-[0.625rem]',
      default: 'size-8 text-caption',
      md: 'size-9 text-caption',
      lg: 'size-11 text-footnote',
      xl: 'size-16 text-subhead',
      '2xl': 'size-24 text-body',
      full: 'aspect-square w-full text-body',
    },
  },
  defaultVariants: { kind: 'person', size: 'default' },
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type MediaProps = VariantProps<typeof mediaVariants> & {
  src?: string | null
  name?: string | null
  seed?: string | null
  caption?: React.ReactNode
  fit?: 'cover' | 'contain'
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function initials(name?: string | null): string {
  if (!name) return ''
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Media({
  kind,
  size,
  src,
  name,
  seed,
  caption,
  fit = 'cover',
  icon: Icon,
  className,
}: MediaProps) {
  const shape = kind ?? 'person'
  const tinted = shape === 'person' || shape === 'brand'
  const pdf = shape === 'document' && isPdfUrl(src)

  return (
    <Avatar
      size='none'
      className={cn(mediaVariants({ kind, size }), className)}
    >
      {src && !pdf && (
        <AvatarImage
          src={src}
          alt=''
          className={fit === 'contain' ? 'object-contain' : 'object-cover'}
        />
      )}
      <AvatarFallback
        className={cn(
          'size-full',
          tinted ? 'avatar-tint' : 'bg-accent text-muted-foreground'
        )}
        style={tinted ? avatarTint(seed || name || '') : undefined}
      >
        {Icon ? (
          <Icon className='size-[45%]' strokeWidth={1.5} />
        ) : tinted ? (
          initials(name)
        ) : pdf || src ? (
          <FileText className='size-[45%]' strokeWidth={1.5} />
        ) : (
          <ImageIcon className='size-[45%]' strokeWidth={1.5} />
        )}
      </AvatarFallback>

      {!tinted && (
        <span className='pointer-events-none absolute inset-0 shadow-[inset_0_0_32px_-8px_rgb(0_0_0/0.1)]' />
      )}

      {caption != null && (
        <span
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 block truncate text-start',
            'px-[0.55em] pt-[1.7em] pb-[0.4em] text-[0.85em] leading-none font-semibold text-white',
            'bg-gradient-to-t from-black/45 via-black/15 to-transparent',
            'dark:from-black/70 dark:via-black/35 dark:pt-[2.1em]'
          )}
        >
          {caption}
        </span>
      )}
    </Avatar>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type MediaPairProps = {
  primary: Omit<MediaProps, 'size' | 'className'>
  secondary: Omit<MediaProps, 'size' | 'className'>
  size?: 'default' | 'sm'
  surface?: 'card' | 'popover'
  className?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function MediaPair({
  primary,
  secondary,
  size = 'default',
  surface = 'card',
  className,
}: MediaPairProps) {
  const small = size === 'sm'

  return (
    <div className={cn('relative shrink-0', className)}>
      <Media
        {...primary}
        size={small ? 'default' : 'lg'}
        className={cn(
          '[mask-image:radial-gradient(circle_var(--notch-r)_at_var(--notch-x)_var(--notch-y),transparent_99%,#000_100%)] [--notch-r:13px]',
          small
            ? '[--notch-x:26px] [--notch-y:26px] rtl:[--notch-x:6px]'
            : '[--notch-x:38px] [--notch-y:38px] rtl:[--notch-x:6px]'
        )}
      />
      <Media
        {...secondary}
        size='xs'
        className={cn(
          'absolute -end-1 -bottom-1 p-0.5',
          surface === 'popover' ? 'bg-popover' : 'bg-card'
        )}
      />
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function MediaGroup({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <JoinedGroup
      direction='row'
      radius='md'
      className={cn('items-center [&>*]:rounded-none', className)}
    >
      {children}
    </JoinedGroup>
  )
}
