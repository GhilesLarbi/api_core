import { useState } from 'react'
import { useDeleteAdmin } from '@/services/use-admins'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/ui/components/button'
import { ConfirmDialog } from '@shared/ui/components/confirm-dialog'
import { useErrorDialog } from '@shared/ui/lib/error-dialog-store'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type DeleteAdminButtonProps = {
  admin: Admin
  onDeleted: () => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function DeleteAdminButton({
  admin,
  onDeleted,
}: DeleteAdminButtonProps) {
  const { t } = useTranslation('common')
  const { t: tAdmins } = useTranslation('admins')
  const [open, setOpen] = useState(false)
  const deleteAdmin = useDeleteAdmin()

  function handleDelete() {
    deleteAdmin.mutate(admin.id, {
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
        title={tAdmins('deleteDialog.title')}
        desc={tAdmins('deleteDialog.description', {
          name: `${admin.first_name} ${admin.last_name}`,
        })}
        confirmText={t('actions.delete')}
        isLoading={deleteAdmin.isPending}
        handleConfirm={handleDelete}
      />
    </>
  )
}
