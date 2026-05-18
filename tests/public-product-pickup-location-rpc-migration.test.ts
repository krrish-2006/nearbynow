import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260518120000_add_public_product_pickup_location_rpc.sql",
  ),
  "utf8",
);

test("public product pickup RPC exposes only map fields for active product pages", () => {
  assert.match(
    migration,
    /create function public\.get_public_product_pickup_location/i,
  );
  assert.match(migration, /returns table \(\s*address text,/i);
  assert.match(migration, /latitude numeric/i);
  assert.match(migration, /longitude numeric/i);
  assert.match(migration, /where products\.id = p_product_id/i);
  assert.match(migration, /coalesce\(products\.is_active, true\) = true/i);
  assert.doesNotMatch(migration, /pickup_window/i);
  assert.doesNotMatch(migration, /pickup_instructions/i);
});

test("public product pickup RPC is executable but table read policy stays private", () => {
  assert.match(
    migration,
    /grant execute on function public\.get_public_product_pickup_location\(uuid\)\s*to anon, authenticated/i,
  );
  assert.doesNotMatch(migration, /create policy .*public.*shop_pickup_locations/i);
  assert.doesNotMatch(migration, /for select\s+to anon/i);
});
