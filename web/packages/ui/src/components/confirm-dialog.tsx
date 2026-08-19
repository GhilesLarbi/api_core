import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Modal,
  ModalAction,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@shared/ui/components/modal'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  desc: React.ReactNode
  confirmText?: React.ReactNode
  cancelText?: React.ReactNode
  destructive?: boolean
  isLoading?: boolean
  disabled?: boolean
  handleConfirm: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  desc,
  confirmText,
  cancelText,
  destructive,
  isLoading,
  disabled,
  handleConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation('common')

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent variant='alert' showCloseButton={false}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{desc}</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalAction
            tone={destructive ? 'destructive' : 'brand'}
            emphasis='strong'
            disabled={disabled || isLoading}
            onClick={handleConfirm}
          >
            {isLoading && <Loader2 className='size-4 animate-spin' />}
            {confirmText ?? t('actions.confirm')}
          </ModalAction>
          <ModalAction onClick={() => onOpenChange(false)}>
            {cancelText ?? t('actions.cancel')}
          </ModalAction>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
