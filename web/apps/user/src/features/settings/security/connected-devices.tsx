import { useState } from 'react'
import { useLogoutUserSessions, useUserSessions } from '@/services/use-account'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { ar, enUS, fr } from 'date-fns/locale'
import { ChevronLeft, Monitor, Smartphone, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuthStore } from '@/stores/auth-store'

import { Button } from '@shared/ui/components/button'
import { ConfirmDialog } from '@shared/ui/components/confirm-dialog'
import { ListRow } from '@shared/ui/components/list-row'
import { Skeleton } from '@shared/ui/components/skeleton'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const DATE_LOCALES = { ar, fr, en: enUS } as const

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function relativeTime(iso: string, lang: string) {
  const locale = DATE_LOCALES[lang as keyof typeof DATE_LOCALES] ?? enUS
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale })
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function describeDevice(ua?: string) {
  if (!ua) return ''
  let os = ''
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/linux/i.test(ua)) os = 'Linux'
  let browser = ''
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera'
  else if (/chrome\//i.test(ua)) browser = 'Chrome'
  else if (/firefox\//i.test(ua)) browser = 'Firefox'
  else if (/safari\//i.test(ua)) browser = 'Safari'
  return [browser, os].filter(Boolean).join(' · ')
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function isMobile(ua?: string) {
  return !!ua && /iphone|ipad|ipod|android|mobile/i.test(ua)
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type Pending = { type: 'one'; session: UserSession } | { type: 'all' } | null

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function ConnectedDevicesView({ onBack }: { onBack: () => void }) {
  const { t, i18n } = useTranslation('settings')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const sessions = useUserSessions({ page: 1, size: 100 })
  const logoutSessions = useLogoutUserSessions()
  const [pending, setPending] = useState<Pending>(null)

  const lang = i18n.language.split('-')[0]
  const items = sessions.data?.items ?? []

  function handleConfirm() {
    if (!pending) return
    if (pending.type === 'all') {
      const ids = items.map((session) => session.id)
      if (ids.length === 0) return
      logoutSessions.mutate(ids, {
        onSuccess: () => {
          useAuthStore.getState().clear()
          queryClient.clear()
          navigate({ to: '/', replace: true })
        },
      })
    } else {
      logoutSessions.mutate([pending.session.id], {
        onSuccess: () => setPending(null),
      })
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon-sm'
          shape='circle'
          onClick={onBack}
          className='-ms-2'
        >
          <ChevronLeft className='size-6 rtl:rotate-180' />
        </Button>
        <h2 className='text-2xl font-bold tracking-tight'>
          {t('security.connectedDevices')}
        </h2>
      </div>

      {sessions.isLoading ? (
        <div className='space-y-2'>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className='h-16 w-full rounded-lg' />
          ))}
        </div>
      ) : sessions.isError ? (
        <p className='text-destructive text-sm'>
          {t('security.devicesFailed')}
        </p>
      ) : items.length === 0 ? (
        <p className='text-muted-foreground text-sm'>
          {t('security.noDevices')}
        </p>
      ) : (
        <>
          <div className='bg-card divide-y overflow-hidden rounded-lg border'>
            {items.map((session) => {
              const label =
                describeDevice(session.user_agent) ||
                t('security.unknownDevice')
              const when = session.last_used_at ?? session.created_at
              const meta = [
                session.ip_address,
                when ? relativeTime(when, lang) : null,
              ]
                .filter(Boolean)
                .join(' · ')
              const Icon = isMobile(session.user_agent) ? Smartphone : Monitor
              return (
                <ListRow
                  key={session.id}
                  joined
                  tone='plain'
                  size='lg'
                  onClick={() => setPending({ type: 'one', session })}
                  leading={
                    <Icon className='text-muted-foreground size-5 shrink-0' />
                  }
                  label={<span className='font-medium'>{label}</span>}
                  description={meta}
                  trailing={<X className='size-4' />}
                />
              )
            })}
          </div>

          <div>
            <ListRow
              tone='destructive'
              size='lg'
              onClick={() => setPending({ type: 'all' })}
              label={
                <span className='font-medium'>
                  {t('security.disconnectAll')}
                </span>
              }
              className='bg-accent'
            />
            <p className='text-muted-foreground mt-2 px-1 text-sm'>
              {t('security.disconnectAllDesc')}
            </p>
          </div>
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null)
        }}
        destructive
        title={
          pending?.type === 'all'
            ? t('security.disconnectAll')
            : t('security.disconnectDevice')
        }
        desc={
          pending?.type === 'all'
            ? t('security.disconnectAllDesc')
            : t('security.disconnectDeviceDesc')
        }
        confirmText={t('security.disconnect')}
        isLoading={logoutSessions.isPending}
        handleConfirm={handleConfirm}
      />
    </div>
  )
}
