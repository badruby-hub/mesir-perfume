-- supabase/add-armenian.sql
--
-- Run this ONCE in the Supabase SQL Editor to add Armenian ("hy") as a
-- third language across all existing content. Safe to run even if
-- you've already edited things via the admin panel — every step here
-- only ADDS an empty "hy" field where one doesn't already exist; it
-- never touches your existing English/Russian text.
--
-- After this runs, the site will simply show English wherever the
-- Armenian text is still empty (that's the built-in fallback), so
-- nothing breaks or looks wrong until the actual Armenian words are
-- typed in later — through the admin panel's "Тексты сайта" tab for
-- general text, and through each product/slide's edit form for
-- per-item descriptions and notes.

-- 1) General site texts (buttons, menu, headings, etc.)
update site_data
set value = jsonb_set(value, '{hy}', '{}'::jsonb, true)
where key = 'i18n' and not (value ? 'hy');

-- 2) Country / availability display labels
update site_data
set value = jsonb_set(
  jsonb_set(value, '{countryLabels,hy}', '{}'::jsonb, true),
  '{availabilityLabels,hy}', '{}'::jsonb, true
)
where key = 'labels';

-- 3) Every product's description + notes
update site_data
set value = (
  select jsonb_agg(
    elem
    || jsonb_build_object(
      'description', (elem->'description') || jsonb_build_object('hy', coalesce(elem->'description'->>'hy', '')),
      'notes', (elem->'notes') || jsonb_build_object('hy', coalesce(elem->'notes'->>'hy', ''))
    )
  )
  from jsonb_array_elements(value) as elem
)
where key = 'products';

-- 4) Every hero slide's tagline + description + notes (notes is an
--    array of strings per language, not a single string, hence '[]').
update site_data
set value = (
  select jsonb_agg(
    elem
    || jsonb_build_object(
      'tagline', (elem->'tagline') || jsonb_build_object('hy', coalesce(elem->'tagline'->>'hy', '')),
      'description', (elem->'description') || jsonb_build_object('hy', coalesce(elem->'description'->>'hy', '')),
      'notes', (elem->'notes') || jsonb_build_object('hy', coalesce(elem->'notes'->'hy', '[]'::jsonb))
    )
  )
  from jsonb_array_elements(value) as elem
)
where key = 'slides';
