import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Languages, Laptop, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@shared/ui/components/command'
import { ScrollArea } from '@shared/ui/components/scroll-area'
import { useLanguage } from '@shared/ui/context/language-provider'
import { useSearch } from '@shared/ui/context/search-provider'
import { useTheme } from '@shared/ui/context/theme-provider'
import { type Language } from '@shared/ui/lib/languages'
import { type SidebarData } from '@shared/ui/lib/nav'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const LANGUAGE_KEYWORDS: Record<Language, string[]> = {
  en: ['english', 'anglais', 'الإنجليزية'],
  fr: ['french', 'francais', 'français', 'frensh', 'الفرنسية'],
  ar: ['arabic', 'arabe', 'عربي', 'العربية'],
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function CommandMenu({ navItems, footerNavItems }: SidebarData) {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { setLanguage, supported } = useLanguage()
  const { open, setOpen } = useSearch()
  const { t: tCommon, i18n } = useTranslation('common')
  const { t: tNav } = useTranslation('nav')

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  const inEveryLanguage = React.useCallback(
    (key: string, ns: string) =>
      supported.map((lng) => i18n.t(key, { lng, ns })),
    [i18n, supported]
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={tCommon('commandMenu.placeholder')} />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>{tCommon('status.noResults')}</CommandEmpty>
          <CommandGroup heading={tCommon('commandMenu.navigationHeading')}>
            {[...navItems, ...footerNavItems].map((navItem) => (
              <CommandItem
                key={navItem.url}
                value={tNav(navItem.title)}
                keywords={inEveryLanguage(navItem.title, 'nav')}
                onSelect={() => {
                  runCommand(() => navigate({ to: navItem.url }))
                }}
              >
                <div className='flex size-4 items-center justify-center'>
                  <ArrowRight className='text-muted-foreground/80 size-2' />
                </div>
                {tNav(navItem.title)}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={tCommon('commandMenu.themeHeading')}>
            <CommandItem
              value={tCommon('theme.light')}
              keywords={inEveryLanguage('theme.light', 'common')}
              onSelect={() => runCommand(() => setTheme('light'))}
            >
              <Sun /> <span>{tCommon('theme.light')}</span>
            </CommandItem>
            <CommandItem
              value={tCommon('theme.dark')}
              keywords={inEveryLanguage('theme.dark', 'common')}
              onSelect={() => runCommand(() => setTheme('dark'))}
            >
              <Moon className='scale-90' />
              <span>{tCommon('theme.dark')}</span>
            </CommandItem>
            <CommandItem
              value={tCommon('theme.system')}
              keywords={inEveryLanguage('theme.system', 'common')}
              onSelect={() => runCommand(() => setTheme('system'))}
            >
              <Laptop />
              <span>{tCommon('theme.system')}</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={tCommon('commandMenu.languageHeading')}>
            {supported.map((lng) => (
              <CommandItem
                key={lng}
                value={LANGUAGE_NAMES[lng]}
                keywords={LANGUAGE_KEYWORDS[lng]}
                onSelect={() => runCommand(() => setLanguage(lng))}
              >
                <Languages />
                <span>{LANGUAGE_NAMES[lng]}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
