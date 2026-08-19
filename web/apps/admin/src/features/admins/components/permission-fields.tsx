import { useMemo } from 'react'
import { usePermissionTree } from '@/services/use-permissions'
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@shared/ui/components/skeleton'
import {
  TreeSelect,
  type TreeSelectNode,
} from '@shared/ui/components/tree-select'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function toNodes(permissions: PermissionNode[]): TreeSelectNode[] {
  return permissions.map((permission) => ({
    id: permission.path,
    label: permission.label,
    description: permission.grantable ? permission.description : undefined,
    selectable: permission.grantable,
    children: toNodes(permission.children),
  }))
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type PermissionFieldsProps = {
  selected: Set<string>
  disabled: boolean
  onChange: (next: Set<string>) => void
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function PermissionFields({
  selected,
  disabled,
  onChange,
}: PermissionFieldsProps) {
  const { t } = useTranslation('admins')
  const tree = usePermissionTree()
  const nodes = useMemo(() => toNodes(tree.data ?? []), [tree.data])
  const value = useMemo(() => [...selected].sort(), [selected])

  if (tree.isPending) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-11 w-full' />
        <Skeleton className='h-11 w-full' />
        <Skeleton className='h-11 w-full' />
      </div>
    )
  }

  if (tree.isError) {
    return (
      <p className='text-destructive text-sm'>
        {t('permissionsDialog.loadFailed')}
      </p>
    )
  }

  return (
    <TreeSelect
      nodes={nodes}
      value={value}
      onValueChange={(next) => onChange(new Set(next))}
      rootLabel={t('permissionsDialog.title')}
      disabled={disabled}
    />
  )
}
