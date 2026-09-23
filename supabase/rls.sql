-- supabase/rls.sql
--
-- Run this ONCE in the Supabase SQL Editor, AFTER schema.sql and seed.sql
-- have already been run. This is what makes it safe for the site to read
-- straight from Supabase using the public anon/publishable key: it turns
-- on Row Level Security and grants read-only access to everyone, while
-- writes remain blocked for that key (only the server-side service_role
-- key — used in api/admin/* — can write, since it always bypasses RLS
-- regardless of policies).

alter table site_data enable row level security;

create policy "Public read access"
  on site_data
  for select
  to anon
  using (true);

-- No insert/update/delete policy is created for "anon" on purpose — with
-- RLS on and no such policy, those operations are simply refused for the
-- public key. Only service_role (used server-side only) can write.
