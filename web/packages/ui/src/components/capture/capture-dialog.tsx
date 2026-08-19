import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@shared/ui/components/modal'
import { cn } from '@shared/ui/lib/utils'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type CaptureState =
  | 'idle'
  | 'asking'
  | 'ready'
  | 'recording'
  | 'review'
  | 'saving'
  | 'denied'
  | 'unsupported'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type CaptureDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  state: CaptureState
  stage: React.ReactNode
  action: React.ReactNode
  onRetake?: () => void
  error?: string | null
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function CaptureDialog({
  open,
  onOpenChange,
  title,
  state,
  stage,
  action,
  onRetake,
  error,
}: CaptureDialogProps) {
  const { t } = useTranslation('common')

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div
            className={cn(
              'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl',
              state === 'denied' || state === 'unsupported'
                ? 'bg-muted'
                : 'bg-black'
            )}
          >
            {state === 'asking' ? (
              <Loader2 className='size-6 animate-spin text-white' />
            ) : state === 'denied' ? (
              <p className='text-muted-foreground px-6 text-center text-sm'>
                {t('capture.denied')}
              </p>
            ) : state === 'unsupported' ? (
              <p className='text-muted-foreground px-6 text-center text-sm'>
                {t('capture.unsupported')}
              </p>
            ) : (
              stage
            )}
          </div>

          {error && <p className='text-destructive mt-3 text-sm'>{error}</p>}
        </ModalBody>

        <ModalFooter>
          <div className='flex items-center gap-2 p-3'>
            {onRetake && state === 'review' && (
              <Button
                variant='secondary'
                size='lg'
                className='rounded-xl'
                onClick={onRetake}
              >
                {t('capture.retake')}
              </Button>
            )}
            <div className='flex-1'>{action}</div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
