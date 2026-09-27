-- supabase/add-category-i18n.sql
--
-- Run this ONCE in the Supabase SQL Editor. Does two things:
--
-- 1) Makes sure labels.categoryLabels exists with the en/ru/hy shape
--    (same pattern as countryLabels/availabilityLabels).
-- 2) Migrates whatever category values are already sitting on products
--    (typed in before the "Категории" admin tab existed) into that
--    structure, using the existing text as both the stable key and its
--    starting RU/EN label — so nothing breaks, and you can then go into
--    admin → Категории to give each one a proper English/Armenian name.
--
-- Safe to re-run: only ADDS categories that aren't already in the list,
-- never overwrites a label you've already edited in the admin panel.
--
-- Uses the `||` merge operator throughout rather than jsonb_set with a
-- nested path — jsonb_set requires every path segment except the last
-- to already exist or it silently no-ops, which is exactly what broke
-- the first version of this migration.

-- Step 1: ensure the shape exists.
update site_data
set value = value || jsonb_build_object(
  'categoryLabels',
  coalesce(value->'categoryLabels', '{}'::jsonb) || jsonb_build_object(
    'en', coalesce(value->'categoryLabels'->'en', '{}'::jsonb),
    'ru', coalesce(value->'categoryLabels'->'ru', '{}'::jsonb),
    'hy', coalesce(value->'categoryLabels'->'hy', '{}'::jsonb)
  )
)
where key = 'labels';

-- Step 2: bring in any category text already used on products that
-- isn't yet a known category key.
with existing_keys as (
  select jsonb_object_keys(value->'categoryLabels'->'ru') as k
  from site_data where key = 'labels'
),
used_categories as (
  select distinct (elem->>'category') as cat
  from (select value from site_data where key = 'products') s,
       jsonb_array_elements(s.value) as elem
  where elem->>'category' is not null and elem->>'category' != ''
),
new_categories as (
  select cat from used_categories
  where cat not in (select k from existing_keys)
),
merged as (
  select jsonb_object_agg(cat, cat) as additions
  from new_categories
)
update site_data
set value = value || jsonb_build_object(
  'categoryLabels',
  (value->'categoryLabels') || jsonb_build_object(
    'ru', (value->'categoryLabels'->'ru') || (select coalesce(additions, '{}'::jsonb) from merged),
    'en', (value->'categoryLabels'->'en') || (select coalesce(additions, '{}'::jsonb) from merged)
  )
)
where key = 'labels' and exists (select 1 from new_categories);
