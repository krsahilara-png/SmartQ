import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient } from './client.ts';
import type { RealtimeState } from './types.ts';

export interface RealtimeEventMeta {
  table: string;
  eventType: string;
  calledTokenNumber?: string;
  calledCounterId?: string;
}

interface RealtimeCallbacks {
  onStatusChange: (state: RealtimeState) => void;
  onDataChange: (meta: RealtimeEventMeta) => void;
}

const WATCHED_TABLES = [
  'queue_tokens',
  'counters',
  'businesses',
  'announcements',
  'notifications',
  'service_categories',
  'app_settings',
] as const;

let activeChannel: RealtimeChannel | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function startSmartQRealtime(callbacks: RealtimeCallbacks): () => void {
  stopSmartQRealtime();

  const sb = getSupabaseClient();
  if (!sb) {
    callbacks.onStatusChange('offline');
    return () => {};
  }

  callbacks.onStatusChange('subscribing');

  let channel = sb.channel('smartq-live-realtime');

  for (const table of WATCHED_TABLES) {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        const nextRow = (payload.new || {}) as Record<string, unknown>;
        const prevRow = (payload.old || {}) as Record<string, unknown>;
        const isNewCall =
          table === 'queue_tokens' &&
          nextRow.status === 'Called' &&
          prevRow.status !== 'Called' &&
          Boolean(nextRow.token_number);

        const meta: RealtimeEventMeta = {
          table,
          eventType: payload.eventType,
          calledTokenNumber: isNewCall ? String(nextRow.token_number) : undefined,
          calledCounterId: isNewCall ? String(nextRow.counter_id || '') : undefined,
        };

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          callbacks.onDataChange(meta);
        }, 140);
      }
    );
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      callbacks.onStatusChange('live');
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      callbacks.onStatusChange('error');
    } else if (status === 'CLOSED') {
      callbacks.onStatusChange('offline');
    }
  });

  activeChannel = channel;

  return () => {
    stopSmartQRealtime();
  };
}

export function stopSmartQRealtime(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  const sb = getSupabaseClient();
  if (activeChannel && sb) {
    sb.removeChannel(activeChannel);
  }
  activeChannel = null;
}
