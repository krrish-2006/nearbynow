"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/features/actions/action-result";

import {
  createProductService,
} from "@/services/product.service";

import {
  productSchema,
} from "@/features/products/schemas/product.schema";

import {
  getShopBySellerId,
} from "@/repositories/shop.repository";
import {
  buildProductSearchText,
} from "@/features/search/utils/product-search-text";
import {
  generateProductImageEmbedding,
  generateSearchTextEmbedding,
  toPgVectorLiteral,
} from "@/lib/ai/jina-embeddings";
import {
  uploadModeratedProductImages,
} from "@/features/products/services/product-image-upload.service";
import {
  replaceProductImages,
} from "@/repositories/product.repository";

export async function createProductAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    stockQuantity: formData.get("stockQuantity"),
    categoryId: formData.get("categoryId"),
    image: formData
      .getAll("image")
      .filter((image): image is File => image instanceof File && image.size > 0),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Invalid form data",
    };
  }

  const sellerShop = await getShopBySellerId(
    supabase,
    user.id
  );

  if (!sellerShop) {
    return {
      success: false,
      error: "Seller shop not found",
    };
  }

  const imageFiles =
    Array.isArray(parsed.data.image)
      ? (parsed.data.image as File[])
      : [];

  const uploadedImages = await uploadModeratedProductImages(
    supabase,
    imageFiles,
    user.id,
  );

  if (!uploadedImages.success) {
    return {
      success: false,
      error: uploadedImages.error,
    };
  }

  const primaryImage = uploadedImages.images[0];
  const description =
    parsed.data.description.trim() || null;

  const searchEmbedding = await generateSearchTextEmbedding(
    buildProductSearchText({
      title: parsed.data.title,
      description,
      price: parsed.data.price,
    }),
  );

  const imageSearchEmbedding =
    await generateProductImageEmbedding(primaryImage?.imageUrl ?? null);

  const result =
    await createProductService(
      supabase,
      {
        shop_id: sellerShop.id,
        title: parsed.data.title,
        description,
        price: parsed.data.price,
        stock_quantity:
          parsed.data.stockQuantity,
        category_id:
          parsed.data.categoryId,
        image_url: primaryImage?.imageUrl ?? null,
        search_embedding: searchEmbedding
          ? toPgVectorLiteral(searchEmbedding)
          : null,
        image_search_embedding:
          imageSearchEmbedding
            ? toPgVectorLiteral(
                imageSearchEmbedding,
              )
            : null,
      }
    );

  if (!result.success) {
    return result;
  }

  if (uploadedImages.images.length > 0 && result.data) {
    const imagesSaved = await replaceProductImages(
      supabase,
      result.data.id,
      uploadedImages.images.map((image) => ({
        image_url: image.imageUrl,
        storage_path: image.storagePath,
        position: image.position,
        is_primary: image.isPrimary,
      })),
    );

    if (!imagesSaved) {
      return {
        success: false,
        error: "Product was created, but product images could not be saved",
      };
    }
  }

  revalidatePath("/seller/products");

  return result;
}
