-- ============================================================
-- 10BOTTLECASH — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Profiles (extends auth.users)
create table if not exists profiles (
  id       uuid primary key references auth.users(id) on delete cascade,
  email    text unique not null,
  name     text not null,
  role     text not null check (role in ('admin', 'supplier', 'client')),
  created_at timestamptz default now()
);

-- 2. Orders
create table if not exists orders (
  id             text primary key,
  order_number   text not null,
  invoice_id     text,
  created_at_ms  bigint,
  supplier_email text not null,
  supplier_name  text not null,
  client_email   text,
  amount         text not null,
  net_amount     text not null,
  status         text not null check (status in ('Completed', 'Processing', 'Unpaid')),
  date_label     text not null,
  inserted_at    timestamptz default now()
);

-- 3. Supplier invite code (single row)
create table if not exists supplier_codes (
  id   integer primary key default 1,
  code text not null
);
insert into supplier_codes (id, code) values (1, 'ABCDEFGHJK')
  on conflict (id) do nothing;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles      enable row level security;
alter table orders        enable row level security;
alter table supplier_codes enable row level security;

-- Profiles: public read (needed for supplier lookup), own insert/update
create policy "profiles_select"  on profiles for select using (true);
create policy "profiles_insert"  on profiles for insert with check (auth.uid() = id);
create policy "profiles_update"  on profiles for update using (auth.uid() = id);
create policy "profiles_delete"  on profiles for delete using (auth.role() = 'authenticated');

-- Orders: anon can insert (payment flow), authenticated can read/update
create policy "orders_select"  on orders for select using (auth.role() = 'authenticated');
create policy "orders_insert"  on orders for insert with check (true);
create policy "orders_update"  on orders for update using (auth.role() = 'authenticated');
create policy "orders_delete"  on orders for delete using (auth.role() = 'authenticated');

-- Supplier codes: public read, authenticated update
create policy "codes_select" on supplier_codes for select using (true);
create policy "codes_update" on supplier_codes for update using (auth.role() = 'authenticated');

-- ============================================================
-- Admin user setup
-- STEP 1: Go to Supabase → Authentication → Users → Add user
--         Enter: support@10bottlevalue.co + your admin password
-- STEP 2: Run the query below (replaces <UUID> with the user's actual UUID from the users list)
-- ============================================================

-- insert into profiles (id, email, name, role)
-- values ('<UUID-FROM-SUPABASE-USERS-PAGE>', 'support@10bottlevalue.co', 'Admin', 'admin')
-- on conflict (id) do update set role = 'admin';

-- ============================================================
-- IMPORTANT: Disable email confirmation
-- Go to: Supabase → Authentication → Settings → Email Auth
-- Turn OFF "Confirm email" so users can login immediately after signup
-- ============================================================
