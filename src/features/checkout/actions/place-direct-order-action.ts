"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { calculateCheckoutPricing } from "@/features/checkout/lib/calculate-checkout-pricing";

export async function placeDirectOrderAction(
  formData: FormData
) {
  const productId = String(formData.get("productId"));

  const quantity = Number(
    formData.get("quantity")
  );

  if (!productId || quantity <= 0) {
    redirect("/");
  }

  const supabase: any =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: product } =
    await supabase
      .from("products")
      .select(`
        id,
        title,
        price,
        stock_quantity,
        is_active
      `)
      .eq("id", productId)
      .single();

  if (!product) {
    redirect("/");
  }

  const pricing =
    calculateCheckoutPricing({
      price: product.price,
      quantity,
    });

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: pricing.total,
      payment_method: "COD",
    })
    .select()
    .single();

  console.log("DIRECT ORDER:", order);

  console.log(
    "DIRECT ORDER ERROR:",
    orderError
  );

  if (!order) {
    redirect("/");
  }

  const {
    error: orderItemError,
  } = await supabase
    .from("order_items")
    .insert({
      order_id: order.id,
      product_id: product.id,
      quantity,
      price: product.price,
    });

  console.log(
    "DIRECT ORDER ITEM ERROR:",
    orderItemError
  );

  await supabase
    .from("products")
    .update({
      stock_quantity:
        product.stock_quantity -
        quantity,
    })
    .eq("id", product.id);

  revalidatePath("/orders");

  redirect("/orders");
}
