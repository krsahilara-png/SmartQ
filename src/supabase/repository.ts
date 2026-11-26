import { getSupabaseClient, isSupabaseConfigured } from './client.ts';
import { loadUiPreferences } from './preferences.ts';
import type {
  BackendOperationResult,
  SmartQAnnouncement,
  SmartQAuditLog,
  SmartQCategory,
  SmartQCentre,
  SmartQCounter,
  SmartQDatabaseSnapshot,
  SmartQNoShowHistory,
  SmartQNotification,
  SmartQProfile,
  SmartQServiceHistory,
  SmartQSettings,
  SmartQToken,
  UserRole,
} from './types.ts';

const NOT_CONFIGURED_MSG =
  'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file and run the SQL migrations (see Setup Guide).';

function sanitizeError(err: unknown, fallback = 'Database operation failed.'): string {
  if (!err) return fallback;
  const raw =
    typeof err === 'string'
      ? err
      : typeof err === 'object' && 'message' in err
      ? String((err as { message?: unknown }).message || '')
      : fallback;
  const cleaned = raw.trim();
  if (!cleaned) return fallback;
  if (/relation .* does not exist/i.test(cleaned) || /could not find the table/i.test(cleaned)) {
    return 'Supabase tables are not initialized yet. Run migrations 001, 002, and 003 in Supabase SQL Editor.';
  }
  if (/row-level security/i.test(cleaned) || /permission denied/i.test(cleaned) || /forbidden/i.test(cleaned)) {
    return 'Permission denied by Supabase Row Level Security policy for your current role.';
  }
  if (/invalid login credentials/i.test(cleaned)) {
    return 'Invalid email or password. Verify your Supabase Auth credentials.';
  }
  if (/email not confirmed/i.test(cleaned)) {
    return 'Please confirm your email address before signing in (or disable email confirmation in Supabase Auth settings).';
  }
  return cleaned;
}

export function buildDefaultSettings(): SmartQSettings {
  const prefs = loadUiPreferences();
  return {
    notifyAtFive: true,
    notifyAtThree: true,
    notifyAtOne: true,
    notifyApproaching: true,
    notifyEtaChange: true,
    browserNotificationsEnabled: prefs.browserNotificationsEnabled,
    noShowGraceSec: 180,
    autoNoShowEnabled: true,
    autoAdvanceOnNoShow: true,
    priorityRules: {
      senior: true,
      medical: true,
      accessibility: true,
      vip: false,
      requireReason: true,
    },
    language: prefs.language,
    theme: prefs.theme,
    voiceAnnouncements: prefs.voiceAnnouncements,
  };
}

export function buildEmptySnapshot(
  seedCentres: SmartQCentre[] = [],
  seedCategories: SmartQCategory[] = []
): SmartQDatabaseSnapshot {
  return {
    version: 3,
    queueRevision: 1,
    tokenCounters: {},
    users: [],
    centres: seedCentres.map((c) => ({ ...c, areaTags: [...(c.areaTags || [])], announcements: [] })),
    categories: seedCategories.map((c) => ({ ...c })),
    counters: [],
    tokens: [],
    notifications: [],
    serviceHistory: [],
    noShowHistory: [],
    auditLogs: [],
    etaStats: {},
    settings: buildDefaultSettings(),
  };
}

// ---------------------------------------------------------------------------
// Row Mappers (snake_case PostgreSQL <-> camelCase SmartQ domain models)
// ---------------------------------------------------------------------------

