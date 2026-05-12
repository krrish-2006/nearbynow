insert into public.categories (name, slug)
values ('Others', 'others')
on conflict (slug) do nothing;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text,
  position integer not null default 0 check (position >= 0 and position < 5),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint unique_product_image_position unique (product_id, position)
);

create index if not exists idx_product_images_product_position
on public.product_images(product_id, position);

alter table public.product_images enable row level security;

drop policy if exists "Anyone can view product images"
on public.product_images;

create policy "Anyone can view product images"
on public.product_images
for select
using (true);

drop policy if exists "Seller can create own product images"
on public.product_images;

create policy "Seller can create own product images"
on public.product_images
for insert
to authenticated
with check (
  exists (
    select 1
    from public.products
    join public.shops
      on shops.id = products.shop_id
    where products.id = product_images.product_id
    and shops.seller_profile_id = auth.uid()
  )
);

drop policy if exists "Seller can update own product images"
on public.product_images;

create policy "Seller can update own product images"
on public.product_images
for update
to authenticated
using (
  exists (
    select 1
    from public.products
    join public.shops
      on shops.id = products.shop_id
    where products.id = product_images.product_id
    and shops.seller_profile_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products
    join public.shops
      on shops.id = products.shop_id
    where products.id = product_images.product_id
    and shops.seller_profile_id = auth.uid()
  )
);

drop policy if exists "Seller can delete own product images"
on public.product_images;

create policy "Seller can delete own product images"
on public.product_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.products
    join public.shops
      on shops.id = products.shop_id
    where products.id = product_images.product_id
    and shops.seller_profile_id = auth.uid()
  )
);

insert into public.product_images (
  product_id,
  image_url,
  position,
  is_primary
)
select
  products.id,
  products.image_url,
  0,
  true
from public.products
where products.image_url is not null
and not exists (
  select 1
  from public.product_images
  where product_images.product_id = products.id
);
