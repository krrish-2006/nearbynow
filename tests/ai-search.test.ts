import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  toPgVectorLiteral,
} from "../src/lib/ai/jina-embeddings.ts";
import {
  parseMarketplaceSearchQuery,
} from "../src/features/search/utils/marketplace-query.ts";
import {
  buildProductSearchText,
} from "../src/features/search/utils/product-search-text.ts";
import {
  filterRelevantSemanticResults,
} from "../src/features/search/utils/semantic-results.ts";

const initialMigration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260512143000_add_ai_product_search.sql",
  ),
  "utf8",
);

const supportedModelMigration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260512150000_use_supported_hf_embedding_model.sql",
  ),
  "utf8",
);

const multimodalSearchMigration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260512162000_add_multimodal_jina_search.sql",
  ),
  "utf8",
);

test("parses cheap multilingual price search intent", () => {
  assert.deepEqual(
    parseMarketplaceSearchQuery("bhai 5 kilo chawal sasta wala dikha"),
    {
      cleanedSearch: "bhai 5 kilo chawal sasta wala dikha",
      maxPrice: null,
      preferCheap: true,
    },
  );

  assert.deepEqual(parseMarketplaceSearchQuery("rice under 300"), {
    cleanedSearch: "rice under 300",
    maxPrice: 300,
    preferCheap: false,
  });
});

test("builds product text for embedding without leaking private data", () => {
  assert.equal(
    buildProductSearchText({
      title: "Rice 5kg",
      description: "Affordable grocery rice pack",
      price: 299,
    }),
    "Rice 5kg\nAffordable grocery rice pack\nprice 299\nINR 299",
  );
});

test("formats embeddings for pgvector", () => {
  assert.equal(toPgVectorLiteral([0.123456789, -1]), "[0.12345679,-1.00000000]");
});

test("filters weak semantic matches when one product is clearly best", () => {
  assert.deepEqual(
    filterRelevantSemanticResults([
      {
        title: "iphone",
        similarity: 0.8472,
      },
      {
        title: "Remote Control Car",
        similarity: 0.8051,
      },
    ]),
    [
      {
        title: "iphone",
        similarity: 0.8472,
      },
    ],
  );
});

test("keeps close semantic matches for broader searches", () => {
  assert.deepEqual(
    filterRelevantSemanticResults([
      {
        title: "Rice 5kg",
        similarity: 0.861,
      },
      {
        title: "Rice 10kg",
        similarity: 0.842,
      },
    ]),
    [
      {
        title: "Rice 5kg",
        similarity: 0.861,
      },
      {
        title: "Rice 10kg",
        similarity: 0.842,
      },
    ],
  );
});

test("ai search migration adds pgvector-backed marketplace search", () => {
  assert.match(initialMigration, /create extension if not exists vector/i);
  assert.match(
    supportedModelMigration,
    /add column search_embedding extensions\.vector\(1024\)/i,
  );
  assert.match(
    supportedModelMigration,
    /create or replace function public\.search_marketplace_products/i,
  );
  assert.match(
    supportedModelMigration,
    /products\.search_embedding <=> p_query_embedding::vector/i,
  );
  assert.match(supportedModelMigration, /products\.is_active = true/i);
  assert.match(
    supportedModelMigration,
    /grant execute on function public\.search_marketplace_products/i,
  );
});

test("multimodal search migration uses image embeddings and fuzzy fallback", () => {
  assert.match(
    multimodalSearchMigration,
    /add column if not exists image_search_embedding extensions\.vector\(1024\)/i,
  );
  assert.match(multimodalSearchMigration, /products\.image_search_embedding <=>/i);
  assert.match(
    multimodalSearchMigration,
    /create or replace function public\.search_marketplace_products_fuzzy/i,
  );
  assert.match(multimodalSearchMigration, /create extension if not exists pg_trgm/i);
  assert.match(multimodalSearchMigration, /similarity\(lower\(products\.title\)/i);
});
