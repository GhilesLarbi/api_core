import { Main } from '@shared/ui/components/layout/main'

import { VitalsDashboard } from './components/vitals-dashboard'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Dashboard() {
  return (
    <Main fluid className='px-0 pb-0'>
      <div className='mx-auto w-full max-w-7xl px-4 pb-6'>
        <VitalsDashboard />
      </div>
    </Main>
  )
}
