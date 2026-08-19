import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { JoinedGroup } from '@shared/ui/components/joined-group'
import { ListRow } from '@shared/ui/components/list-row'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select'
import { useFont } from '@shared/ui/context/font-provider'
import { useFontSize } from '@shared/ui/context/font-size-provider'
import { useTheme } from '@shared/ui/context/theme-provider'
import { fontSizes } from '@shared/ui/lib/font-sizes'
import { fonts } from '@shared/ui/lib/fonts'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const THEMES = ['light', 'dark'] as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AppearanceForm() {
  const { t } = useTranslation('settings')
  const { t: tCommon } = useTranslation('common')
  const { font, setFont } = useFont()
  const { fontSize, setFontSize } = useFontSize()
  const { theme, setTheme } = useTheme()

  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <h3 className='font-semibold'>{t('appearance.fontLabel')}</h3>
        <Select
          value={font}
          onValueChange={(value) => setFont(value as (typeof fonts)[number])}
        >
          <SelectTrigger
            variant='outline'
            inputSize='row'
            className='w-[200px] font-medium capitalize'
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((fontOption) => (
              <SelectItem
                key={fontOption}
                value={fontOption}
                className='capitalize'
              >
                {fontOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className='text-muted-foreground text-sm'>
          {t('appearance.fontDescription')}
        </p>
      </div>

      <div className='space-y-3'>
        <h3 className='font-semibold'>{tCommon('fontSize.label')}</h3>
        <JoinedGroup radius='lg'>
          {fontSizes.map((value) => (
            <ListRow
              key={value}
              joined
              onClick={() => setFontSize(value)}
              label={
                <span className={cn(fontSize === value && 'font-medium')}>
                  {tCommon(`fontSize.${value}`)}
                </span>
              }
              trailing={
                fontSize === value ? (
                  <Check className='text-brand size-4' />
                ) : undefined
              }
            />
          ))}
        </JoinedGroup>
        <p className='text-muted-foreground text-sm'>
          {tCommon('fontSize.description')}
        </p>
      </div>

      <div className='space-y-3'>
        <h3 className='font-semibold'>{t('appearance.themeLabel')}</h3>
        <JoinedGroup radius='lg'>
          {THEMES.map((value) => (
            <ListRow
              key={value}
              joined
              onClick={() => setTheme(value)}
              label={
                <span className={cn(theme === value && 'font-medium')}>
                  {tCommon(`theme.${value}`)}
                </span>
              }
              trailing={
                theme === value ? (
                  <Check className='text-brand size-4' />
                ) : undefined
              }
            />
          ))}
        </JoinedGroup>
      </div>
    </div>
  )
}
