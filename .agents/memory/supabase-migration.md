---
name: Supabase migration
description: 10BOTTLECASH migrated from localStorage to Supabase Auth + PostgreSQL
---

## What changed
- All user/order data moved from localStorage to Supabase
- Auth: Supabase Auth (email+password, hashed server-side)
- Data: `profiles`, `orders`, `supplier_codes` tables in Supabase PostgreSQL
- Session: Supabase JWT, cached via AuthProvider in React context

## Key files
- `src/lib/supabase.ts` — Supabase client
- `src/lib/auth.ts` — all functions now async (login, logout, getOrders, etc.)
- `src/lib/auth-context.tsx` — AuthProvider + useAuth() hook; wraps entire app
- `src/App.tsx` — wrapped with AuthProvider

## Env vars
Secrets stored as `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Replit.
**Why envPrefix doesn't work:** Vite's envPrefix only loads from .env files. Must use `define` in vite.config.ts to inject process.env into import.meta.env.

**How to apply:** Any new env var for frontend must be added to the `define` block in vite.config.ts:
```ts
define: {
  "import.meta.env.SUPABASE_URL": JSON.stringify(process.env.SUPABASE_URL ?? ""),
}
```

## Supabase project
- Project: 10BottleCash (10BottleValueCo org)
- URL: https://drttplrbtbnljysxyhza.supabase.co
- Admin email: support@10bottlevalue.co
- Schema SQL: `supabase-schema.sql` in repo root

## Admin creation
Admin cannot be created via signup form (no role=admin option).
Must be created via Supabase Auth dashboard + SQL:
```sql
INSERT INTO profiles (id, email, name, role)
SELECT id, email, 'Admin', 'admin' FROM auth.users WHERE email = 'support@10bottlevalue.co';
```

## RLS policies summary
- profiles: public SELECT (supplier lookup), own INSERT, authenticated DELETE
- orders: public INSERT (anon payment flow), authenticated SELECT/UPDATE
- supplier_codes: public SELECT (invite code validation), authenticated UPDATE

## getCurrentUser() pattern
Module-level `_currentUser` cache in auth.ts, set by AuthProvider on login/session restore.
`getCurrentUser()` is sync (reads cache). All DB operations are async.
