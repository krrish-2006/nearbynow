drop function if exists public.get_public_product_pickup_location(uuid);

create function public.get_public_product_pickup_location(
  p_product_id uuid
)
returns table (
  address text,
  latitude numeric,
  longitude numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    pickup.address,
    pickup.latitude,
    pickup.longitude
  from public.products
  join public.shops
    on shops.id = products.shop_id
  join public.shop_pickup_locations pickup
    on pickup.shop_id = shops.id
  where products.id = p_product_id
  and coalesce(products.is_active, true) = true
  limit 1;
$$;

revoke all on function public.get_public_product_pickup_location(uuid)
from public;

grant execute on function public.get_public_product_pickup_location(uuid)
to anon, authenticated;