function mapProfileRow(row: Record<string, unknown>): SmartQProfile {
  const roleVal = String(row.role || 'customer');
  const role: UserRole = roleVal === 'admin' || roleVal === 'operator' ? roleVal : 'customer';
  return {
    id: String(row.id || ''),
    name: String(row.full_name || row.email || 'User'),
    phone: String(row.phone || ''),
    email: String(row.email || ''),
    role,
    assignedCentreId: String(row.assigned_business_id || ''),
    assignedCounterId: String(row.assigned_counter_id || ''),
    favouriteCentreIds: Array.isArray(row.favourite_centre_ids)
      ? row.favourite_centre_ids.map(String)
      : [],
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function mapAnnouncementRow(row: Record<string, unknown>): SmartQAnnouncement {
  return {
    id: String(row.id || ''),
    businessId: String(row.business_id || ''),
    message: String(row.message || ''),
    messageHi: String(row.message_hi || row.message || ''),
    active: row.active !== false,
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function mapBusinessRow(
  row: Record<string, unknown>,
  announcementsByBiz: Map<string, SmartQAnnouncement[]>
): SmartQCentre {
  const id = String(row.id || '');
  const scopeRaw = String(row.data_scope || 'directory');
  const dataScope =
    scopeRaw === 'operational' || scopeRaw === 'demo' ? scopeRaw : 'directory';
  return {
    id,
    name: String(row.name || ''),
    nameHi: String(row.name_hi || row.name || ''),
    directoryCategoryId: String(row.directory_category_id || 'DIR_OTHER'),
    area: String(row.area || 'Bhopal'),
    locality: String(row.locality || row.area || ''),
    areaTags: Array.isArray(row.area_tags) ? row.area_tags.map(String) : [],
    address: String(row.address || ''),
    city: String(row.city || 'Bhopal'),
    phone: String(row.phone || ''),
    openTime: String(row.open_time || ''),
    closeTime: String(row.close_time || ''),
    dataScope,
    isOnboarded: Boolean(row.is_onboarded),
    bookingEnabled: row.booking_enabled !== false,
    verified: Boolean(row.verified),
    verifiedAt: row.verified_at ? String(row.verified_at) : null,
    verifiedBy: String(row.verified_by || ''),
    isActive: row.is_active !== false,
    announcements: announcementsByBiz.get(id) || [],
  };
}

function mapCategoryRow(row: Record<string, unknown>): SmartQCategory {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    nameHi: String(row.name_hi || row.name || ''),
    code: String(row.code || 'Q'),
    defaultDurationMin: Number(row.default_duration_min || 8),
    description: String(row.description || ''),
    directoryCategoryId: row.directory_category_id ? String(row.directory_category_id) : null,
    active: row.active !== false,
    isTemplateService: Boolean(row.is_template_service),
  };
}

function mapCounterRow(row: Record<string, unknown>): SmartQCounter {
  const statusRaw = String(row.status || 'open');
  const status = statusRaw === 'paused' || statusRaw === 'closed' ? statusRaw : 'open';
  return {
    id: String(row.id || ''),
    centreId: String(row.business_id || ''),
    number: String(row.number || ''),
    name: String(row.name || ''),
    categoryIds: Array.isArray(row.category_ids) ? row.category_ids.map(String) : [],
    operatorId: row.operator_id ? String(row.operator_id) : '',
    status,
    maxCapacity: Number(row.max_capacity || 20),
    avgDurationMin: Number(row.avg_duration_min || 8),
    openTime: String(row.open_time || ''),
    closeTime: String(row.close_time || ''),
    pauseReason: String(row.pause_reason || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function mapTokenRow(row: Record<string, unknown>, isRedactedPublic = false): SmartQToken {
  return {
    id: String(row.id || ''),
    tokenNumber: String(row.token_number || ''),
    customerId: row.customer_id ? String(row.customer_id) : '',
    customerName: isRedactedPublic ? 'Queue Member' : String(row.customer_name || 'Customer'),
    customerPhone: isRedactedPublic ? '' : String(row.customer_phone || ''),
    isGuest: Boolean(row.is_guest),
    centreId: String(row.business_id || ''),
    categoryId: String(row.category_id || ''),
    counterId: String(row.counter_id || ''),
    bookingType: row.booking_type === 'appointment' ? 'appointment' : 'immediate',
    scheduledTime: String(row.scheduled_time || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
    calledAt: row.called_at ? String(row.called_at) : null,
    arrivedAt: row.arrived_at ? String(row.arrived_at) : null,
    servingStartedAt: row.serving_started_at ? String(row.serving_started_at) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    cancelledAt: row.cancelled_at ? String(row.cancelled_at) : null,
    noShowAt: row.no_show_at ? String(row.no_show_at) : null,
    restoredAt: row.restored_at ? String(row.restored_at) : null,
    restoredBy: String(row.restored_by || ''),
    restoreReason: String(row.restore_reason || ''),
    cancelReason: String(row.cancel_reason || ''),
    noShowReason: String(row.no_show_reason || ''),
    noShowMode: String(row.no_show_mode || ''),
    recallCount: Number(row.recall_count || 0),
    actualServiceDurationMin:
      row.actual_service_duration_min !== null && row.actual_service_duration_min !== undefined
        ? Number(row.actual_service_duration_min)
        : null,
    position: Number(row.position || 0),
    peopleAhead: Number(row.people_ahead || 0),
    waitingAhead: Number(row.waiting_ahead || 0),
    etaMin: Number(row.eta_min || 0),
    etaRangeMin:
      row.eta_range_min !== null && row.eta_range_min !== undefined ? Number(row.eta_range_min) : null,
    etaRangeMax:
      row.eta_range_max !== null && row.eta_range_max !== undefined ? Number(row.eta_range_max) : null,
    etaAvgServiceMin:
      row.eta_avg_service_min !== null && row.eta_avg_service_min !== undefined
        ? Number(row.eta_avg_service_min)
        : null,
    etaSampleCount: Number(row.eta_sample_count || 0),
    status: String(row.status || 'Waiting'),
    priorityType: String(row.priority_type || 'standard'),
    priorityApprovedBy: String(row.priority_approved_by || ''),
    priorityReason: String(row.priority_reason || ''),
    notes: isRedactedPublic ? '' : String(row.notes || ''),
    lastNotifiedEtaMin:
      row.last_notified_eta_min !== null && row.last_notified_eta_min !== undefined
        ? Number(row.last_notified_eta_min)
        : null,
    notifiedThresholds: Array.isArray(row.notified_thresholds)
      ? row.notified_thresholds.map(String)
      : ['booked'],
    isRedactedPublic,
  };
}

function tokenToDbRow(token: SmartQToken): Record<string, unknown> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(token.customerId || '')
  );
  return {
    id: token.id,
    token_number: token.tokenNumber,
    customer_id: isUuid ? token.customerId : null,
    customer_name: token.customerName || 'Customer',
    customer_phone: token.customerPhone || '',
    is_guest: Boolean(token.isGuest),
    business_id: token.centreId,
    category_id: token.categoryId,
    counter_id: token.counterId,
    booking_type: token.bookingType === 'appointment' ? 'appointment' : 'immediate',
    scheduled_time: token.scheduledTime || '',
    status: token.status,
    position: Number(token.position || 0),
    people_ahead: Number(token.peopleAhead || 0),
    waiting_ahead: Number(token.waitingAhead || 0),
    eta_min: Number(token.etaMin || 0),
    eta_range_min: token.etaRangeMin ?? null,
    eta_range_max: token.etaRangeMax ?? null,
    eta_avg_service_min: token.etaAvgServiceMin ?? null,
    eta_sample_count: Number(token.etaSampleCount || 0),
    priority_type: token.priorityType || 'standard',
    priority_approved_by: token.priorityApprovedBy || '',
    priority_reason: token.priorityReason || '',
    notes: token.notes || '',
    cancel_reason: token.cancelReason || '',
    no_show_reason: token.noShowReason || '',
    no_show_mode: token.noShowMode || '',
    recall_count: Number(token.recallCount || 0),
    actual_service_duration_min: token.actualServiceDurationMin ?? null,
    last_notified_eta_min: token.lastNotifiedEtaMin ?? null,
    notified_thresholds: Array.isArray(token.notifiedThresholds) ? token.notifiedThresholds : ['booked'],
    called_at: token.calledAt || null,
    arrived_at: token.arrivedAt || null,
    serving_started_at: token.servingStartedAt || null,
    completed_at: token.completedAt || null,
    cancelled_at: token.cancelledAt || null,
    no_show_at: token.noShowAt || null,
    restored_at: token.restoredAt || null,
    restored_by: token.restoredBy || '',
    restore_reason: token.restoreReason || '',
    created_at: token.createdAt || new Date().toISOString(),
  };
}

function mapNotificationRow(row: Record<string, unknown>): SmartQNotification {
  return {
    id: String(row.id || ''),
    userId: String(row.user_id || ''),
    tokenId: String(row.token_id || ''),
    type: String(row.type || 'info'),
    title: String(row.title || ''),
    message: String(row.message || ''),
    urgent: Boolean(row.urgent),
    read: Boolean(row.read),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function mapServiceHistoryRow(row: Record<string, unknown>): SmartQServiceHistory {
  return {
    id: String(row.id || ''),
    tokenId: String(row.token_id || ''),
    tokenNumber: String(row.token_number || ''),
    centreId: String(row.business_id || ''),
    counterId: String(row.counter_id || ''),
    categoryId: String(row.category_id || ''),
    operatorId: row.operator_id ? String(row.operator_id) : '',
    fromStatus: String(row.from_status || ''),
    toStatus: String(row.to_status || ''),
    waitDurationMin: Number(row.wait_duration_min || 0),
    serviceDurationMin: Number(row.service_duration_min || 0),
    hourOfDay: Number(row.hour_of_day || 0),
    dateStr: String(row.date_str || ''),
    outcome: String(row.outcome || 'Completed'),
    notes: String(row.notes || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

function mapNoShowHistoryRow(row: Record<string, unknown>): SmartQNoShowHistory {
  return {
    id: String(row.id || ''),
    tokenId: String(row.token_id || ''),
    tokenNumber: String(row.token_number || ''),
    customerId: row.customer_id ? String(row.customer_id) : '',
    customerName: String(row.customer_name || ''),
    centreId: String(row.business_id || ''),
    counterId: String(row.counter_id || ''),
    counterNumber: String(row.counter_number || ''),
    calledAt: row.called_at ? String(row.called_at) : null,
    timestamp: String(row.occurred_at || new Date().toISOString()),
    reason: String(row.reason || ''),
    mode: row.mode === 'automatic' ? 'automatic' : 'manual',
    actorName: String(row.actor_name || ''),
    restored: Boolean(row.restored),
    restoredAt: row.restored_at ? String(row.restored_at) : null,
    restoredBy: String(row.restored_by || ''),
    restoreReason: String(row.restore_reason || ''),
  };
}

function mapAuditRow(row: Record<string, unknown>): SmartQAuditLog {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    actorName: String(row.actor_name || 'System'),
    actorRole: String(row.actor_role || 'system'),
    action: String(row.action || ''),
    targetType: String(row.target_type || ''),
    targetId: String(row.target_id || ''),
    details: String(row.details || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

// ---------------------------------------------------------------------------
// Authentication Operations (Supabase Auth + Role-Verified Profiles)
// ---------------------------------------------------------------------------

export async function fetchProfileById(userId: string): Promise<BackendOperationResult<SmartQProfile>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: sanitizeError(error, 'Failed to load user profile.') };
  }
  if (!data) {
    return {
      ok: false,
      error: 'Profile row not found. Ensure migration 002 (auth user trigger) has been executed.',
    };
  }
  return { ok: true, data: mapProfileRow(data as Record<string, unknown>) };
}

export async function getActiveAuthUser(): Promise<BackendOperationResult<SmartQProfile | null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: true, data: null };

  const { data: sessionRes, error } = await sb.auth.getSession();
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to restore auth session.') };
  const authUser = sessionRes.session?.user;
  if (!authUser) return { ok: true, data: null };

  const profileRes = await fetchProfileById(authUser.id);
  if (!profileRes.ok || !profileRes.data) {
    // Fallback minimal customer profile while awaiting profile table creation
    return {
      ok: true,
      data: {
        id: authUser.id,
        name: String(authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User'),
        phone: String(authUser.user_metadata?.phone || ''),
        email: String(authUser.email || ''),
        role: 'customer',
        assignedCentreId: '',
        assignedCounterId: '',
        favouriteCentreIds: [],
        createdAt: authUser.created_at || new Date().toISOString(),
      },
    };
  }
  return { ok: true, data: profileRes.data };
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<BackendOperationResult<SmartQProfile>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPwd = String(password || '');
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (cleanPwd.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const { data, error } = await sb.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPwd,
  });

  if (error || !data.user) {
    return { ok: false, error: sanitizeError(error, 'Sign in failed.') };
  }

  const prof = await fetchProfileById(data.user.id);
  if (!prof.ok || !prof.data) {
    return {
      ok: false,
      error: prof.error || 'Signed in, but profile could not be loaded. Check database migrations.',
    };
  }

  return { ok: true, data: prof.data };
}

export async function registerCustomerAccount(input: {
  name: string;
  phone: string;
  email: string;
  password: string;
}): Promise<BackendOperationResult<SmartQProfile | null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const cleanName = String(input.name || '').trim();
  const normPhone = String(input.phone || '').replace(/\D/g, '').slice(-10);
  const cleanEmail = String(input.email || '').trim().toLowerCase();
  const cleanPwd = String(input.password || '');

  if (cleanName.length < 2) {
    return { ok: false, error: 'Full name must be at least 2 characters.' };
  }
  if (normPhone.length !== 10) {
    return { ok: false, error: 'Enter a valid 10-digit mobile number.' };
  }
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: 'A valid email address is required for Supabase Authentication.' };
  }
  if (cleanPwd.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const { data, error } = await sb.auth.signUp({
    email: cleanEmail,
    password: cleanPwd,
    options: {
      data: {
        full_name: cleanName,
        phone: normPhone,
      },
    },
  });

  if (error) {
    return { ok: false, error: sanitizeError(error, 'Account registration failed.') };
  }

  if (!data.session || !data.user) {
    return {
      ok: true,
      data: null,
      needsEmailConfirmation: true,
    };
  }

  // Ensure profile reflects submitted name & phone
  await sb
    .from('profiles')
    .update({ full_name: cleanName, phone: normPhone })
    .eq('id', data.user.id);

  const prof = await fetchProfileById(data.user.id);
  if (!prof.ok || !prof.data) {
    return {
      ok: true,
      data: {
        id: data.user.id,
        name: cleanName,
        phone: normPhone,
        email: cleanEmail,
        role: 'customer',
        assignedCentreId: '',
        assignedCounterId: '',
        favouriteCentreIds: [],
        createdAt: new Date().toISOString(),
      },
    };
  }

  return { ok: true, data: prof.data };
}

export async function signOutAccount(): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: true, data: null };
  const { error } = await sb.auth.signOut();
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to sign out.') };
  return { ok: true, data: null };
}

export function subscribeAuthChanges(callback: () => void): () => void {
  const sb = getSupabaseClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event) => {
    callback();
  });
  return () => {
    data.subscription.unsubscribe();
  };
}

// ---------------------------------------------------------------------------
// Full Operational State Sync (PostgreSQL -> SmartQ Snapshot)
// ---------------------------------------------------------------------------

export async function fetchOperationalSnapshot(
  currentUser: SmartQProfile | null
): Promise<BackendOperationResult<SmartQDatabaseSnapshot>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  try {
    const [
      bizRes,
      annRes,
      catRes,
      cntRes,
      settingsRes,
      histRes,
      pubTokensRes,
    ] = await Promise.all([
      sb.from('businesses').select('*').order('name', { ascending: true }),
      sb.from('announcements').select('*').order('created_at', { ascending: false }),
      sb.from('service_categories').select('*').order('name', { ascending: true }),
      sb.from('counters').select('*').order('created_at', { ascending: true }),
      sb.from('app_settings').select('*').eq('id', 'default').maybeSingle(),
      sb.from('queue_status_history').select('*').order('created_at', { ascending: false }).limit(500),
      sb.rpc('get_public_queue_snapshot'),
    ]);

    const firstError =
      bizRes.error ||
      annRes.error ||
      catRes.error ||
      cntRes.error ||
      settingsRes.error ||
      histRes.error ||
      pubTokensRes.error;

    if (firstError) {
      return { ok: false, error: sanitizeError(firstError, 'Failed to load live data from Supabase.') };
    }

    // Scoped authenticated fetches (RLS enforces exact customer / operator / admin boundaries)
    let scopedTokensRows: Record<string, unknown>[] = [];
    let notifRows: Record<string, unknown>[] = [];
    let noShowRows: Record<string, unknown>[] = [];
    let auditRows: Record<string, unknown>[] = [];
    let profileRows: Record<string, unknown>[] = [];

    if (currentUser) {
      const authQueries: PromiseLike<unknown>[] = [
        sb.from('queue_tokens').select('*').order('created_at', { ascending: true }).then((r) => r),
        sb
          .from('notifications')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(200)
          .then((r) => r),
        sb
          .from('no_show_history')
          .select('*')
          .order('occurred_at', { ascending: false })
          .limit(200)
          .then((r) => r),
      ];

      if (currentUser.role === 'admin') {
        authQueries.push(
          sb.from('profiles').select('*').order('created_at', { ascending: false }).then((r) => r),
          sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(150).then((r) => r)
        );
      }

      const authResults = (await Promise.all(authQueries)) as Array<{
        data: Record<string, unknown>[] | null;
        error: unknown;
      }>;

      if (authResults[0]?.data) scopedTokensRows = authResults[0].data;
      if (authResults[1]?.data) notifRows = authResults[1].data;
      if (authResults[2]?.data) noShowRows = authResults[2].data;
      if (currentUser.role === 'admin') {
        if (authResults[3]?.data) profileRows = authResults[3].data;
        if (authResults[4]?.data) auditRows = authResults[4].data;
      }
    }

    // Map announcements by business_id
    const announcementsByBiz = new Map<string, SmartQAnnouncement[]>();
    for (const row of (annRes.data || []) as Record<string, unknown>[]) {
      const ann = mapAnnouncementRow(row);
      const list = announcementsByBiz.get(ann.businessId) || [];
      list.push(ann);
      announcementsByBiz.set(ann.businessId, list);
    }

    const centres = ((bizRes.data || []) as Record<string, unknown>[]).map((r) =>
      mapBusinessRow(r, announcementsByBiz)
    );
    const categories = ((catRes.data || []) as Record<string, unknown>[]).map(mapCategoryRow);
    const counters = ((cntRes.data || []) as Record<string, unknown>[]).map(mapCounterRow);

    // Merge privacy-safe public queue tokens with RLS-authorized detailed tokens
    const tokenMap = new Map<string, SmartQToken>();
    for (const row of ((pubTokensRes.data || []) as Record<string, unknown>[])) {
      const mapped = mapTokenRow(row, true);
      tokenMap.set(mapped.id, mapped);
    }
    for (const row of scopedTokensRows) {
      const mapped = mapTokenRow(row, false);
      tokenMap.set(mapped.id, mapped);
    }
    const tokens = Array.from(tokenMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const users: SmartQProfile[] =
      currentUser?.role === 'admin'
        ? profileRows.map(mapProfileRow)
        : currentUser
        ? [currentUser]
        : [];

    const prefs = loadUiPreferences();
    const sRow = (settingsRes.data || null) as Record<string, unknown> | null;
    const rawPri = (sRow?.priority_rules || {}) as Record<string, unknown>;
    const settings: SmartQSettings = {
      notifyAtFive: sRow ? Boolean(sRow.notify_at_five) : true,
      notifyAtThree: sRow ? Boolean(sRow.notify_at_three) : true,
      notifyAtOne: sRow ? Boolean(sRow.notify_at_one) : true,
      notifyApproaching: sRow ? Boolean(sRow.notify_approaching) : true,
      notifyEtaChange: sRow ? Boolean(sRow.notify_eta_change) : true,
      browserNotificationsEnabled: prefs.browserNotificationsEnabled,
      noShowGraceSec: sRow ? Number(sRow.no_show_grace_sec || 180) : 180,
      autoNoShowEnabled: sRow ? Boolean(sRow.auto_no_show_enabled) : true,
      autoAdvanceOnNoShow: sRow ? Boolean(sRow.auto_advance_on_no_show) : true,
      priorityRules: {
        senior: rawPri.senior !== false,
        medical: rawPri.medical !== false,
        accessibility: rawPri.accessibility !== false,
        vip: Boolean(rawPri.vip),
        requireReason: rawPri.requireReason !== false,
      },
      language: prefs.language,
      theme: prefs.theme,
      voiceAnnouncements: prefs.voiceAnnouncements,
    };

    return {
      ok: true,
      data: {
        version: 3,
        queueRevision: Date.now(),
        tokenCounters: {},
        users,
        centres,
        categories,
        counters,
        tokens,
        notifications: notifRows.map(mapNotificationRow),
        serviceHistory: ((histRes.data || []) as Record<string, unknown>[]).map(mapServiceHistoryRow),
        noShowHistory: noShowRows.map(mapNoShowHistoryRow),
        auditLogs: auditRows.map(mapAuditRow),
        etaStats: {},
        settings,
      },
    };
  } catch (err) {
    return { ok: false, error: sanitizeError(err, 'Failed to sync SmartQ data from Supabase.') };
  }
}

// ---------------------------------------------------------------------------
// Queue Token & Workflow Persistence Operations
// ---------------------------------------------------------------------------

export async function generateNextTokenNumber(code: string): Promise<BackendOperationResult<string>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { data, error } = await sb.rpc('next_token_number', { p_code: code || 'Q' });
  if (error || !data) {
    return { ok: false, error: sanitizeError(error, 'Failed to allocate queue token number.') };
  }
  return { ok: true, data: String(data) };
}

