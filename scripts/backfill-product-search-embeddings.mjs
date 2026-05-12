import { createClient } from "@supabase/supabase-js";

const DEFAULT_EMBEDDING_MODEL = "jina-clip-v2";
const EXPECTED_EMBEDDING_DIMENSIONS = 1024;

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function isNumberArray(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

function normalizeEmbedding(embedding) {
  const magnitude = Math.sqrt(
    embedding.reduce((total, value) => total + value * value, 0),
  );

  return magnitude ? embedding.map((value) => value / magnitude) : null;
}

function toPgVectorLiteral(embedding) {
  return `[${embedding.map((value) => value.toFixed(8)).join(",")}]`;
}

function buildProductSearchText(product) {
  return [
    product.title,
    product.description,
    `price ${product.price}`,
    `INR ${product.price}`,
  ]
    .filter((part) => Boolean(part?.trim()))
    .join("\n");
}

async function generateEmbedding(input) {
  const token = requiredEnv("JINA_API_KEY");
  const model = process.env.JINA_EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;

  const response = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      normalized: true,
      embedding_type: "float",
      input: [input],
    }),
  });

  if (!response.ok) {
    throw new Error(`Jina embedding request failed: ${response.status}`);
  }

  const payload = await response.json();
  const embedding = payload.data?.[0]?.embedding;

  if (!isNumberArray(embedding)) {
    throw new Error("Jina embedding response was not a float vector");
  }

  const normalizedEmbedding = normalizeEmbedding(embedding);

  if (normalizedEmbedding?.length !== EXPECTED_EMBEDDING_DIMENSIONS) {
    throw new Error("Unexpected embedding dimensions");
  }

  return normalizedEmbedding;
}

const supabase = createClient(
  requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
);

const { data: products, error } = await supabase
  .from("products")
  .select("id,title,description,price,image_url")
  .order("created_at", { ascending: false });

if (error) {
  throw error;
}

let updatedCount = 0;

for (const product of products ?? []) {
  const searchEmbedding = await generateEmbedding(buildProductSearchText(product));
  const imageSearchEmbedding = product.image_url
    ? await generateEmbedding({
        url: product.image_url,
      })
    : null;

  const { error: updateError } = await supabase
    .from("products")
    .update({
      search_embedding: toPgVectorLiteral(searchEmbedding),
      image_search_embedding: imageSearchEmbedding
        ? toPgVectorLiteral(imageSearchEmbedding)
        : null,
    })
    .eq("id", product.id);

  if (updateError) {
    throw updateError;
  }

  updatedCount += 1;
  console.log(`Updated ${updatedCount}: ${product.title}`);
}

console.log(`Backfilled ${updatedCount} product search embeddings.`);
