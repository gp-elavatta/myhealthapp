'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableName = 'wait_time_snapshots' | 'queue_entries' | 'waitlist_entries' | 'appointments' | 'callback_requests' | 'notifications'

export function useRealtime<T extends Record<string, unknown>>(
  table: TableName,
  filter: string | null,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          callback(payload as RealtimePostgresChangesPayload<T>)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, callback, supabase])
}
