import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { Command as CommandPrimitive } from 'cmdk'
import { Check, ChevronDownIcon, ChevronUpIcon, Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from '@shared/ui/components/command'
import { JoinedSeatBoundary } from '@shared/ui/components/joined-group'
import { Media, MediaPair } from '@shared/ui/components/media'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@shared/ui/components/popover'
import { useDebounce } from '@shared/ui/hooks/use-debounce'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { useMediaQuery } from '@shared/ui/hooks/use-media-query'
import { fieldVariants } from '@shared/ui/lib/field-variants'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const SEARCH_DELAY = 400

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const END_SLACK = 64

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type ComboboxOption = {
  value: string
  label: string
  description?: string
  meta?: string
  descriptionMeta?: string
  selectedLabel?: string
  image?: string | null
  secondary?: { image?: string | null; name?: string | null }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ComboboxProps = VariantProps<typeof fieldVariants> & {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  onSearch?: (search: string) => void
  searchDelay?: number
  loading?: boolean
  onEndReached?: () => void
  imageKind?: React.ComponentProps<typeof Media>['kind']
  imageIcon?: React.ComponentProps<typeof Media>['icon']
  secondaryImageKind?: React.ComponentProps<typeof Media>['kind']
  secondaryImageIcon?: React.ComponentProps<typeof Media>['icon']
  inputRef?: React.Ref<HTMLInputElement>
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Combobox({
  options,
  value,
  onValueChange,
  placeholder,
  emptyText,
  disabled,
  className,
  variant,
  inputSize,
  onSearch,
  searchDelay = SEARCH_DELAY,
  loading,
  onEndReached,
  imageKind,
  imageIcon,
  secondaryImageKind,
  secondaryImageIcon,
  inputRef,
}: ComboboxProps) {
  const anchor = React.useRef<HTMLDivElement>(null)
  const list = React.useRef<HTMLDivElement | null>(null)
  const [edges, setEdges] = React.useState({ top: false, bottom: false })
  const [highlight, setHighlight] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [typing, setTyping] = React.useState(false)
  const [picked, setPicked] = React.useState<ComboboxOption | null>(null)
  const coarse = useMediaQuery('(pointer: coarse)')
  const [keyboard, setKeyboard] = React.useState(false)
  const settled = useDebounce(search, searchDelay)
  const seat = useJoinedSeat()
  const remote = Boolean(onSearch)
  const { t } = useTranslation('common')

  React.useEffect(() => {
    if (onSearch) onSearch(settled)
  }, [settled]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected =
    picked?.value === value
      ? picked
      : options.find((option) => option.value === value)

  const itemValue = (option: ComboboxOption) => option.value

  const values = options.map(itemValue)
  const active = values.includes(highlight) ? highlight : (values[0] ?? '')

  const shown = typing
    ? search
    : (selected?.selectedLabel ?? selected?.label ?? '')

  function choose(option: ComboboxOption) {
    setPicked(option)
    onValueChange(option.value)
    setTyping(false)
    setSearch('')
    setOpen(false)
  }

  function clear() {
    setPicked(null)
    setTyping(false)
    setSearch('')
    onValueChange('')
  }

  const measure = React.useCallback(() => {
    const node = list.current
    if (!node) return
    const top = node.scrollTop > 1
    const bottom = node.scrollHeight - node.scrollTop - node.clientHeight > 1
    setEdges((prev) =>
      prev.top === top && prev.bottom === bottom ? prev : { top, bottom }
    )
  }, [])

  const attach = React.useCallback(
    (node: HTMLDivElement | null) => {
      list.current = node
      if (!node) return
      measure()
      const observer = new MutationObserver(measure)
      observer.observe(node, { childList: true, subtree: true })
      return () => observer.disconnect()
    },
    [measure]
  )

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    measure()
    if (!onEndReached || loading) return
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    if (scrollHeight - scrollTop - clientHeight <= END_SLACK) onEndReached()
  }

  return (
    <Command
      shouldFilter={!remote}
      value={active}
      onValueChange={setHighlight}
      className={cn('overflow-visible', className)}
    >
      <Popover
        open={open && !disabled}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            setTyping(false)
            setSearch('')
            setKeyboard(false)
          }
        }}
      >
        <PopoverAnchor asChild>
          <div ref={anchor} className='relative'>
            {imageKind && (
              <span className='pointer-events-none absolute start-4 top-1/2 -translate-y-1/2'>
                <OptionMedia
                  option={selected}
                  kind={imageKind}
                  icon={imageIcon}
                  secondaryKind={secondaryImageKind}
                  secondaryIcon={secondaryImageIcon}
                  surface='card'
                />
              </span>
            )}
            <CommandPrimitive.Input
              ref={inputRef}
              value={shown}
              onValueChange={(next) => {
                setTyping(true)
                setSearch(next)
                setOpen(true)
                setHighlight('')
                list.current?.scrollTo({ top: 0 })
                if (!next && value) onValueChange('')
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                setTyping(false)
                setKeyboard(false)
              }}
              inputMode={coarse && !keyboard ? 'none' : undefined}
              onPointerDown={(event) => {
                if (!coarse || keyboard || disabled) return
                if (document.activeElement === event.currentTarget) {
                  event.currentTarget.setAttribute('inputmode', 'text')
                  setKeyboard(true)
                }
              }}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  remote &&
                  (search !== settled || Boolean(loading))
                ) {
                  event.preventDefault()
                  event.stopPropagation()
                }
              }}
              disabled={disabled}
              placeholder={placeholder}
              className={cn(
                fieldVariants({ variant, inputSize }),
                seat,
                imageKind && (secondaryImageKind ? 'ps-14' : 'ps-12'),
                'pe-10'
              )}
            />
            {loading ? (
              <Loader2 className='text-muted-foreground pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 animate-spin' />
            ) : value && !disabled ? (
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                shape='circle'
                aria-label={t('actions.clear')}
                className='text-muted-foreground hover:text-foreground absolute end-1.5 top-1/2 size-7 -translate-y-1/2'
                onClick={clear}
              >
                <X className='size-3.5' />
              </Button>
            ) : (
              <ChevronDownIcon
                className={cn(
                  'text-muted-foreground pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 transition-transform',
                  open && 'rotate-180',
                  disabled && 'opacity-40'
                )}
              />
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          align='start'
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => {
            if (anchor.current?.contains(event.target as Node)) {
              event.preventDefault()
            }
          }}
          onFocusOutside={(event) => {
            if (anchor.current?.contains(event.target as Node)) {
              event.preventDefault()
            }
          }}
          className='w-[min(calc(100vw-2rem),max(var(--radix-popover-trigger-width),24rem))] overflow-hidden p-0'
        >
          <JoinedSeatBoundary>
            <div className='relative'>
              {edges.top && (
                <div className='from-popover pointer-events-none absolute inset-x-0 top-0 z-10 flex h-7 items-start justify-center bg-gradient-to-b to-transparent pt-1'>
                  <ChevronUpIcon className='text-muted-foreground size-4' />
                </div>
              )}
              <CommandList ref={attach} onScroll={handleScroll}>
                {!loading && <CommandEmpty>{emptyText}</CommandEmpty>}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={itemValue(option)}
                    keywords={[
                      option.label,
                      option.selectedLabel ?? '',
                      option.description ?? '',
                      option.meta ?? '',
                      option.descriptionMeta ?? '',
                    ]}
                    onSelect={() => choose(option)}
                  >
                    {imageKind && (
                      <OptionMedia
                        option={option}
                        kind={imageKind}
                        icon={imageIcon}
                        secondaryKind={secondaryImageKind}
                        secondaryIcon={secondaryImageIcon}
                        surface='popover'
                      />
                    )}
                    <span className='min-w-0 flex-1'>
                      <span className='flex items-baseline gap-2'>
                        <span className='min-w-0 flex-1 truncate'>
                          {option.label}
                        </span>
                        {option.meta && (
                          <span className='text-muted-foreground text-footnote max-w-[40%] shrink-0 truncate tabular-nums'>
                            {option.meta}
                          </span>
                        )}
                      </span>
                      {(option.description || option.descriptionMeta) && (
                        <span className='text-muted-foreground text-footnote flex items-baseline gap-2'>
                          <span className='min-w-0 flex-1 truncate'>
                            {option.description}
                          </span>
                          {option.descriptionMeta && (
                            <span className='max-w-[45%] shrink-0 truncate'>
                              {option.descriptionMeta}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                    {option.value === value && (
                      <Check className='text-brand size-4 shrink-0' />
                    )}
                  </CommandItem>
                ))}
                {loading && (
                  <div className='flex justify-center py-3'>
                    <Loader2 className='text-muted-foreground size-4 animate-spin' />
                  </div>
                )}
              </CommandList>
              {edges.bottom && (
                <div className='from-popover pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-7 items-end justify-center bg-gradient-to-t to-transparent pb-1'>
                  <ChevronDownIcon className='text-muted-foreground size-4' />
                </div>
              )}
            </div>
          </JoinedSeatBoundary>
        </PopoverContent>
      </Popover>
    </Command>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function OptionMedia({
  option,
  kind,
  icon,
  secondaryKind,
  secondaryIcon,
  surface,
}: {
  option?: ComboboxOption
  kind: React.ComponentProps<typeof Media>['kind']
  icon: React.ComponentProps<typeof Media>['icon']
  secondaryKind?: React.ComponentProps<typeof Media>['kind']
  secondaryIcon?: React.ComponentProps<typeof Media>['icon']
  surface: 'card' | 'popover'
}) {
  const primary = {
    kind,
    icon,
    fit: 'contain' as const,
    src: option?.image,
    name: option?.label,
    seed: option?.value,
  }

  if (!secondaryKind) return <Media {...primary} size='sm' />

  return (
    <MediaPair
      size='sm'
      surface={surface}
      primary={primary}
      secondary={{
        kind: secondaryKind,
        icon: secondaryIcon,
        fit: 'contain',
        src: option?.secondary?.image,
        name: option?.secondary?.name,
        seed: option?.secondary?.name,
      }}
    />
  )
}
