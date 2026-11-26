-- ============================================================================
-- SmartQ Bhopal — Supabase PostgreSQL Schema Migration (001)
-- Creates all 13 core tables for businesses/service centres, service
-- categories, user profiles, counters, operator assignments, announcements,
-- atomic token sequences, queue tokens/bookings, queue status history,
-- no-show history, notifications, audit logs, and policy settings.
--
-- Idempotent: safe to re-run without creating duplicate or conflicting tables.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Businesses & Service Centres
create table if not exists public.businesses (
  id text primary key,
  name text not null,
  name_hi text not null default '',
  directory_category_id text not null default 'DIR_OTHER',
  area text not null default 'Bhopal',
  locality text not null default '',
  area_tags text[] not null default '{}',
  address text not null,
  city text not null default 'Bhopal',
  phone text not null default '',
  open_time text not null default '',
  close_time text not null default '',
  data_scope text not null default 'directory' check (data_scope in ('directory', 'operational', 'demo')),
  is_onboarded boolean not null default false,
  booking_enabled boolean not null default false,
  verified boolean not null default false,
  verified_at timestamptz null,
  verified_by text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Service Categories / Counter Services
create table if not exists public.service_categories (
  id text primary key,
  name text not null,
  name_hi text not null default '',
  code text not null,
  default_duration_min integer not null default 8 check (default_duration_min >= 1 and default_duration_min <= 240),
  description text not null default '',
  directory_category_id text null,
  active boolean not null default true,
  is_template_service boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. User Profiles (linked 1:1 with Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'operator', 'admin')),
  assigned_business_id text null references public.businesses(id) on delete set null,
  assigned_counter_id text null,
  favourite_centre_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Counters (Service Desks per Business)
create table if not exists public.counters (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  number text not null,
  name text not null,
  category_ids text[] not null default '{}',
  operator_id uuid null references public.profiles(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'paused', 'closed')),
  max_capacity integer not null default 20 check (max_capacity >= 1 and max_capacity <= 500),
  avg_duration_min integer not null default 8 check (avg_duration_min >= 1 and avg_duration_min <= 240),
  open_time text not null default '',
  close_time text not null default '',
  pause_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add FK from profiles.assigned_counter_id -> counters.id after counters table exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_assigned_counter_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_assigned_counter_id_fkey
      foreign key (assigned_counter_id) references public.counters(id) on delete set null;
  end if;
end $$;

-- 5. Operator Role & Business/Counter Assignments (Multi-desk RBAC support)
create table if not exists public.operator_assignments (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.profiles(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  counter_id text null references public.counters(id) on delete cascade,
  assigned_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (operator_id, business_id, counter_id)
);

-- 6. Business Service Announcements
create table if not exists public.announcements (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  message text not null,
  message_hi text not null default '',
  active boolean not null default true,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 7. Atomic Token Prefix Sequences
create table if not exists public.token_sequences (
  code text primary key,
  last_number integer not null default 100,
  updated_at timestamptz not null default now()
);

-- 8. Queue Tokens & Bookings
create table if not exists public.queue_tokens (
  id text primary key,
  token_number text not null,
  customer_id uuid null references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  is_guest boolean not null default false,
  business_id text not null references public.businesses(id) on delete cascade,
  category_id text not null references public.service_categories(id) on delete restrict,
  counter_id text not null references public.counters(id) on delete cascade,
  booking_type text not null default 'immediate' check (booking_type in ('immediate', 'appointment')),
  scheduled_time text not null default '',
  status text not null default 'Waiting' check (
    status in ('Booked', 'Waiting', 'Approaching', 'Called', 'Arrived', 'Serving', 'Completed', 'Cancelled', 'Skipped', 'No-show')
  ),
  position integer not null default 0,
  people_ahead integer not null default 0,
  waiting_ahead integer not null default 0,
  eta_min integer not null default 0,
  eta_range_min integer null,
  eta_range_max integer null,
  eta_avg_service_min integer null,
  eta_sample_count integer not null default 0,
  priority_type text not null default 'standard' check (priority_type in ('standard', 'senior', 'medical', 'accessibility', 'vip')),
  priority_approved_by text not null default '',
  priority_reason text not null default '',
  notes text not null default '',
  cancel_reason text not null default '',
  no_show_reason text not null default '',
  no_show_mode text not null default '',
  recall_count integer not null default 0,
  actual_service_duration_min integer null,
  last_notified_eta_min integer null,
  notified_thresholds text[] not null default '{booked}',
  called_at timestamptz null,
  arrived_at timestamptz null,
  serving_started_at timestamptz null,
  completed_at timestamptz null,
  cancelled_at timestamptz null,
  no_show_at timestamptz null,
  restored_at timestamptz null,
  restored_by text not null default '',
  restore_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure Realtime UPDATE payloads include previous status (payload.old.status)
-- so SmartQ only triggers "Now Calling" alerts on actual status transitions.
alter table public.queue_tokens replica identity full;

-- 9. Queue Status & Service History (ETA Rolling History + Analytics)
create table if not exists public.queue_status_history (
  id text primary key,
  token_id text null references public.queue_tokens(id) on delete set null,
  token_number text not null,
  business_id text not null references public.businesses(id) on delete cascade,
  counter_id text not null references public.counters(id) on delete cascade,
  category_id text not null references public.service_categories(id) on delete restrict,
  operator_id uuid null references public.profiles(id) on delete set null,
  from_status text not null default '',
  to_status text not null default '',
  outcome text not null check (outcome in ('Completed', 'Cancelled', 'No-show', 'Skipped', 'Restored', 'StatusChange')),
  wait_duration_min integer not null default 0,
  service_duration_min integer not null default 0,
  hour_of_day integer not null default 0 check (hour_of_day >= 0 and hour_of_day <= 23),
  date_str text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- 10. No-Show & Restoration History
create table if not exists public.no_show_history (
  id text primary key,
  token_id text null references public.queue_tokens(id) on delete set null,
  token_number text not null,
  customer_id uuid null references public.profiles(id) on delete set null,
  customer_name text not null default '',
  business_id text not null references public.businesses(id) on delete cascade,
  counter_id text not null references public.counters(id) on delete cascade,
  counter_number text not null default '',
  called_at timestamptz null,
  occurred_at timestamptz not null default now(),
  reason text not null default '',
  mode text not null default 'manual' check (mode in ('manual', 'automatic')),
  actor_name text not null default '',
  restored boolean not null default false,
  restored_at timestamptz null,
  restored_by text not null default '',
  restore_reason text not null default ''
);

-- 11. User Notifications
create table if not exists public.notifications (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_id text null references public.queue_tokens(id) on delete set null,
  type text not null default 'info',
  title text not null,
  message text not null,
  urgent boolean not null default false,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 12. Immutable Audit Logs
create table if not exists public.audit_logs (
  id text primary key,
  actor_id text not null default '',
  actor_name text not null default 'System',
  actor_role text not null default 'system',
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  details text not null default '',
  created_at timestamptz not null default now()
);

-- 13. Platform Queue & Notification Policy Settings (Singleton)
create table if not exists public.app_settings (
  id text primary key default 'default',
  notify_at_five boolean not null default true,
  notify_at_three boolean not null default true,
  notify_at_one boolean not null default true,
  notify_approaching boolean not null default true,
  notify_eta_change boolean not null default true,
  no_show_grace_sec integer not null default 180 check (no_show_grace_sec >= 15 and no_show_grace_sec <= 900),
  auto_no_show_enabled boolean not null default true,
  auto_advance_on_no_show boolean not null default true,
  priority_rules jsonb not null default '{"senior":true,"medical":true,"accessibility":true,"vip":false,"requireReason":true}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid null references public.profiles(id) on delete set null
);

-- Indexes for fast queue calculations, realtime filtering, and analytics
create index if not exists idx_businesses_scope_active on public.businesses(data_scope, is_active);
create index if not exists idx_announcements_business_created on public.announcements(business_id, created_at desc);
create index if not exists idx_counters_business on public.counters(business_id);
create index if not exists idx_counters_operator on public.counters(operator_id);
create index if not exists idx_operator_assignments_op on public.operator_assignments(operator_id);
create index if not exists idx_operator_assignments_counter on public.operator_assignments(counter_id);
create index if not exists idx_queue_tokens_counter_status on public.queue_tokens(counter_id, status);
create index if not exists idx_queue_tokens_business on public.queue_tokens(business_id);
create index if not exists idx_queue_tokens_customer on public.queue_tokens(customer_id);
create index if not exists idx_queue_tokens_number on public.queue_tokens(token_number);
create index if not exists idx_queue_status_history_counter on public.queue_status_history(counter_id, created_at desc);
create index if not exists idx_queue_status_history_date on public.queue_status_history(date_str);
create index if not exists idx_queue_status_history_token_outcome on public.queue_status_history(token_id, outcome);
create index if not exists idx_no_show_history_occurred on public.no_show_history(occurred_at desc);
create index if not exists idx_no_show_history_token on public.no_show_history(token_id, restored);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

-- Updated_at trigger helper (fixed search_path for Supabase linter compliance)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_businesses_updated_at on public.businesses;
create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_counters_updated_at on public.counters;
create trigger trg_counters_updated_at
  before update on public.counters
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_queue_tokens_updated_at on public.queue_tokens;
create trigger trg_queue_tokens_updated_at
  before update on public.queue_tokens
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.touch_updated_at();
