import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/types/database";

export type ShopPickupLocation = Tables<"shop_pickup_locations">;

export type PublicProductPickupLocation = Pick<
  ShopPickupLocation,
  "address" | "latitude" | "longitude"
>;

export type ShopPickupLocationInput = Pick<
  Database["public"]["Tables"]["shop_pickup_locations"]["Insert"],
  | "shop_id"
  | "address"
  | "latitude"
  | "longitude"
  | "osm_place_id"
  | "osm_display_name"
  | "pickup_window"
  | "pickup_instructions"
>;

export async function getPickupLocationByShopId(
  supabase: SupabaseClient<Database>,
  shopId: string,
): Promise<ShopPickupLocation | null> {
  const { data, error } = await supabase
    .from("shop_pickup_locations")
    .select("*")
    .eq("shop_id", shopId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export async function getPublicProductPickupLocationByProductId(
  supabase: SupabaseClient<Database>,
  productId: string,
): Promise<PublicProductPickupLocation | null> {
  const { data, error } = await supabase.rpc(
    "get_public_product_pickup_location",
    {
      p_product_id: productId,
    },
  );

  if (error || !data?.[0]) {
    return null;
  }

  return data[0];
}

export async function upsertPickupLocation(
  supabase: SupabaseClient<Database>,
  values: ShopPickupLocationInput,
): Promise<boolean> {
  const { error } = await supabase
    .from("shop_pickup_locations")
    .upsert(
      {
        ...values,
        confirmed_at: new Date().toISOString(),
      },
      {
        onConflict: "shop_id",
      },
    );

  return !error;
}
