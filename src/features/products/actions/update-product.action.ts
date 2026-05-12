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
  getProductImagesByProductId,
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
  const existingImageIds = formData
    .getAll("existingImageId")
    .filter((imageId): imageId is string => typeof imageId === "string");

  if (existingImageIds.length + imageFiles.length > 5) {
    return {
      success: false,
      error: "You can upload up to 5 images",
    };
  }

  const currentImages = await getProductImagesByProductId(
    supabase,
    productId,
  );
  const keptImages = existingImageIds
    .map((imageId) => currentImages.find((image) => image.id === imageId))
    .filter((image): image is NonNullable<typeof image> => Boolean(image));

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

  const combinedImages = [
    ...keptImages.map((image) => ({
      image_url: image.image_url,
      storage_path: image.storage_path,
    })),
    ...uploadedImages.images.map((image) => ({
      image_url: image.imageUrl,
      storage_path: image.storagePath,
    })),
  ].map((image, index) => ({
    ...image,
    position: index,
    is_primary: index === 0,
  }));
  const primaryImage = combinedImages[0];
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
    await generateProductImageEmbedding(primaryImage?.image_url ?? null);

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
      image_url: primaryImage?.image_url ?? null,
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
        : primaryImage
          ? {}
          : {
              image_search_embedding: null,
            }),
    })
    .eq("id", productId)
    .eq("shop_id", sellerShop.id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const imagesSaved = await replaceProductImages(
    supabase,
    productId,
    combinedImages,
  );

  if (!imagesSaved) {
    return {
      success: false,
      error: "Product was updated, but product images could not be saved",
    };
  }

  revalidatePath("/seller/products");

  return {
    success: true,
  };
}
