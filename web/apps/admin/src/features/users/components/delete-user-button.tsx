import { useState } from 'react'
import { useDeleteUser } from '@/services/use-users'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { ConfirmDialog } from '@shared/ui/components/confirm-dialog'
import { useErrorDialog } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type DeleteUserButtonProps = {
  user: User
  onDeleted: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DeleteUserButton({ user, onDeleted }: DeleteUserButtonProps) {
  const { t } = useTranslation('common')
  const { t: tUsers } = useTranslation('users')
  const [open, setOpen] = useState(false)
  const deleteUser = useDeleteUser()

  function handleDelete() {
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        setOpen(false)
        onDeleted()
      },
      onError: (error) => useErrorDialog.getState().showError(error),
    })
  }

  return (
    <>
      <Button
        variant='ghost'
        size='icon-sm'
        shape='circle'
        onClick={() => setOpen(true)}
        aria-label={t('actions.delete')}
        title={t('actions.delete')}
        className='text-destructive hover:bg-destructive/10'
      >
        <Trash2 className='size-4' />
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title={tUsers('deleteDialog.title')}
        desc={tUsers('deleteDialog.description', {
          name:
            [user.first_name, user.last_name].filter(Boolean).join(' ') ||
            user.email,
        })}
        confirmText={t('actions.delete')}
        isLoading={deleteUser.isPending}
        handleConfirm={handleDelete}
      />
    </>
  )
}
