import { Check } from 'lucide-react'

import { Button } from '@shared/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/components/dropdown-menu'
import { useLanguage } from '@shared/ui/context/language-provider'
import { LANGUAGE_LABELS } from '@shared/ui/lib/languages'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function LanguageSwitch() {
  const { language, setLanguage, supported } = useLanguage()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className='sm:hidden'>
          <Button
            variant='outline'
            size='sm'
            className='h-9 rounded-lg px-3 text-xs font-medium'
          >
            {LANGUAGE_LABELS[language]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {supported.map((lng) => (
            <DropdownMenuItem key={lng} onClick={() => setLanguage(lng)}>
              {LANGUAGE_LABELS[lng]}
              <Check
                className={cn('ms-auto', lng !== language && 'hidden')}
                size={14}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className='bg-card hidden items-center rounded-lg border p-1 sm:inline-flex'>
        {supported.map((lng) => (
          <Button
            key={lng}
            variant='ghost'
            size='sm'
            onClick={() => setLanguage(lng)}
            className={cn(
              'h-7 rounded-sm px-3 text-xs font-medium',
              lng === language
                ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:bg-accent/50 dark:hover:text-foreground'
            )}
          >
            {LANGUAGE_LABELS[lng]}
          </Button>
        ))}
      </div>
    </>
  )
}
