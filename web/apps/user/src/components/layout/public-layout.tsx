import { SkipToMain } from '@shared/ui/components/skip-to-main'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipToMain />
      <div
        id='content'
        className='@container/content flex min-h-svh min-w-0 flex-col'
      >
        {children}
      </div>
    </>
  )
}
