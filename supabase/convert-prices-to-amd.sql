-- supabase/convert-prices-to-amd.sql
--
-- ⚠️ RUN THIS EXACTLY ONCE. Unlike the other migration files in this
-- folder, this one is NOT safe to re-run — it multiplies every existing
-- price by ~380 (approximate USD→AMD rate) and rounds to the nearest
-- 100. Running it twice would double-convert prices and wildly inflate
-- them. If you're not sure whether you've already run it, open
-- Table Editor → site_data → products and check whether the numbers
-- already look like AMD amounts (five/six digits, e.g. 144400) rather
-- than the old USD-style numbers (two/three digits, e.g. 380).
--
-- Exchange rate used: 1 USD ≈ 380 AMD (approximate market rate as of
-- writing — Armenian law requires domestic prices in AMD; adjust the
-- rate below if you want to use a different one before running this).

-- Products: price is a plain number field.
update site_data
set value = (
  select jsonb_agg(
    elem || jsonb_build_object(
      'price', round((elem->>'price')::numeric * 380 / 100) * 100
    )
  )
  from jsonb_array_elements(value) as elem
)
where key = 'products';

-- Hero slides: price is stored as a string (e.g. "$380") — this strips
-- everything but digits/decimal point, converts, and stores back as a
-- plain digit string (e.g. "144400"), which the site formats and adds
-- the ֏ symbol to automatically when displaying it.
update site_data
set value = (
  select jsonb_agg(
    elem || jsonb_build_object(
      'price', (round(regexp_replace(elem->>'price', '[^0-9.]', '', 'g')::numeric * 380 / 100) * 100)::text
    )
  )
  from jsonb_array_elements(value) as elem
)
where key = 'slides';
