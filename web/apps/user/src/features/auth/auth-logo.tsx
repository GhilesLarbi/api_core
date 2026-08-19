import { Logo } from '@shared/ui/components/logo'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AuthLogo({ className }: { className?: string }) {
  return (
    <Logo
      className={cn(
        'size-24 sm:size-32',
        '[filter:drop-shadow(0_8px_10px_color-mix(in_srgb,var(--brand)_35%,transparent))_drop-shadow(0_20px_32px_color-mix(in_srgb,var(--brand)_45%,transparent))]',
        className
      )}
    />
  )
}
