import { useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type TableName = 'sessions' | 'participants' | 'tasks' | 'votes';

export function useRealtime<T extends Record<string, unknown>>(
  table: TableName,
  filter: string,
  onPayload: (payload: RealtimePostgresChangesPayload<T>) => void,
  enabled = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const subscribe = useCallback(() => {
    const channel = supabase
      .channel(`${table}:${filter}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        onPayload as (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
      )
      .subscribe();

    channelRef.current = channel;
  }, [table, filter, onPayload]);

  useEffect(() => {
    if (!enabled) return;
    subscribe();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [enabled, subscribe]);

  return channelRef;
}
