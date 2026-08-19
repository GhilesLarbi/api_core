import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { Checkbox } from '@shared/ui/components/checkbox'
import {
  JoinedGroup,
  JoinedSeatBoundary,
} from '@shared/ui/components/joined-group'
import { ListRow } from '@shared/ui/components/list-row'
import { useJoinedSeat } from '@shared/ui/hooks/use-joined-seat'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const MARK_FADE = 2000

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const FADE_SLACK = 100

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type TreeSelectNode = {
  id: string
  label: string
  description?: string
  trailing?: React.ReactNode
  selectable?: boolean
  children?: TreeSelectNode[]
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function selectableIds(node: TreeSelectNode): string[] {
  const own = node.selectable === false ? [] : [node.id]
  return own.concat((node.children ?? []).flatMap(selectableIds))
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type TreeSelectRowProps = {
  node: TreeSelectNode
  checked: boolean | 'indeterminate'
  disabled: boolean
  marked?: boolean
  fading?: boolean
  onToggle: () => void
  onDrill: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function TreeSelectRow({
  node,
  checked,
  disabled,
  marked,
  fading,
  onToggle,
  onDrill,
}: TreeSelectRowProps) {
  const seat = useJoinedSeat()
  const hasChildren = (node.children?.length ?? 0) > 0

  return (
    <div
      className={cn(
        'bg-muted hover:bg-accent flex items-center gap-3 ps-4 transition-colors',
        marked && !fading && 'bg-brand/12',
        fading && 'duration-[2000ms]',
        seat ?? 'rounded-lg'
      )}
    >
      <Checkbox
        id={node.id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
      />
      <JoinedSeatBoundary>
        <ListRow
          tone='plain'
          hover={false}
          className='min-w-0 flex-1 ps-0'
          label={node.label}
          description={node.description}
          trailing={node.trailing}
          chevron={hasChildren}
          disabled={disabled}
          onClick={hasChildren ? onDrill : onToggle}
        />
      </JoinedSeatBoundary>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Crumb({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      variant='quiet'
      size='xs'
      className={cn('min-w-0 px-1.5', className)}
      onClick={onClick}
    >
      <span className='truncate'>{label}</span>
    </Button>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function CrumbSeparator() {
  return (
    <ChevronRight className='text-muted-foreground/60 size-3 shrink-0 rtl:rotate-180' />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type TreeSelectProps = {
  nodes: TreeSelectNode[]
  value: string[]
  onValueChange: (next: string[]) => void
  rootLabel: string
  disabled?: boolean
  emptyText?: string
  className?: string
  listClassName?: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function TreeSelect({
  nodes,
  value,
  onValueChange,
  rootLabel,
  disabled = false,
  emptyText,
  className,
  listClassName,
}: TreeSelectProps) {
  const { t } = useTranslation('common')
  const [trail, setTrail] = useState<TreeSelectNode[]>([])
  const [returned, setReturned] = useState<string | null>(null)
  const [fading, setFading] = useState(false)

  const level =
    trail.length === 0 ? nodes : (trail[trail.length - 1].children ?? [])
  const selected = useMemo(() => new Set(value), [value])

  const scroller = useRef<HTMLDivElement>(null)
  const offsets = useRef(new Map<string, number>())
  const levelKey = trail.length === 0 ? 'root' : trail[trail.length - 1].id

  useLayoutEffect(() => {
    const node = scroller.current
    if (node) node.scrollTop = offsets.current.get(levelKey) ?? 0
  }, [levelKey])

  useLayoutEffect(() => {
    if (!returned) return
    const frame = requestAnimationFrame(() => setFading(true))
    const done = setTimeout(() => {
      setReturned(null)
      setFading(false)
    }, MARK_FADE + FADE_SLACK)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(done)
    }
  }, [returned])

  function walkTo(next: TreeSelectNode[]) {
    setFading(false)
    setReturned(next.length < trail.length ? trail[next.length].id : null)
    setTrail(next)
  }

  function handleToggle(node: TreeSelectNode) {
    const ids = selectableIds(node)
    const next = new Set(value)
    const fill = ids.some((id) => !next.has(id))
    for (const id of ids) {
      if (fill) next.add(id)
      else next.delete(id)
    }
    onValueChange([...next])
  }

  const empty = level.length === 0

  return (
    <div className={cn('space-y-2', className)}>
      {
        <div className='flex min-w-0 items-center gap-0.5'>
          <Button
            variant='quiet'
            size='icon-sm'
            shape='circle'
            className='shrink-0'
            aria-label={t('actions.back')}
            disabled={trail.length === 0}
            onClick={() => walkTo(trail.slice(0, -1))}
          >
            <ChevronLeft className='rtl:rotate-180' />
          </Button>
          {trail.length === 0 ? (
            <span className='text-footnote min-w-0 shrink truncate px-1.5 font-medium'>
              {rootLabel}
            </span>
          ) : (
            <Crumb
              label={rootLabel}
              className='max-w-24 shrink'
              onClick={() => walkTo([])}
            />
          )}
          {trail.length > 1 && (
            <>
              <CrumbSeparator />
              <Crumb
                label='…'
                className='shrink-0'
                onClick={() => walkTo(trail.slice(0, -1))}
              />
            </>
          )}
          {trail.length > 0 && (
            <>
              <CrumbSeparator />
              <span className='text-footnote min-w-0 shrink truncate px-1.5'>
                {trail[trail.length - 1].label}
              </span>
            </>
          )}
        </div>
      }

      {empty && emptyText && (
        <p className='text-muted-foreground text-footnote px-1 py-2'>
          {emptyText}
        </p>
      )}

      {!empty && (
        <div
          ref={scroller}
          onScroll={(event) =>
            offsets.current.set(levelKey, event.currentTarget.scrollTop)
          }
          className={cn('min-h-0 overflow-y-auto rounded-xl', listClassName)}
        >
          <JoinedGroup direction='column' radius='none'>
            {level.map((node) => {
              const ids = selectableIds(node)
              const held = ids.filter((id) => selected.has(id)).length
              return (
                <TreeSelectRow
                  key={node.id}
                  node={node}
                  checked={
                    held === 0
                      ? false
                      : held === ids.length
                        ? true
                        : 'indeterminate'
                  }
                  disabled={disabled}
                  marked={node.id === returned}
                  fading={fading}
                  onToggle={() => handleToggle(node)}
                  onDrill={() => walkTo([...trail, node])}
                />
              )
            })}
          </JoinedGroup>
        </div>
      )}
    </div>
  )
}
