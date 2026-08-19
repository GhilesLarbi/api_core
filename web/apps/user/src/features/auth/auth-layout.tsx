import { Link, type LinkProps } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { PublicLayout } from '@/components/layout/public-layout'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AuthLayoutProps = {
  children: React.ReactNode
  backTo?: LinkProps['to']
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AuthLayout({ children, backTo }: AuthLayoutProps) {
  return (
    <PublicLayout>
      <Navbar />
      <main className='relative flex min-h-[calc(100svh-4rem)] flex-col justify-center py-10 sm:py-16'>
        {backTo && (
          <Link
            to={backTo}
            className='bg-muted hover:bg-accent absolute start-4 top-6 flex size-11 items-center justify-center rounded-full transition-colors sm:start-6 lg:start-8'
          >
            <ChevronLeft className='size-5 rtl:rotate-180' />
          </Link>
        )}
        <Container className='flex justify-center'>
          <div className='w-full max-w-md'>{children}</div>
        </Container>
      </main>
      <Footer />
    </PublicLayout>
  )
}
