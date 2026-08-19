import * as React from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@shared/ui/components/button'
import { CloseButton } from '@shared/ui/components/close-button'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ModalContextValue = {
  onOpenChange: (open: boolean) => void
  titleId: string
  descriptionId: string
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const ModalContext = React.createContext<ModalContextValue | null>(null)

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const ModalVariantContext = React.createContext<
  'sheet' | 'alert' | 'fullscreen'
>('sheet')

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function useModalContext() {
  const context = React.useContext(ModalContext)
  if (!context) {
    throw new Error('Modal parts must be used within a <Modal>')
  }
  return context
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function Modal({ open, onOpenChange, children }: ModalProps) {
  const titleId = React.useId()
  const descriptionId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <ModalContext.Provider value={{ onOpenChange, titleId, descriptionId }}>
      {children}
    </ModalContext.Provider>,
    document.body
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ModalContentProps = {
  variant?: 'sheet' | 'alert' | 'fullscreen'
  className?: string
  overlayClassName?: string
  showCloseButton?: boolean
  closeLabel?: string
  children: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ModalContent({
  variant = 'sheet',
  className,
  overlayClassName,
  showCloseButton = true,
  closeLabel = 'Close',
  children,
}: ModalContentProps) {
  const { onOpenChange, titleId, descriptionId } = useModalContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const content = contentRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null
    if (content && !content.contains(document.activeElement)) content.focus()
    return () => previouslyFocused?.focus?.({ preventScroll: true })
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      if (event.defaultPrevented) return
      event.stopPropagation()
      onOpenChange(false)
      return
    }
    if (event.key !== 'Tab' || !contentRef.current) return
    const focusable = Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((element) => element.offsetParent !== null)
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className={cn(
        'animate-in fade-in fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/40 duration-150',
        variant === 'fullscreen' ? 'p-0' : 'sm:py-8',
        variant === 'sheet' && 'py-0',
        variant === 'alert' && 'py-4',
        overlayClassName
      )}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div
        ref={contentRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'animate-in fade-in zoom-in-95 bg-card shadow-sheet relative z-[70] flex max-h-full w-full flex-col overflow-hidden duration-150 outline-none',
          variant === 'fullscreen' ? 'px-0' : 'px-6',
          variant === 'sheet' &&
            'h-full max-w-none rounded-none sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:max-w-md sm:rounded-2xl',
          variant === 'alert' &&
            'mx-4 max-h-[calc(100vh-2rem)] max-w-sm rounded-2xl',
          variant === 'fullscreen' && 'h-full max-w-none rounded-none',
          className
        )}
      >
        {showCloseButton && (
          <CloseButton
            onClick={() => onOpenChange(false)}
            label={closeLabel}
            className='absolute end-4 top-4 z-10'
          />
        )}
        <ModalVariantContext.Provider value={variant}>
          {children}
        </ModalVariantContext.Provider>
      </div>
    </div>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ModalHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const variant = React.useContext(ModalVariantContext)
  return (
    <div
      data-slot='modal-header'
      className={cn(
        'flex shrink-0 flex-col gap-1.5 pt-6 pb-4',
        variant === 'sheet'
          ? 'pe-10 text-start sm:pe-0 sm:text-center'
          : 'text-center',
        className
      )}
      {...props}
    />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ModalBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='modal-body'
      className={cn(
        '-mx-6 -mt-1 min-h-0 flex-1 overflow-y-auto px-6 pt-1 pb-6',
        className
      )}
      {...props}
    />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ModalFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='modal-footer'
      className={cn(
        'border-border *:not-first:border-border -mx-6 flex shrink-0 flex-col border-t *:not-first:border-t',
        className
      )}
      {...props}
    />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ModalTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  const { titleId } = useModalContext()
  return (
    <h2
      id={titleId}
      data-slot='modal-title'
      className={cn(
        'text-body leading-snug font-semibold tracking-[-0.01em]',
        className
      )}
      {...props}
    />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ModalDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { descriptionId } = useModalContext()
  return (
    <p
      id={descriptionId}
      data-slot='modal-description'
      className={cn('text-muted-foreground text-footnote', className)}
      {...props}
    />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function ModalAction({
  tone = 'default',
  emphasis = 'default',
  variant = 'row',
  className,
  ...props
}: React.ComponentProps<'button'> & {
  tone?: 'default' | 'brand' | 'destructive'
  emphasis?: 'default' | 'strong'
  variant?: 'row' | 'button'
}) {
  if (variant === 'button') {
    return (
      <Button
        variant={tone}
        size='lg'
        block
        data-slot='modal-action'
        className={cn('mx-6 my-3 w-auto', className)}
        {...props}
      />
    )
  }
  return (
    <Button
      variant='ghost'
      block
      data-slot='modal-action'
      className={cn(
        'h-auto rounded-none py-3.5 text-base',
        emphasis === 'strong' ? 'font-semibold' : 'font-normal',
        tone === 'brand' && 'text-brand',
        tone === 'destructive' && 'text-destructive',
        className
      )}
      {...props}
    />
  )
}

export {
  Modal,
  ModalAction,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
}
