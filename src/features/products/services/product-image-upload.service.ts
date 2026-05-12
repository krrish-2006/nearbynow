import type { SupabaseClient } from "@supabase/supabase-js";

import { Database } from "@/types/database";
import {
  getProductImageUrl,
  uploadProductImage,
} from "@/lib/storage/product-image";
import {
  moderateProductImage,
} from "@/lib/moderation/product-image-moderation";

export type UploadedProductImage = {
  imageUrl: string;
  storagePath: string;
  position: number;
  isPrimary: boolean;
};

export async function uploadModeratedProductImages(
  supabase: SupabaseClient<Database>,
  files: File[],
  sellerId: string,
): Promise<
  | {
      success: true;
      images: UploadedProductImage[];
    }
  | {
      success: false;
      error: string;
    }
> {
  const images: UploadedProductImage[] = [];

  for (const [index, file] of files.entries()) {
    const moderation = await moderateProductImage(file);

    if (!moderation.allowed) {
      return {
        success: false,
        error: moderation.error,
      };
    }

    const uploaded = await uploadProductImage(
      supabase,
      file,
      sellerId,
    );

    if (uploaded.error || !uploaded.path) {
      return {
        success: false,
        error:
          uploaded.error ??
          "Failed to upload image",
      };
    }

    images.push({
      imageUrl: getProductImageUrl(
        supabase,
        uploaded.path,
      ),
      storagePath: uploaded.path,
      position: index,
      isPrimary: index === 0,
    });
  }

  return {
    success: true,
    images,
  };
}
