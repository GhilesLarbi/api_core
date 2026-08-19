import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  JoinedSeatContext,
  type JoinedSeat,
} from '@shared/ui/hooks/use-joined-seat'
import { cn } from '@shared/ui/lib/utils'

export type { JoinedSeat }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function JoinedSeatBoundary({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <JoinedSeatContext.Provider value={null}>
      {children}
    </JoinedSeatContext.Provider>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function seatFor(
  direction: 'column' | 'row' | 'grid',
  index: number,
  count: number,
  outer: JoinedSeat | null,
  columns: number
): JoinedSeat {
  let seat: JoinedSeat
  if (direction === 'column') {
    const first = index === 0
    const last = index === count - 1
    seat = { ss: first, se: first, es: last, ee: last }
  } else if (direction === 'row') {
    const first = index === 0
    const last = index === count - 1
    seat = { ss: first, se: last, es: first, ee: last }
  } else {
    const column = index % columns
    const beside = column > 0
    const after = column < columns - 1 && index + 1 < count
    const above = index - columns >= 0
    const below = index + columns < count
    seat = {
      ss: !beside && !above,
      se: !after && !above,
      es: !beside && !below,
      ee: !after && !below,
    }
  }
  if (!outer) return seat
  return {
    ss: seat.ss && outer.ss,
    se: seat.se && outer.se,
    es: seat.es && outer.es,
    ee: seat.ee && outer.ee,
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const joinedVariants = cva('overflow-hidden', {
  variants: {
    gap: { hairline: 'gap-[2px]', none: '' },
    direction: {
      column: 'flex flex-col',
      row: 'flex',
      grid: 'grid',
    },
    radius: {
      md: 'rounded-md [--joined-radius:var(--radius-md)]',
      lg: 'rounded-lg [--joined-radius:var(--radius-lg)]',
      xl: 'rounded-xl [--joined-radius:var(--radius-xl)]',
      '2xl': 'rounded-2xl [--joined-radius:var(--radius-2xl)]',
      full: 'rounded-full [--joined-radius:9999px]',
      none: '',
    },
  },
  defaultVariants: { gap: 'hairline', direction: 'column', radius: '2xl' },
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function JoinedGroup({
  className,
  gap,
  direction = 'column',
  radius,
  columns = 2,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof joinedVariants> & {
    columns?: number
  }) {
  const outer = React.useContext(JoinedSeatContext)
  const items = React.Children.toArray(children)

  return (
    <div
      data-slot='joined-group'
      className={cn(joinedVariants({ gap, direction, radius }), className)}
      style={
        direction === 'grid'
          ? {
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              ...style,
            }
          : style
      }
      {...props}
    >
      {items.map((child, index) => (
        <JoinedSeatContext.Provider
          key={index}
          value={seatFor(
            direction ?? 'column',
            index,
            items.length,
            outer,
            columns
          )}
        >
          {child}
        </JoinedSeatContext.Provider>
      ))}
    </div>
  )
}
