import { Main } from '@shared/ui/components/layout/main'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ResourcePageProps = {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  panel?: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ResourcePage({
  title,
  action,
  children,
  panel,
}: ResourcePageProps) {
  return (
    <Main fixed fluid className='p-0 md:pt-0'>
      <div className='flex min-h-0 flex-1 overflow-hidden'>
        <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden px-4 pt-6 pb-6 sm:gap-6 md:pt-16'>
          <div className='flex shrink-0 items-center justify-between gap-4'>
            <h1 className='truncate text-2xl font-bold tracking-tight'>
              {title}
            </h1>
            {action}
          </div>
          {children}
        </div>
        {panel}
      </div>
    </Main>
  )
}
