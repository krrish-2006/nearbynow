const DEFAULT_JINA_EMBEDDING_MODEL = "jina-clip-v2";
const EXPECTED_EMBEDDING_DIMENSIONS = 1024;

type JinaInput = string | { url: string };

type JinaEmbeddingResponse = {
  data?: Array<{
    embedding?: unknown;
  }>;
};

function getJinaToken(): string | null {
  return process.env.JINA_API_KEY ?? null;
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

function normalizeEmbedding(embedding: number[]): number[] | null {
  const magnitude = Math.sqrt(
    embedding.reduce((total, value) => total + value * value, 0),
  );

  if (!magnitude) {
    return null;
  }

  return embedding.map((value) => value / magnitude);
}

export function toPgVectorLiteral(embedding: number[]): string {
  return `[${embedding.map((value) => value.toFixed(8)).join(",")}]`;
}

async function generateJinaEmbedding(input: JinaInput): Promise<number[] | null> {
  const token = getJinaToken();

  if (!token) {
    return null;
  }

  const model = process.env.JINA_EMBEDDING_MODEL ?? DEFAULT_JINA_EMBEDDING_MODEL;

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
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = (await response.json()) as JinaEmbeddingResponse;
  const embedding = payload.data?.[0]?.embedding;

  if (!isNumberArray(embedding)) {
    return null;
  }

  const normalizedEmbedding = normalizeEmbedding(embedding);

  if (normalizedEmbedding?.length !== EXPECTED_EMBEDDING_DIMENSIONS) {
    return null;
  }

  return normalizedEmbedding;
}

export async function generateSearchTextEmbedding(
  text: string,
): Promise<number[] | null> {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return null;
  }

  return generateJinaEmbedding(trimmedText.slice(0, 4000));
}

export async function generateProductImageEmbedding(
  imageUrl: string | null,
): Promise<number[] | null> {
  const trimmedUrl = imageUrl?.trim();

  if (!trimmedUrl) {
    return null;
  }

  return generateJinaEmbedding({
    url: trimmedUrl,
  });
}