export async function insertQueueToken(token: SmartQToken): Promise<BackendOperationResult<SmartQToken>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { data, error } = await sb
    .from('queue_tokens')
    .insert(tokenToDbRow(token))
    .select('*')
    .single();

  if (error || !data) {
    return { ok: false, error: sanitizeError(error, 'Failed to save queue token in Supabase.') };
  }
  return { ok: true, data: mapTokenRow(data as Record<string, unknown>, false) };
}

export async function updateQueueToken(token: SmartQToken): Promise<BackendOperationResult<SmartQToken>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const row = tokenToDbRow(token);
  delete row.id;
  const { data, error } = await sb
    .from('queue_tokens')
    .update(row)
    .eq('id', token.id)
    .select('*')
    .single();

  if (error || !data) {
    return { ok: false, error: sanitizeError(error, 'Failed to update token in Supabase.') };
  }
  return { ok: true, data: mapTokenRow(data as Record<string, unknown>, false) };
}

export async function syncCounterTokensPositions(tokens: SmartQToken[]): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb || !tokens.length) return;
  const editable = tokens.filter((t) => !t.isRedactedPublic);
  if (!editable.length) return;

  await Promise.all(
    editable.map((tok) =>
      sb
        .from('queue_tokens')
        .update({
          status: tok.status,
          position: Number(tok.position || 0),
          people_ahead: Number(tok.peopleAhead || 0),
          waiting_ahead: Number(tok.waitingAhead || 0),
          eta_min: Number(tok.etaMin || 0),
          eta_range_min: tok.etaRangeMin ?? null,
          eta_range_max: tok.etaRangeMax ?? null,
          eta_avg_service_min: tok.etaAvgServiceMin ?? null,
          eta_sample_count: Number(tok.etaSampleCount || 0),
          last_notified_eta_min: tok.lastNotifiedEtaMin ?? null,
          notified_thresholds: Array.isArray(tok.notifiedThresholds) ? tok.notifiedThresholds : ['booked'],
        })
        .eq('id', tok.id)
    )
  );
}

