import { LanguageSwitch } from '@shared/ui/components/language-switch'
import { Header } from '@shared/ui/components/layout/header'
import { ThemeSwitch } from '@shared/ui/components/theme-switch'
import { useHeightVar } from '@shared/ui/hooks/use-height-var'
import { BrandLink } from '@/components/layout/brand-link'
import { Container } from '@/components/layout/container'
import { NavLinks } from '@/components/layout/nav-links'
import { UserMenu } from '@/components/layout/user-menu'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Navbar() {
  const bar = useHeightVar<HTMLDivElement>('--navbar-height')

  return (
    <div
      ref={bar}
      className='bg-background/85 z-nav sticky top-0 border-b backdrop-blur-lg'
    >
      <Header contentClassName='p-0'>
        <Container className='flex h-full min-w-0 items-center gap-2 sm:gap-4'>
          <BrandLink />
          <NavLinks className='ms-1 sm:ms-2' />
          <div className='ms-auto flex items-center gap-1 sm:gap-2'>
            <LanguageSwitch />
            <ThemeSwitch />
            <UserMenu />
          </div>
        </Container>
      </Header>
    </div>
  )
}
