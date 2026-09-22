-- supabase/schema.sql
--
-- Run this once in the Supabase dashboard: your project → SQL Editor →
-- New query → paste this → Run.
--
-- One table holds every editable piece of site content as a JSON blob
-- per row, keyed by name ("products", "slides", "i18n", "filters",
-- "labels") — the admin panel and the live site both read/write these
-- same five rows. Simple key-value-over-Postgres, not a full relational
-- schema, but a table beats git-committed JSON files for something a
-- CMS writes to often, without the git-history/commit-count noise.

create table if not exists site_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security is left OFF here on purpose: this table is only
-- ever touched by our own serverless functions using the service_role
-- key, which bypasses RLS anyway, and the browser never talks to
-- Supabase directly. Nothing else needs access to this table.