export async function insertStatusHistoryRow(
  entry: SmartQServiceHistory
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(entry.operatorId || '')
  );

  const { error } = await sb.from('queue_status_history').insert({
    id: entry.id,
    token_id: entry.tokenId || null,
    token_number: entry.tokenNumber,
    business_id: entry.centreId,
    counter_id: entry.counterId,
    category_id: entry.categoryId,
    operator_id: isUuid ? entry.operatorId : null,
    from_status: entry.fromStatus || '',
    to_status: entry.toStatus || entry.outcome,
    outcome: entry.outcome,
    wait_duration_min: Number(entry.waitDurationMin || 0),
    service_duration_min: Number(entry.serviceDurationMin || 0),
    hour_of_day: Number(entry.hourOfDay || 0),
    date_str: entry.dateStr,
    notes: entry.notes || '',
    created_at: entry.createdAt,
  });
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to log queue history.') };
  return { ok: true, data: null };
}

export async function deleteNoShowHistoryOutcome(tokenId: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb
    .from('queue_status_history')
    .delete()
    .eq('token_id', tokenId)
    .eq('outcome', 'No-show');
}

export async function insertNoShowHistoryRow(
  entry: SmartQNoShowHistory
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(entry.customerId || '')
  );

  const { error } = await sb.from('no_show_history').insert({
    id: entry.id,
    token_id: entry.tokenId || null,
    token_number: entry.tokenNumber,
    customer_id: isUuid ? entry.customerId : null,
    customer_name: entry.customerName || '',
    business_id: entry.centreId,
    counter_id: entry.counterId,
    counter_number: entry.counterNumber || '',
    called_at: entry.calledAt || null,
    occurred_at: entry.timestamp,
    reason: entry.reason || '',
    mode: entry.mode,
    actor_name: entry.actorName || '',
    restored: false,
  });
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to record no-show history.') };
  return { ok: true, data: null };
}

