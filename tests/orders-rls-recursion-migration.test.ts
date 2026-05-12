import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260512090000_fix_orders_select_rls_recursion.sql",
  ),
  "utf8",
);

test("seller orders select policy is removed to avoid orders/order_items recursion", () => {
  assert.match(
    migration,
    /drop policy if exists "Sellers can view orders containing own shop products"/i,
  );
  assert.match(migration, /on public\.orders/i);
  assert.doesNotMatch(migration, /create policy "Sellers can view orders/i);
  assert.match(migration, /SECURITY DEFINER RPCs/i);
});
