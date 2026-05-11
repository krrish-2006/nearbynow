# Next Tasks

## Highest Priority

1. Refactor seller pages to use typed repositories and remove remaining `any`.
2. Move checkout/order creation and stock decrement into an atomic Postgres RPC.
3. Add tests for cart quantity limits, checkout pricing, order creation, and stock decrement.
4. Replace deprecated `middleware.ts` convention with Next.js `proxy.ts`.
5. Audit Supabase RLS policies for buyer/seller permissions.

## Architecture Improvements

1. Add a shared `ActionResult` type for all Server Actions.
2. Standardize repository return shapes and error handling.
3. Move checkout business rules into a dedicated service layer.
4. Add typed seller read models for seller products, seller orders, and settings.
5. Remove duplicated database type files if one is obsolete.

## Product Improvements

1. Add wishlist/favorites.
2. Add product reviews and ratings.
3. Add seller shop public pages.
4. Add order cancellation/status tracking.
5. Add better empty/loading/error states.

## Learning Goals

1. Learn current product-card and marketplace flow deeply.
2. Learn Server Actions through cart/order/product mutations.
3. Learn Supabase RLS through existing policies.
4. Learn PostgreSQL relationships through NearbyNow tables.
5. Learn deployment with Vercel and hosted Supabase.
