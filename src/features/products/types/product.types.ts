import type { Tables } from "@/types/database";

export type ProductRow = Tables<"products">;

export type ProductShopSummary = {
  name: string;
} | null;

export type ProductCategorySummary = {
  name: string;
} | null;

export type ProductImageSummary = Pick<
  Tables<"product_images">,
  "id" | "image_url" | "storage_path" | "position" | "is_primary"
>;

export type ProductCardProduct = Pick<
  ProductRow,
  | "id"
  | "title"
  | "description"
  | "price"
  | "image_url"
  | "stock_quantity"
> & {
  shops?: ProductShopSummary | ProductShopSummary[];
};

export type MarketplaceProduct = ProductCardProduct & {
  categories?: ProductCategorySummary;
};

export type ProductDetails = ProductRow & {
  shops?: ProductShopSummary;
  categories?: ProductCategorySummary;
  product_images?: ProductImageSummary[];
};

export type ProductFilters = {
  search?: string;
  categoryId?: string;
};
