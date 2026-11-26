-- ============================================================================
-- SmartQ Bhopal — Row Level Security, Role Guards, Atomic RPCs & Realtime (002)
-- Run AFTER 001_smartq_schema.sql in Supabase SQL Editor.
-- Idempotent: safe to re-run on an existing SmartQ database.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Role Verification Helper Functions (SECURITY DEFINER to avoid RLS recursion)
-- ----------------------------------------------------------------------------

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'anonymous'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_operator_for_counter(p_counter_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'operator'
      and (
        p.assigned_counter_id = p_counter_id
        or exists (
          select 1 from public.counters c
          where c.id = p_counter_id and c.operator_id = auth.uid()
        )
        or exists (
          select 1 from public.operator_assignments oa
          where oa.operator_id = auth.uid()
            and (
              oa.counter_id = p_counter_id
              or (
                oa.counter_id is null
                and oa.business_id = (select c2.business_id from public.counters c2 where c2.id = p_counter_id)
              )
            )
        )
      )
  );
$$;

create or replace function public.is_operator_for_business(p_business_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'operator'
      and (
        p.assigned_business_id = p_business_id
        or exists (
          select 1 from public.counters c
          where c.business_id = p_business_id and c.operator_id = auth.uid()
        )
        or exists (
          select 1 from public.operator_assignments oa
          where oa.operator_id = auth.uid() and oa.business_id = p_business_id
        )
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Auth User Signup Trigger & Column-Level Privilege Guards
-- ----------------------------------------------------------------------------

-- Automatically create a customer profile when a user registers via Supabase Auth.
-- Role is ALWAYS forced to 'customer' on self-signup to prevent privilege escalation.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\D', '', 'g'),
    'customer'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
        phone = case when public.profiles.phone = '' then excluded.phone else public.profiles.phone end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Prevent non-admin users from modifying their own role or counter/business assignments
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow service role / SQL editor (auth.uid() is null) or verified admin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role
       or new.assigned_business_id is distinct from old.assigned_business_id
       or new.assigned_counter_id is distinct from old.assigned_counter_id then
      raise exception 'Forbidden: only verified administrators can change user roles or counter assignments.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_privileged on public.profiles;
create trigger trg_guard_profile_privileged
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- Restrict assigned operators on counters to operational fields only (status, pause_reason, avg_duration_min)
create or replace function public.guard_counter_operator_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.id is distinct from old.id
       or new.business_id is distinct from old.business_id
       or new.number is distinct from old.number
       or new.name is distinct from old.name
       or new.category_ids is distinct from old.category_ids
       or new.operator_id is distinct from old.operator_id
       or new.max_capacity is distinct from old.max_capacity
       or new.open_time is distinct from old.open_time
       or new.close_time is distinct from old.close_time then
      raise exception 'Forbidden: operators may only update counter status, pause reason, or average duration.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_counter_operator_update on public.counters;
create trigger trg_guard_counter_operator_update
  before update on public.counters
  for each row execute function public.guard_counter_operator_update();

-- Prevent customers from forging privileged token statuses or immutable audit/operator fields
create or replace function public.guard_queue_token_customer_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and not public.is_admin()
     and not public.is_operator_for_counter(old.counter_id)
     and not public.is_operator_for_business(old.business_id) then
    if old.status in ('Completed', 'No-show', 'Serving') then
      raise exception 'Forbidden: finalized or active serving tokens cannot be modified by customers.';
    end if;

    if new.status not in ('Booked', 'Waiting', 'Approaching', 'Cancelled') then
      raise exception 'Forbidden: customers cannot transition a token to status %.', new.status;
    end if;

    if new.customer_id is distinct from old.customer_id
       or new.token_number is distinct from old.token_number
       or new.business_id is distinct from old.business_id
       or new.category_id is distinct from old.category_id
       or new.priority_type is distinct from old.priority_type
       or new.priority_approved_by is distinct from old.priority_approved_by
       or new.called_at is distinct from old.called_at
       or new.arrived_at is distinct from old.arrived_at
       or new.serving_started_at is distinct from old.serving_started_at
       or new.completed_at is distinct from old.completed_at
       or new.no_show_at is distinct from old.no_show_at
       or new.restored_at is distinct from old.restored_at
       or new.restored_by is distinct from old.restored_by
       or new.restore_reason is distinct from old.restore_reason
       or new.actual_service_duration_min is distinct from old.actual_service_duration_min then
      raise exception 'Forbidden: customers cannot modify operator-managed token fields.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_queue_token_customer_mutation on public.queue_tokens;
create trigger trg_guard_queue_token_customer_mutation
  before update on public.queue_tokens
  for each row execute function public.guard_queue_token_customer_mutation();

-- ----------------------------------------------------------------------------
-- 3. Enable Row Level Security on ALL 13 Operational Tables
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.operator_assignments enable row level security;
alter table public.businesses enable row level security;
alter table public.announcements enable row level security;
alter table public.service_categories enable row level security;
alter table public.counters enable row level security;
alter table public.token_sequences enable row level security;
alter table public.queue_tokens enable row level security;
alter table public.queue_status_history enable row level security;
alter table public.no_show_history enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.app_settings enable row level security;

-- ----------------------------------------------------------------------------
-- 4. RLS Policies
-- ----------------------------------------------------------------------------

-- PROFILES
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (
    id = auth.uid() or public.is_admin()
  );

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
  for update using (
    id = auth.uid() or public.is_admin()
  )
  with check (
    id = auth.uid() or public.is_admin()
  );

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (
    id = auth.uid() and role = 'customer'
  );

-- OPERATOR ASSIGNMENTS
drop policy if exists "operator_assignments_select" on public.operator_assignments;
create policy "operator_assignments_select" on public.operator_assignments
  for select using (
    operator_id = auth.uid() or public.is_admin()
  );

drop policy if exists "operator_assignments_admin_write" on public.operator_assignments;
create policy "operator_assignments_admin_write" on public.operator_assignments
  for all using (public.is_admin()) with check (public.is_admin());

-- BUSINESSES (Public directory readable; only verified admins can mutate)
drop policy if exists "businesses_public_select" on public.businesses;
create policy "businesses_public_select" on public.businesses
  for select using (true);

drop policy if exists "businesses_admin_write" on public.businesses;
create policy "businesses_admin_write" on public.businesses
  for all using (public.is_admin()) with check (public.is_admin());

-- ANNOUNCEMENTS (Public readable; only verified admins can write)
drop policy if exists "announcements_public_select" on public.announcements;
create policy "announcements_public_select" on public.announcements
  for select using (true);

drop policy if exists "announcements_admin_write" on public.announcements;
create policy "announcements_admin_write" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- SERVICE CATEGORIES (Public readable; only verified admins can write)
drop policy if exists "service_categories_public_select" on public.service_categories;
create policy "service_categories_public_select" on public.service_categories
  for select using (true);

drop policy if exists "service_categories_admin_write" on public.service_categories;
create policy "service_categories_admin_write" on public.service_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- COUNTERS (Public readable; admins full write; assigned operators can update status/pause_reason/avg_duration_min)
drop policy if exists "counters_public_select" on public.counters;
create policy "counters_public_select" on public.counters
  for select using (true);

drop policy if exists "counters_admin_all" on public.counters;
create policy "counters_admin_all" on public.counters
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "counters_operator_update_assigned" on public.counters;
create policy "counters_operator_update_assigned" on public.counters
  for update using (public.is_operator_for_counter(id))
  with check (public.is_operator_for_counter(id));

-- TOKEN SEQUENCES (Managed strictly via SECURITY DEFINER RPC next_token_number)
drop policy if exists "token_sequences_admin_only" on public.token_sequences;
create policy "token_sequences_admin_only" on public.token_sequences
  for all using (public.is_admin()) with check (public.is_admin());

-- QUEUE TOKENS
-- Customers: read/create/update ONLY their own tokens (with trigger guard on privileged fields).
-- Operators: read/update ONLY tokens belonging to their assigned counter(s) or business(es).
-- Admins: full read/write access.
drop policy if exists "queue_tokens_select_scoped" on public.queue_tokens;
create policy "queue_tokens_select_scoped" on public.queue_tokens
  for select using (
    customer_id = auth.uid()
    or public.is_admin()
    or public.is_operator_for_counter(counter_id)
    or public.is_operator_for_business(business_id)
  );

drop policy if exists "queue_tokens_customer_insert" on public.queue_tokens;
create policy "queue_tokens_customer_insert" on public.queue_tokens
  for insert with check (
    (
      auth.uid() is not null
      and customer_id = auth.uid()
      and status in ('Booked', 'Waiting', 'Approaching')
    )
    or public.is_admin()
  );

drop policy if exists "queue_tokens_update_scoped" on public.queue_tokens;
create policy "queue_tokens_update_scoped" on public.queue_tokens
  for update using (
    customer_id = auth.uid()
    or public.is_admin()
    or public.is_operator_for_counter(counter_id)
    or public.is_operator_for_business(business_id)
  )
  with check (
    customer_id = auth.uid()
    or public.is_admin()
    or public.is_operator_for_counter(counter_id)
    or public.is_operator_for_business(business_id)
  );

drop policy if exists "queue_tokens_admin_delete" on public.queue_tokens;
create policy "queue_tokens_admin_delete" on public.queue_tokens
  for delete using (public.is_admin());

-- QUEUE STATUS HISTORY (Public read of anonymous duration/analytics metrics; scoped writes)
drop policy if exists "queue_status_history_select" on public.queue_status_history;
create policy "queue_status_history_select" on public.queue_status_history
  for select using (true);

drop policy if exists "queue_status_history_write" on public.queue_status_history;
create policy "queue_status_history_write" on public.queue_status_history
  for insert with check (
    public.is_admin()
    or public.is_operator_for_counter(counter_id)
    or public.is_operator_for_business(business_id)
    or exists (
      select 1 from public.queue_tokens qt
      where qt.id = token_id and qt.customer_id = auth.uid()
    )
  );

drop policy if exists "queue_status_history_admin_manage" on public.queue_status_history;
create policy "queue_status_history_admin_manage" on public.queue_status_history
  for delete using (
    public.is_admin()
    or (
      outcome = 'No-show'
      and (
        public.is_operator_for_counter(counter_id)
        or public.is_operator_for_business(business_id)
      )
    )
  );

-- NO-SHOW HISTORY
drop policy if exists "no_show_history_select" on public.no_show_history;
create policy "no_show_history_select" on public.no_show_history
  for select using (
    customer_id = auth.uid()
    or public.is_admin()
    or public.is_operator_for_counter(counter_id)
    or public.is_operator_for_business(business_id)
  );

drop policy if exists "no_show_history_insert" on public.no_show_history;
create policy "no_show_history_insert" on public.no_show_history
  for insert with check (
    public.is_admin()
    or public.is_operator_for_counter(counter_id)
    or public.is_operator_for_business(business_id)
  );

drop policy if exists "no_show_history_admin_update" on public.no_show_history;
create policy "no_show_history_admin_update" on public.no_show_history
  for update using (public.is_admin()) with check (public.is_admin());

-- NOTIFICATIONS
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_insert_authorized" on public.notifications;
create policy "notifications_insert_authorized" on public.notifications
  for insert with check (
    user_id = auth.uid()
    or public.is_admin()
    or (
      token_id is not null and exists (
        select 1 from public.queue_tokens qt
        where qt.id = token_id
          and qt.customer_id = user_id
          and (
            public.is_operator_for_counter(qt.counter_id)
            or public.is_operator_for_business(qt.business_id)
          )
      )
    )
  );

-- AUDIT LOGS (Append-only; readable by admins only; caller identity verified on insert)
drop policy if exists "audit_logs_admin_select" on public.audit_logs;
create policy "audit_logs_admin_select" on public.audit_logs
  for select using (public.is_admin());

drop policy if exists "audit_logs_authenticated_insert" on public.audit_logs;
create policy "audit_logs_authenticated_insert" on public.audit_logs
  for insert with check (
    auth.uid() is not null
    and (
      public.is_admin()
      or (actor_id = auth.uid()::text and actor_role = public.current_user_role())
      or (actor_id = 'SYSTEM' and public.current_user_role() = 'operator')
    )
  );

-- APP SETTINGS (Readable by all for policy display/grace timers; writable only by admins)
drop policy if exists "app_settings_public_select" on public.app_settings;
create policy "app_settings_public_select" on public.app_settings
  for select using (true);

drop policy if exists "app_settings_admin_write" on public.app_settings;
create policy "app_settings_admin_write" on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Secure RPCs (Atomic Token Numbering, Privacy-Safe Display & QR Verify)
-- ----------------------------------------------------------------------------

-- Atomic token number generator (prevents duplicate numbers across concurrent devices)
create or replace function public.next_token_number(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_next integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required to generate a queue token.';
  end if;
  v_code := upper(regexp_replace(coalesce(p_code, 'Q'), '[^A-Za-z]', '', 'g'));
  if v_code = '' then
    v_code := 'Q';
  end if;
  v_code := left(v_code, 3);

  insert into public.token_sequences (code, last_number, updated_at)
  values (v_code, 101, now())
  on conflict (code) do update
    set last_number = public.token_sequences.last_number + 1,
        updated_at = now()
  returning last_number into v_next;

  return v_code || '-' || v_next::text;
end;
$$;

-- Privacy-safe public queue snapshot for Live Display, Bhopal Directory wait counts,
-- and counter recommendation engine (NEVER returns customer_id, customer_name, customer_phone, or notes).
create or replace function public.get_public_queue_snapshot()
returns table (
  id text,
  token_number text,
  business_id text,
  category_id text,
  counter_id text,
  booking_type text,
  scheduled_time text,
  status text,
  "position" integer,
  people_ahead integer,
  waiting_ahead integer,
  eta_min integer,
  eta_range_min integer,
  eta_range_max integer,
  eta_avg_service_min integer,
  eta_sample_count integer,
  priority_type text,
  called_at timestamptz,
  arrived_at timestamptz,
  serving_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    qt.id,
    qt.token_number,
    qt.business_id,
    qt.category_id,
    qt.counter_id,
    qt.booking_type,
    qt.scheduled_time,
    qt.status,
    qt.position,
    qt.people_ahead,
    qt.waiting_ahead,
    qt.eta_min,
    qt.eta_range_min,
    qt.eta_range_max,
    qt.eta_avg_service_min,
    qt.eta_sample_count,
    qt.priority_type,
    qt.called_at,
    qt.arrived_at,
    qt.serving_started_at,
    qt.completed_at,
    qt.created_at
  from public.queue_tokens qt
  where qt.status in ('Booked', 'Waiting', 'Approaching', 'Called', 'Arrived', 'Serving', 'Skipped')
     or qt.created_at >= now() - interval '24 hours'
  order by qt.created_at asc;
$$;

-- Privacy-safe QR Token Verification RPC (omits phone, email, customer_name, and personal notes)
drop function if exists public.verify_qr_token(text, text);
create or replace function public.verify_qr_token(p_token_id text default null, p_token_number text default null)
returns table (
  id text,
  token_number text,
  business_id text,
  category_id text,
  counter_id text,
  booking_type text,
  scheduled_time text,
  status text,
  "position" integer,
  people_ahead integer,
  waiting_ahead integer,
  eta_min integer,
  priority_type text,
  called_at timestamptz,
  arrived_at timestamptz,
  serving_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    qt.id,
    qt.token_number,
    qt.business_id,
    qt.category_id,
    qt.counter_id,
    qt.booking_type,
    qt.scheduled_time,
    qt.status,
    qt.position,
    qt.people_ahead,
    qt.waiting_ahead,
    qt.eta_min,
    qt.priority_type,
    qt.called_at,
    qt.arrived_at,
    qt.serving_started_at,
    qt.completed_at,
    qt.created_at
  from public.queue_tokens qt
  where (p_token_id is not null and trim(p_token_id) <> '' and lower(qt.id) = lower(trim(p_token_id)))
     or (p_token_number is not null and trim(p_token_number) <> '' and lower(qt.token_number) = lower(trim(p_token_number)))
  order by qt.created_at desc
  limit 1;
$$;

-- Admin-only RPC to promote/assign an existing Supabase Auth user by email
create or replace function public.admin_assign_operator_by_email(
  p_email text,
  p_role text,
  p_counter_id text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_business_id text;
  v_admin_count integer;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: Administrator role required.';
  end if;

  if p_role not in ('customer', 'operator', 'admin') then
    raise exception 'Invalid role: %', p_role;
  end if;

  select * into v_profile
  from public.profiles
  where lower(email) = lower(trim(p_email))
  limit 1;

  if not found then
    raise exception 'No registered user found with email %. Ask the user to sign up first.', p_email;
  end if;

  -- Safeguard against removing the final remaining administrator
  if v_profile.role = 'admin' and p_role <> 'admin' then
    select count(*) into v_admin_count from public.profiles where role = 'admin';
    if v_admin_count <= 1 then
      raise exception 'Forbidden: cannot demote the last remaining administrator account.';
    end if;
  end if;

  if p_counter_id is not null and trim(p_counter_id) <> '' then
    select business_id into v_business_id from public.counters where id = trim(p_counter_id);
    if not found then
      raise exception 'Counter % not found.', p_counter_id;
    end if;
  else
    v_business_id := null;
  end if;

  -- Clear previous counter operator_id link if reassigning
  update public.counters set operator_id = null where operator_id = v_profile.id;
  delete from public.operator_assignments where operator_id = v_profile.id;

  update public.profiles
  set role = p_role,
      assigned_counter_id = case when p_role = 'operator' then nullif(trim(coalesce(p_counter_id, '')), '') else null end,
      assigned_business_id = case when p_role = 'operator' then v_business_id else null end
  where id = v_profile.id
  returning * into v_profile;

  if p_role = 'operator' and p_counter_id is not null and trim(p_counter_id) <> '' then
    update public.counters set operator_id = v_profile.id where id = trim(p_counter_id);
    insert into public.operator_assignments (operator_id, business_id, counter_id, assigned_by)
    values (v_profile.id, v_business_id, trim(p_counter_id), auth.uid())
    on conflict do nothing;
  end if;

  return v_profile;
end;
$$;

-- Tighten function execution privileges (revoke default PUBLIC execute, grant least privilege)
revoke all on function public.current_user_role() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_operator_for_counter(text) from public;
revoke all on function public.is_operator_for_business(text) from public;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.guard_profile_privileged_columns() from public, anon, authenticated;
revoke all on function public.guard_counter_operator_update() from public, anon, authenticated;
revoke all on function public.guard_queue_token_customer_mutation() from public, anon, authenticated;
revoke all on function public.get_public_queue_snapshot() from public;
revoke all on function public.verify_qr_token(text, text) from public;
revoke all on function public.next_token_number(text) from public;
revoke all on function public.admin_assign_operator_by_email(text, text, text) from public;

grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_operator_for_counter(text) to anon, authenticated;
grant execute on function public.is_operator_for_business(text) to anon, authenticated;
grant execute on function public.get_public_queue_snapshot() to anon, authenticated;
grant execute on function public.verify_qr_token(text, text) to anon, authenticated;
grant execute on function public.next_token_number(text) to authenticated;
grant execute on function public.admin_assign_operator_by_email(text, text, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 6. Enable Supabase Realtime on Live Operational Tables
-- ----------------------------------------------------------------------------

do $$
declare
  tbl text;
  realtime_tables text[] := array[
    'queue_tokens',
    'counters',
    'businesses',
    'announcements',
    'notifications',
    'service_categories',
    'app_settings'
  ];
begin
  foreach tbl in array realtime_tables loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
    end if;
  end loop;
end $$;
