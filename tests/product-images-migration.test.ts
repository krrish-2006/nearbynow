import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260512170000_add_product_images_and_others_category.sql",
  ),
  "utf8",
);

test("product images migration supports up to five ordered images", () => {
  assert.match(migration, /create table if not exists public\.product_images/i);
  assert.match(migration, /position integer not null default 0 check \(position >= 0 and position < 5\)/i);
  assert.match(migration, /constraint unique_product_image_position unique \(product_id, position\)/i);
});

test("product images migration protects seller-owned image writes", () => {
  assert.match(migration, /alter table public\.product_images enable row level security/i);
  assert.match(migration, /create policy "Anyone can view product images"/i);
  assert.match(migration, /create policy "Seller can create own product images"/i);
  assert.match(migration, /create policy "Seller can update own product images"/i);
  assert.match(migration, /create policy "Seller can delete own product images"/i);
  assert.match(migration, /shops\.seller_profile_id = auth\.uid\(\)/i);
});

test("product images migration adds Others category and backfills primary images", () => {
  assert.match(migration, /values \('Others', 'others'\)/i);
  assert.match(migration, /on conflict \(slug\) do nothing/i);
  assert.match(migration, /insert into public\.product_images/i);
  assert.match(migration, /products\.image_url is not null/i);
});
