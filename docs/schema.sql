-- Verdict application schema. Run once in the Supabase SQL editor.
--
-- Every table here is written through the service-role key from server-side
-- routes only, so RLS is enabled and left without permissive policies: the
-- service role bypasses RLS, and nothing else should reach these tables at
-- all. If a browser-side client is ever added, policies get written then,
-- deliberately, rather than being left open now by accident.

-- ---------------------------------------------------------------- profiles

create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now()
);

create index if not exists profiles_email_idx on profiles (lower(email));

-- ------------------------------------------------------------- magic links

-- Only the hash is stored. A leaked database should not contain working
-- login links.
create table if not exists auth_tokens (
  id          bigserial primary key,
  token_hash  text not null unique,
  email       text not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists auth_tokens_expiry_idx on auth_tokens (expires_at);

-- --------------------------------------------------------------- usage

create table if not exists usage_daily (
  profile_id  uuid not null references profiles (id) on delete cascade,
  day         date not null,
  count       integer not null default 0,
  primary key (profile_id, day)
);

-- Atomic increment. Doing this in application code would read, add and write
-- as three steps, and two requests arriving together would both read the same
-- number and each write count+1, letting a caller exceed the cap by racing.
create or replace function bump_usage(
  p_profile uuid,
  p_day date,
  p_amount integer
) returns void
language sql
as $$
  insert into usage_daily (profile_id, day, count)
  values (p_profile, p_day, p_amount)
  on conflict (profile_id, day)
  do update set count = usage_daily.count + excluded.count;
$$;

-- --------------------------------------------------------- trial usage

-- Anonymous allowance for the enrichment endpoint, so somebody evaluating the
-- Clay column can see it work on a few rows before paying. Keyed by a peppered
-- hash of the caller's IP: enough to meter, and the raw address is never
-- stored, which keeps the promise the rest of the product makes.
create table if not exists trial_usage (
  ip_hash  text not null,
  day      date not null,
  count    integer not null default 0,
  primary key (ip_hash, day)
);

-- Same atomic-increment reasoning as bump_usage: read-add-write in app code
-- lets two parallel requests each read the same number and both write n+1.
create or replace function bump_trial(
  p_ip text,
  p_day date,
  p_amount integer
) returns void
language sql
as $$
  insert into trial_usage (ip_hash, day, count)
  values (p_ip, p_day, p_amount)
  on conflict (ip_hash, day)
  do update set count = trial_usage.count + excluded.count;
$$;

-- ------------------------------------------------------------- api keys

create table if not exists api_keys (
  id           bigserial primary key,
  profile_id   uuid not null references profiles (id) on delete cascade,
  key_hash     text not null unique,
  label        text,
  last_used_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists api_keys_profile_idx on api_keys (profile_id);

-- ------------------------------------------------------------- customers

-- Written by the Dodo webhook. One row per event rather than one per
-- customer, so the billing history is auditable and a replayed or
-- out-of-order event cannot silently overwrite the current state.
create table if not exists customers (
  id          bigserial primary key,
  email       text not null,
  ref         text,
  event       text not null,
  status      text not null check (status in ('active', 'revoked', 'attention')),
  created_at  timestamptz not null default now()
);

create index if not exists customers_email_idx on customers (lower(email));
create index if not exists customers_ref_idx on customers (ref) where ref is not null;

-- ------------------------------------------------------------------ RLS

alter table profiles    enable row level security;
alter table auth_tokens enable row level security;
alter table usage_daily enable row level security;
alter table api_keys    enable row level security;
alter table trial_usage enable row level security;
alter table customers   enable row level security;

-- Deliberately no policies. The service role bypasses RLS; anything else is
-- denied by default, which is the correct posture for tables only ever
-- touched by trusted server-side code.