export async function markNoShowRestoredInDb(
  tokenId: string,
  restoredBy: string,
  restoreReason: string
): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb
    .from('no_show_history')
    .update({
      restored: true,
      restored_at: new Date().toISOString(),
      restored_by: restoredBy,
      restore_reason: restoreReason,
    })
    .eq('token_id', tokenId)
    .eq('restored', false);
}

// ---------------------------------------------------------------------------
// Notifications & Audit Logs
// ---------------------------------------------------------------------------

export async function insertNotificationRow(
  entry: SmartQNotification
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(entry.userId || '')
  );
  if (!isUuid) return { ok: true, data: null };

  const { error } = await sb.from('notifications').insert({
    id: entry.id,
    user_id: entry.userId,
    token_id: entry.tokenId || null,
    type: entry.type || 'info',
    title: entry.title,
    message: entry.message,
    urgent: Boolean(entry.urgent),
    read: Boolean(entry.read),
    created_at: entry.createdAt,
  });
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to send notification.') };
  return { ok: true, data: null };
}

export async function setNotificationReadInDb(
  notifId: string,
  read: boolean
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const { error } = await sb.from('notifications').update({ read }).eq('id', notifId);
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to update notification.') };
  return { ok: true, data: null };
}

export async function markAllNotificationsReadInDb(
  userId: string
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to mark notifications read.') };
  return { ok: true, data: null };
}

