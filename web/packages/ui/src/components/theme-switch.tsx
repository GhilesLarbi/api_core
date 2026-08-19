import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { useTheme } from '@shared/ui/context/theme-provider'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation('common')

  useEffect(() => {
    const themeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim()
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor && themeColor)
      metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  function toggle() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      className='scale-95 rounded-lg transition-none'
      onClick={toggle}
    >
      <Sun className='size-[1.2rem] scale-100 rotate-0 transition-none dark:scale-0 dark:-rotate-90' />
      <Moon className='absolute size-[1.2rem] scale-0 rotate-90 transition-none dark:scale-100 dark:rotate-0' />
      <span className='sr-only'>{t('theme.toggle')}</span>
    </Button>
  )
}
