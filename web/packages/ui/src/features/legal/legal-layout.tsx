import { useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@shared/ui/components/button'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type LegalLayoutProps = {
  children: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LegalLayout({ children }: LegalLayoutProps) {
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const navigate = useNavigate()

  return (
    <div className='mx-auto w-full max-w-3xl flex-1 px-4 pb-10 sm:px-6 sm:py-14'>
      <Button
        variant='ghost'
        size='icon-lg'
        shape='circle'
        onClick={() =>
          canGoBack ? router.history.back() : navigate({ to: '/' })
        }
        className='text-muted-foreground -ms-3 mb-6'
      >
        <ChevronLeft className='size-5 rtl:rotate-180' />
      </Button>
      {children}
    </div>
  )
}
