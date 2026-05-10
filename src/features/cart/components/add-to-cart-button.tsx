"use client";

import { useEffect, useState, useTransition } from "react";

import { toast } from "sonner";

import Button from "@/components/ui/button";

import { createClient } from "@/lib/supabase/client";

import { addToCartAction } from "@/features/cart/actions/add-to-cart.action";

export default function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    async function checkCart() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data }: any = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId);

      setIsInCart(Array.isArray(data) && data.length > 0);
    }

    checkCart();
  }, [productId]);

  async function handleAddToCart() {
    startTransition(async () => {
      const result = await addToCartAction(productId);

      if (result?.success) {
        toast.success("Added to cart");

        setIsInCart(true);
      } else {
        toast.error(result?.error || "Something went wrong");
      }
    });
  }

  return (
    <Button onClick={handleAddToCart} disabled={isPending || isInCart}>
      {isInCart ? "Added to Cart" : isPending ? "Adding..." : "Add to Cart"}
    </Button>
  );
}
