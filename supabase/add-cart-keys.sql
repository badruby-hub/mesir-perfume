-- supabase/add-cart-keys.sql
--
-- Run this ONCE in the Supabase SQL Editor to add the new translation
-- keys needed for the cart quantity / toast-notification feature. Safe
-- to run even if you've already edited texts via the admin panel — this
-- MERGES the new keys into the existing en/ru objects rather than
-- overwriting them (uses jsonb's `||` merge operator).

update site_data
set value = jsonb_set(
  jsonb_set(
    value,
    '{en}',
    (value->'en') || '{
      "go_to_cart": "Go to Cart",
      "toast_added_to_cart": "Added to cart",
      "toast_added_to_favorites": "Added to favorites"
    }'::jsonb
  ),
  '{ru}',
  (value->'ru') || '{
    "go_to_cart": "Перейти в корзину",
    "toast_added_to_cart": "Добавлено в корзину",
    "toast_added_to_favorites": "Добавлено в избранное"
  }'::jsonb
)
where key = 'i18n';
