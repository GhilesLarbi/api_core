import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

import { HeroSection } from './sections/hero-section'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Home() {
  return (
    <>
      <Navbar />
      <main className='flex-1'>
        <HeroSection />
      </main>
      <Footer />
    </>
  )
}
