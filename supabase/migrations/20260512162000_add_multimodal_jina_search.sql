create extension if not exists pg_trgm with schema extensions;

alter table public.products
add column if not exists image_search_embedding extensions.vector(1024);

create or replace function public.search_marketplace_products(
  p_query_embedding text,
  p_category_id uuid default null,
  p_max_price numeric default null,
  p_prefer_cheap boolean default false,
  p_match_count integer default 24
)
returns table (
  id uuid,
  title text,
  description text,
  price numeric,
  image_url text,
  stock_quantity integer,
  shop_name text,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  with scored_products as (
    select
      products.id,
      products.title,
      products.description,
      products.price,
      products.image_url,
      products.stock_quantity,
      products.created_at,
      shops.name as shop_name,
      greatest(
        coalesce(1 - (products.search_embedding <=> p_query_embedding::vector), -1),
        coalesce(1 - (products.image_search_embedding <=> p_query_embedding::vector), -1)
      ) as similarity
    from public.products
    join public.shops
      on shops.id = products.shop_id
    where (
      products.search_embedding is not null
      or products.image_search_embedding is not null
    )
    and products.is_active = true
    and (p_category_id is null or products.category_id = p_category_id)
    and (p_max_price is null or products.price <= p_max_price)
  )
  select
    scored_products.id,
    scored_products.title,
    scored_products.description,
    scored_products.price,
    scored_products.image_url,
    scored_products.stock_quantity,
    scored_products.shop_name,
    scored_products.similarity
  from scored_products
  order by
    case when p_prefer_cheap then scored_products.price end asc,
    scored_products.similarity desc,
    scored_products.created_at desc
  limit least(greatest(p_match_count, 1), 50);
$$;

create or replace function public.search_marketplace_products_fuzzy(
  p_search text,
  p_category_id uuid default null,
  p_max_price numeric default null,
  p_prefer_cheap boolean default false,
  p_match_count integer default 24
)
returns table (
  id uuid,
  title text,
  description text,
  price numeric,
  image_url text,
  stock_quantity integer,
  shop_name text,
  similarity double precision
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  with scored_products as (
    select
      products.id,
      products.title,
      products.description,
      products.price,
      products.image_url,
      products.stock_quantity,
      products.created_at,
      shops.name as shop_name,
      greatest(
        similarity(lower(products.title), lower(p_search)),
        similarity(lower(coalesce(products.description, '')), lower(p_search))
      ) as similarity
    from public.products
    join public.shops
      on shops.id = products.shop_id
    where products.is_active = true
    and (p_category_id is null or products.category_id = p_category_id)
    and (p_max_price is null or products.price <= p_max_price)
  )
  select
    scored_products.id,
    scored_products.title,
    scored_products.description,
    scored_products.price,
    scored_products.image_url,
    scored_products.stock_quantity,
    scored_products.shop_name,
    scored_products.similarity
  from scored_products
  where scored_products.similarity >= 0.18
  or lower(scored_products.title) ilike '%' || lower(p_search) || '%'
  or lower(coalesce(scored_products.description, '')) ilike '%' || lower(p_search) || '%'
  order by
    case when p_prefer_cheap then scored_products.price end asc,
    scored_products.similarity desc,
    scored_products.created_at desc
  limit least(greatest(p_match_count, 1), 50);
$$;

grant execute on function public.search_marketplace_products(
  text,
  uuid,
  numeric,
  boolean,
  integer
) to anon, authenticated;

grant execute on function public.search_marketplace_products_fuzzy(
  text,
  uuid,
  numeric,
  boolean,
  integer
) to anon, authenticated;
