# Architecture

## Overview

NearbyNow uses a feature-oriented Next.js App Router architecture with shared repository and service layers.

## Main Folders

- `src/app`: route-level pages, layouts, route handlers, and app shell.
- `src/components`: shared UI and layout components.
- `src/features`: domain-specific UI, actions, schemas, types, and helpers.
- `src/repositories`: reusable Supabase query helpers.
- `src/services`: business logic that coordinates repositories and domain rules.
- `src/lib`: infrastructure helpers such as Supabase clients, storage, and formatters.
- `src/types`: generated/shared database types.
- `supabase/migrations`: database schema migrations.

## Current Pattern

Route pages should stay thin:

1. Create a Supabase server client.
2. Read auth/session if needed.
3. Call repository helpers for data.
4. Render feature components.

Repositories should own Supabase query details:

- selected columns
- joins
- filtering
- ordering
- mapping to typed read models

Feature components should receive typed props and avoid querying data directly.

Server Actions should handle mutations:

- validate user/auth
- validate input
- call service/repository logic
- revalidate affected paths
- redirect or return an action result

## Current Strong Areas

- Buyer product, cart, and order pages use typed repository helpers.
- Product card receives a typed `ProductCardProduct`.
- Product, cart, and order read models exist under feature folders.
- Supabase server/client setup is centralized.
- Product create/update/delete uses a service layer.

## Current Weak Areas

- Seller pages still need typed repository refactors.
- Checkout stock decrement should become atomic at the database level.
- Full repo lint still has older issues outside the cleaned buyer path.
- Tests are not yet added.
- `middleware.ts` should eventually move to `proxy.ts` for Next.js 16.

## Preferred Style Going Forward

- Prefer typed repositories over raw Supabase queries in pages.
- Prefer service functions for business rules.
- Prefer `ActionResult` style returns for Server Actions.
- Avoid `any`.
- Keep migrations timestamped with `YYYYMMDDHHMMSS`.
- Keep pages readable and boring.
