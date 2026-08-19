import { usePermissionTree } from '@/services/use-permissions'
import { useTranslation } from 'react-i18next'

import { Badge } from '@shared/ui/components/badge'
import { Button } from '@shared/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/ui/components/popover'
import { cn } from '@shared/ui/lib/utils'

import { pruneToHeld } from './permission-tree'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type HeldRowProps = {
  node: PermissionNode
  depth: number
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function HeldRow({ node, depth }: HeldRowProps) {
  return (
    <>
      <div
        className='py-1.5'
        style={{ marginInlineStart: `${depth * 0.75}rem` }}
      >
        <span
          className={cn(
            'block text-sm font-semibold',
            !node.grantable && 'text-muted-foreground text-xs uppercase'
          )}
        >
          {node.label}
        </span>
        {node.grantable && (
          <span className='text-muted-foreground block text-xs'>
            {node.description}
          </span>
        )}
      </div>
      {node.children.map((child) => (
        <HeldRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </>
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type AdminPermissionsCellProps = {
  admin: Admin
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function AdminPermissionsCell({ admin }: AdminPermissionsCellProps) {
  const { t } = useTranslation('admins')
  const { t: tCommon } = useTranslation('common')
  const tree = usePermissionTree()

  if (admin.permissions.length === 0) {
    return (
      <span className='text-muted-foreground text-xs'>
        {t('permissions.none')}
      </span>
    )
  }

  const held = new Set<string>(admin.permissions)
  const granted = (tree.data ?? [])
    .map((node) => pruneToHeld(node, held))
    .filter((node): node is PermissionNode => node !== null)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          data-row-passive=''
          className='-mx-2 h-auto rounded-md px-2 py-1'
        >
          <Badge variant='neutral' className='font-medium'>
            {t('permissions.count', { count: admin.permissions.length })}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-72 p-0'>
        <div className='max-h-72 overflow-y-auto px-3 py-2'>
          {tree.isPending ? (
            <span className='text-muted-foreground text-sm'>
              {tCommon('status.loading')}
            </span>
          ) : tree.isError ? (
            <span className='text-destructive text-sm'>
              {t('permissionsDialog.loadFailed')}
            </span>
          ) : (
            granted.map((node) => (
              <HeldRow key={node.id} node={node} depth={0} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
