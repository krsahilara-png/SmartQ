# SmartQ — Supabase Backend Setup Guide

SmartQ connects directly to **Supabase** (PostgreSQL + Authentication + Row Level Security + Realtime) via `src/supabase/`. Browser `localStorage` is restricted strictly to non-sensitive UI preferences (theme, display language, voice/browser alert toggles) and never stores queue records or credentials.

---

## 1. Create a Supabase Project

1. Sign in to [supabase.com](https://supabase.com) and create a new project.
2. Open **Project Settings → API** and copy:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon / publishable public key**
3. **Security rule:** Never copy, commit, or expose the `service_role` key in frontend code, `.env` `VITE_*` variables, or version control.

---

## 2. Configure Environment Variables

Copy `.env.example` to `.env` (or configure secrets in your hosting provider / AI Studio Secrets):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Restart the development server (`npm run dev`) after updating `.env` so Vite injects the new values.

---

## 3. Run the SQL Migrations (In Exact Order)

Open **Supabase Dashboard → SQL Editor** and execute each migration file in strict numerical order:

1. **`supabase/migrations/001_smartq_schema.sql`**
   - Creates all **13** tables (`businesses`, `service_categories`, `profiles`, `counters`, `operator_assignments`, `announcements`, `token_sequences`, `queue_tokens`, `queue_status_history`, `no_show_history`, `notifications`, `audit_logs`, `app_settings`).
   - Sets up foreign keys, check constraints, query indexes, `updated_at` triggers, and `REPLICA IDENTITY FULL` on `queue_tokens` for accurate Realtime status-transition alerts.
2. **`supabase/migrations/002_rls_policies_and_rpcs.sql`**
   - Enables Row Level Security (RLS) on all 13 tables.
   - Installs the `on_auth_user_created` signup trigger (every self-registered user always starts with `role = 'customer'`) and column-level mutation guards (`profiles`, `counters`, `queue_tokens`).
   - Creates the 4 `SECURITY DEFINER` RPC functions (`next_token_number`, `get_public_queue_snapshot`, `verify_qr_token`, `admin_assign_operator_by_email`) with least-privilege `EXECUTE` grants.
   - Registers all 7 live operational tables with the `supabase_realtime` publication.
3. **`supabase/migrations/003_seed_bhopal_directory.sql`**
   - Idempotently seeds the `app_settings` singleton (`id = 'default'`), 30 template service categories, and 17 real Bhopal directory establishments (all starting unverified / not yet onboarded with zero fabricated live queue counts).

### Verify Schema & RPC Installation

Run this read-only check in **Supabase SQL Editor** after executing all three migrations:

```sql
-- Expect 13 tables
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'businesses', 'service_categories', 'profiles', 'counters',
    'operator_assignments', 'announcements', 'token_sequences',
    'queue_tokens', 'queue_status_history', 'no_show_history',
    'notifications', 'audit_logs', 'app_settings'
  )
order by table_name;

-- Expect 4 RPC functions
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'next_token_number',
    'get_public_queue_snapshot',
    'verify_qr_token',
    'admin_assign_operator_by_email'
  )
order by routine_name;
```

---

## 4. Safe First-Admin Setup

Self-registration intentionally creates `customer` accounts only, and a database trigger blocks any non-admin client from escalating its own `role`. Follow these steps to safely bootstrap your first administrator:

1. In **Supabase Dashboard → Authentication → Providers**, confirm the **Email** provider is enabled.
   - For local testing without custom SMTP, you may optionally turn off **Confirm email** under **Authentication → Providers → Email**.
2. Open SmartQ and register your administrator account via **Sign In → Customer Registration** using a real email address you control.
   - The `on_auth_user_created` trigger automatically inserts a matching row into `public.profiles` with `role = 'customer'`.
3. In **Supabase Dashboard → SQL Editor** (which runs with privileged database ownership, where `auth.uid()` is `null`), first confirm the exact account exists:

```sql
select id, full_name, email, role, created_at
from public.profiles
where lower(email) = lower('your-admin@example.com');
```

4. Promote **only that single verified account** to `admin` and confirm `RETURNING` outputs exactly one row:

```sql
update public.profiles
set role = 'admin',
    assigned_business_id = null,
    assigned_counter_id = null
where lower(email) = lower('your-admin@example.com')
returning id, email, role;
```

5. Sign out of SmartQ and sign back in. You will now have access to **Admin Console**, where you should perform all ongoing administration safely inside the app:
   - Onboard, verify, and configure counters for Bhopal businesses.
   - Promote or assign **Operators** (and additional admins) via **Admin Console → Operators**, which uses the server-side `admin_assign_operator_by_email` RPC and prevents accidentally removing the last administrator.
   - Never hardcode admin credentials or bypass RLS with `service_role` keys in the client.

---

## 5. Verify Multi-Device Realtime Sync

Migration `002_rls_policies_and_rpcs.sql` automatically adds `queue_tokens`, `counters`, `businesses`, `announcements`, `notifications`, `service_categories`, and `app_settings` to the `supabase_realtime` publication.

To verify cross-device sync:
1. Open SmartQ in two browser windows or devices (e.g., Customer on one device, Operator Console or Live Display on another).
2. Confirm the top utility bar badge shows **Supabase Connected · Realtime Live**.
3. Book a token, call the next customer, pause a counter, or mark a no-show — changes propagate immediately without a page reload.

---

## 6. Security Architecture Summary

- **Anon key only in frontend:** `src/supabase/client.ts` uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; no `service_role` secret exists anywhere in client code.
- **Database-enforced RBAC:** All roles (`customer`, `operator`, `admin`) live in `public.profiles` and are checked inside PostgreSQL RLS policies and `SECURITY DEFINER` functions with fixed `search_path = public`.
- **Privilege-escalation & field-tampering guards:**
  - `on_auth_user_created` always initializes self-registered users as `customer`.
  - `trg_guard_profile_privileged` blocks non-admins from changing `role`, `assigned_business_id`, or `assigned_counter_id`.
  - `trg_guard_counter_operator_update` restricts operators to updating counter operational status, pause reason, and average service duration.
  - `trg_guard_queue_token_customer_mutation` prevents customers from forging privileged token statuses (`Called`, `Serving`, `Completed`, `No-show`) or altering operator-managed fields.
- **Privacy-safe public display & QR verification:** `get_public_queue_snapshot()` and `verify_qr_token()` expose only queue position, counter, status, and ETA metadata — never `customer_id`, `customer_name`, `customer_phone`, or personal notes.
