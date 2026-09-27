-- supabase/add-category-filter.sql
--
-- Run this ONCE in the Supabase SQL Editor to add the translation key
-- for the new "Category" filter section in the sidebar. Safe to run
-- even if you've already edited texts via the admin panel — this only
-- ADDS the key if it's missing, never overwrites existing text.

update site_data
set value = jsonb_set(
  jsonb_set(
    value,
    '{en,filter_category}',
    to_jsonb(coalesce(value->'en'->>'filter_category', 'Category')),
    true
  ),
  '{ru,filter_category}',
  to_jsonb(coalesce(value->'ru'->>'filter_category', 'Категория')),
  true
)
where key = 'i18n';

-- Give every existing product an empty "category" field if it doesn't
-- already have one — not strictly required (the site treats a missing
-- category the same as an empty one), but keeps the data shape
-- consistent so every product looks the same in the admin table.
update site_data
set value = (
  select jsonb_agg(
    case when elem ? 'category' then elem else elem || jsonb_build_object('category', '') end
  )
  from jsonb_array_elements(value) as elem
)
where key = 'products';
