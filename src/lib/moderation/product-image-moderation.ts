const DEFAULT_NSFW_MODEL = "Falconsai/nsfw_image_detection";
const NSFW_REJECT_THRESHOLD = 0.7;

type ModerationLabel = {
  label?: unknown;
  score?: unknown;
};

export type ProductImageModerationResult =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      error: string;
    };

function getHuggingFaceToken(): string | null {
  return (
    process.env.HUGGINGFACE_API_KEY ??
    process.env.HF_TOKEN ??
    null
  );
}

export function getNsfwScore(labels: unknown): number | null {
  if (!Array.isArray(labels)) {
    return null;
  }

  const nsfwLabel = labels
    .filter((label): label is ModerationLabel => {
      return typeof label === "object" && label !== null;
    })
    .find((label) => {
      return String(label.label ?? "").toLowerCase() === "nsfw";
    });

  return typeof nsfwLabel?.score === "number" &&
    Number.isFinite(nsfwLabel.score)
    ? nsfwLabel.score
    : null;
}

export function isUnsafeProductImage(labels: unknown): boolean {
  const nsfwScore = getNsfwScore(labels);

  return nsfwScore !== null && nsfwScore >= NSFW_REJECT_THRESHOLD;
}

export async function moderateProductImage(
  file: File,
): Promise<ProductImageModerationResult> {
  const token = getHuggingFaceToken();

  if (!token) {
    return {
      allowed: false,
      error: "Image safety check is not configured",
    };
  }

  const model = process.env.HUGGINGFACE_NSFW_MODEL ?? DEFAULT_NSFW_MODEL;
  const fileBytes = await file.arrayBuffer();

  const response = await fetch(
    `https://router.huggingface.co/hf-inference/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: fileBytes,
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response?.ok) {
    return {
      allowed: false,
      error: "We could not verify this product image. Please try another image.",
    };
  }

  const labels: unknown = await response.json();

  if (isUnsafeProductImage(labels)) {
    return {
      allowed: false,
      error: "This product image is not allowed. Please upload a safe product image.",
    };
  }

  const nsfwScore = getNsfwScore(labels);

  if (nsfwScore === null) {
    return {
      allowed: false,
      error: "We could not verify this product image. Please try another image.",
    };
  }

  return {
    allowed: true,
  };
}
