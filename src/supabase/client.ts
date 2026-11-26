import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function isValidHttpUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    !value ||
    lower.includes('your_project') ||
    lower.includes('your_supabase') ||
    lower.includes('my_supabase') ||
    lower === 'placeholder'
  );
}

const configured =
  isValidHttpUrl(rawUrl) && !isPlaceholder(rawUrl) && rawAnonKey.length >= 20 && !isPlaceholder(rawAnonKey);

let clientInstance: SupabaseClient | null = null;

if (configured) {
  clientInstance = createClient(rawUrl, rawAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

export function isSupabaseConfigured(): boolean {
  return configured && clientInstance !== null;
}

export function getSupabaseClient(): SupabaseClient | null {
  return clientInstance;
}

export function getSupabaseConfigSummary(): {
  configured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  host: string;
} {
  let host = '';
  if (isValidHttpUrl(rawUrl)) {
    try {
      host = new URL(rawUrl).host;
    } catch {
      host = '';
    }
  }
  return {
    configured,
    hasUrl: isValidHttpUrl(rawUrl) && !isPlaceholder(rawUrl),
    hasAnonKey: rawAnonKey.length >= 20 && !isPlaceholder(rawAnonKey),
    host,
  };
}
