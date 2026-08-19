import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@shared/ui/components/modal'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type MessageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function MessageDialog({
  open,
  onOpenChange,
  icon,
  title,
  description,
  children,
}: MessageDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent variant='alert'>
        <ModalHeader>
          {icon && (
            <div className='bg-accent mx-auto mb-3 flex size-14 items-center justify-center rounded-full'>
              {icon}
            </div>
          )}
          <ModalTitle className='text-xl'>{title}</ModalTitle>
          {description && (
            <ModalDescription className='text-foreground text-subhead'>
              {description}
            </ModalDescription>
          )}
        </ModalHeader>
        <ModalBody className='text-center'>{children}</ModalBody>
      </ModalContent>
    </Modal>
  )
}