export async function deleteNotificationInDb(
  notifId: string
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const { error } = await sb.from('notifications').delete().eq('id', notifId);
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to delete notification.') };
  return { ok: true, data: null };
}

export async function clearAllNotificationsInDb(
  userId: string
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const { error } = await sb.from('notifications').delete().eq('user_id', userId);
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to clear notifications.') };
  return { ok: true, data: null };
}

export async function insertAuditLogRow(entry: SmartQAuditLog): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from('audit_logs').insert({
    id: entry.id,
    actor_id: entry.actorId || '',
    actor_name: entry.actorName || 'System',
    actor_role: entry.actorRole || 'system',
    action: entry.action,
    target_type: entry.targetType || '',
    target_id: entry.targetId || '',
    details: entry.details || '',
    created_at: entry.createdAt,
  });
}

// ---------------------------------------------------------------------------
// Businesses, Counters, Categories, Announcements, Operators, Settings
// ---------------------------------------------------------------------------

export async function upsertBusinessInDb(
  biz: SmartQCentre
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { error } = await sb.from('businesses').upsert(
    {
      id: biz.id,
      name: biz.name,
      name_hi: biz.nameHi || biz.name,
      directory_category_id: biz.directoryCategoryId || 'DIR_OTHER',
      area: biz.area || 'Bhopal',
      locality: biz.locality || biz.area || '',
      area_tags: Array.isArray(biz.areaTags) ? biz.areaTags : [],
      address: biz.address,
      city: biz.city || 'Bhopal',
      phone: biz.phone || '',
      open_time: biz.openTime || '',
      close_time: biz.closeTime || '',
      data_scope: biz.dataScope || 'directory',
      is_onboarded: Boolean(biz.isOnboarded),
      booking_enabled: biz.bookingEnabled !== false,
      verified: Boolean(biz.verified),
      verified_at: biz.verifiedAt || null,
      verified_by: biz.verifiedBy || '',
      is_active: biz.isActive !== false,
    },
    { onConflict: 'id' }
  );
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to save business.') };
  return { ok: true, data: null };
}

