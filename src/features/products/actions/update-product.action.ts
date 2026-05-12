"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/features/actions/action-result";

import {
  getShopBySellerId,
} from "@/repositories/shop.repository";

import {
  productSchema,
} from "@/features/products/schemas/product.schema";
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

export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<ActionResult> {
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

  const { error } = await supabase
    .from("products")
    .update({
      title: parsed.data.title,
      description,
      price: parsed.data.price,
      stock_quantity:
        parsed.data.stockQuantity,
      category_id:
        parsed.data.categoryId,
      ...(primaryImage
        ? {
            image_url: primaryImage.imageUrl,
          }
        : {}),
      ...(searchEmbedding
        ? {
            search_embedding: toPgVectorLiteral(searchEmbedding),
          }
        : {}),
      ...(imageSearchEmbedding
        ? {
            image_search_embedding:
              toPgVectorLiteral(
                imageSearchEmbedding,
              ),
          }
        : {}),
    })
    .eq("id", productId)
    .eq("shop_id", sellerShop.id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (uploadedImages.images.length > 0) {
    const imagesSaved = await replaceProductImages(
      supabase,
      productId,
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
        error: "Product was updated, but product images could not be saved",
      };
    }
  }

  revalidatePath("/seller/products");

  return {
    success: true,
  };
}