export async function insertAnnouncementInDb(
  businessId: string,
  ann: SmartQAnnouncement,
  actorId?: string
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(actorId || '')
  );
  const { error } = await sb.from('announcements').insert({
    id: ann.id,
    business_id: businessId,
    message: ann.message,
    message_hi: ann.messageHi || ann.message,
    active: ann.active !== false,
    created_by: isUuid ? actorId : null,
    created_at: ann.createdAt,
  });
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to publish announcement.') };
  return { ok: true, data: null };
}

export async function deleteAnnouncementInDb(
  annId: string
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const { error } = await sb.from('announcements').delete().eq('id', annId);
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to remove announcement.') };
  return { ok: true, data: null };
}

export async function upsertCategoryInDb(
  cat: SmartQCategory
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { error } = await sb.from('service_categories').upsert(
    {
      id: cat.id,
      name: cat.name,
      name_hi: cat.nameHi || cat.name,
      code: cat.code,
      default_duration_min: Number(cat.defaultDurationMin || 8),
      description: cat.description || '',
      directory_category_id: cat.directoryCategoryId || null,
      active: cat.active !== false,
      is_template_service: Boolean(cat.isTemplateService),
    },
    { onConflict: 'id' }
  );
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to save service category.') };
  return { ok: true, data: null };
}

export async function upsertCountersInDb(
  counters: SmartQCounter[]
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const rows = counters.map((cnt) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(cnt.operatorId || '')
    );
    return {
      id: cnt.id,
      business_id: cnt.centreId,
      number: cnt.number,
      name: cnt.name,
      category_ids: Array.isArray(cnt.categoryIds) ? cnt.categoryIds : [],
      operator_id: isUuid ? cnt.operatorId : null,
      status: cnt.status || 'open',
      max_capacity: Number(cnt.maxCapacity || 20),
      avg_duration_min: Number(cnt.avgDurationMin || 8),
      open_time: cnt.openTime || '',
      close_time: cnt.closeTime || '',
      pause_reason: cnt.pauseReason || '',
    };
  });

  const { error } = await sb.from('counters').upsert(rows, { onConflict: 'id' });
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to save counter(s).') };

  // Keep operator_assignments & profiles synced when an operator is linked
  for (const cnt of counters) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(cnt.operatorId || '')
    );
    if (isUuid) {
      await sb
        .from('profiles')
        .update({ assigned_counter_id: cnt.id, assigned_business_id: cnt.centreId })
        .eq('id', cnt.operatorId);
      await sb.from('operator_assignments').upsert(
        {
          operator_id: cnt.operatorId,
          business_id: cnt.centreId,
          counter_id: cnt.id,
        },
        { onConflict: 'operator_id,business_id,counter_id' }
      );
    }
  }

  return { ok: true, data: null };
}

export async function updateCounterStatusInDb(
  counterId: string,
  status: 'open' | 'paused' | 'closed',
  pauseReason: string
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { error } = await sb
    .from('counters')
    .update({ status, pause_reason: pauseReason })
    .eq('id', counterId);
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to update counter status.') };
  return { ok: true, data: null };
}

export async function updateCounterAvgDurationInDb(
  counterId: string,
  avgDurationMin: number
): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb
    .from('counters')
    .update({ avg_duration_min: Math.max(1, Math.round(avgDurationMin)) })
    .eq('id', counterId);
}

export async function assignRoleAndCounterByEmail(
  email: string,
  role: UserRole,
  counterId: string
): Promise<BackendOperationResult<SmartQProfile>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { data, error } = await sb.rpc('admin_assign_operator_by_email', {
    p_email: String(email || '').trim().toLowerCase(),
    p_role: role,
    p_counter_id: counterId || null,
  });

  if (error || !data) {
    return { ok: false, error: sanitizeError(error, 'Failed to assign operator role.') };
  }
  return { ok: true, data: mapProfileRow(data as Record<string, unknown>) };
}

export async function updateUserFavouritesInDb(
  userId: string,
  favouriteCentreIds: string[]
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const { error } = await sb
    .from('profiles')
    .update({ favourite_centre_ids: favouriteCentreIds })
    .eq('id', userId);
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to update saved places.') };
  return { ok: true, data: null };
}

export async function saveAppSettingsInDb(
  settings: SmartQSettings,
  actorId?: string
): Promise<BackendOperationResult<null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(actorId || '')
  );
  const { error } = await sb.from('app_settings').upsert(
    {
      id: 'default',
      notify_at_five: Boolean(settings.notifyAtFive),
      notify_at_three: Boolean(settings.notifyAtThree),
      notify_at_one: Boolean(settings.notifyAtOne),
      notify_approaching: Boolean(settings.notifyApproaching),
      notify_eta_change: Boolean(settings.notifyEtaChange),
      no_show_grace_sec: Number(settings.noShowGraceSec || 180),
      auto_no_show_enabled: Boolean(settings.autoNoShowEnabled),
      auto_advance_on_no_show: Boolean(settings.autoAdvanceOnNoShow),
      priority_rules: settings.priorityRules,
      updated_by: isUuid ? actorId : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) return { ok: false, error: sanitizeError(error, 'Failed to save policy settings.') };
  return { ok: true, data: null };
}

export async function verifyQrTokenInDb(
  tokenId: string,
  tokenNumber: string
): Promise<BackendOperationResult<SmartQToken | null>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const { data, error } = await sb.rpc('verify_qr_token', {
    p_token_id: tokenId || null,
    p_token_number: tokenNumber || null,
  });

  if (error) {
    return { ok: false, error: sanitizeError(error, 'QR verification query failed.') };
  }
  const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  if (!rows.length) return { ok: true, data: null };
  return { ok: true, data: mapTokenRow(rows[0], true) };
}

export async function seedBhopalDirectoryInDb(
  businesses: SmartQCentre[],
  categories: SmartQCategory[]
): Promise<BackendOperationResult<{ businesses: number; categories: number }>> {
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: NOT_CONFIGURED_MSG, code: 'NOT_CONFIGURED' };

  const catRows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    name_hi: c.nameHi || c.name,
    code: c.code,
    default_duration_min: c.defaultDurationMin,
    description: c.description || '',
    directory_category_id: c.directoryCategoryId || null,
    active: c.active !== false,
    is_template_service: Boolean(c.isTemplateService),
  }));

  const bizRows = businesses.map((b) => ({
    id: b.id,
    name: b.name,
    name_hi: b.nameHi || b.name,
    directory_category_id: b.directoryCategoryId,
    area: b.area,
    locality: b.locality || b.area,
    area_tags: b.areaTags || [],
    address: b.address,
    city: b.city || 'Bhopal',
    phone: b.phone || '',
    open_time: b.openTime || '',
    close_time: b.closeTime || '',
    data_scope: b.dataScope || 'directory',
    is_onboarded: Boolean(b.isOnboarded),
    booking_enabled: Boolean(b.bookingEnabled),
    verified: Boolean(b.verified),
    is_active: b.isActive !== false,
  }));

  const catRes = await sb.from('service_categories').upsert(catRows, { onConflict: 'id', ignoreDuplicates: true });
  if (catRes.error) return { ok: false, error: sanitizeError(catRes.error, 'Failed to seed categories.') };

  const bizRes = await sb.from('businesses').upsert(bizRows, { onConflict: 'id', ignoreDuplicates: true });
  if (bizRes.error) return { ok: false, error: sanitizeError(bizRes.error, 'Failed to seed Bhopal directory.') };

  return { ok: true, data: { businesses: bizRows.length, categories: catRows.length } };
}

export { isSupabaseConfigured };
