"use client";

import { useFormStatus } from "react-dom";

import { placeDirectOrderAction } from "@/features/checkout/actions/place-direct-order-action";

import Button from "@/components/ui/button";

interface BuyNowCheckoutFormProps {
  productId: string;
  quantity: number;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
    >
      {pending ? "Placing Order..." : "Place Order"}
    </Button>
  );
}

export default function BuyNowCheckoutForm({
  productId,
  quantity,
}: BuyNowCheckoutFormProps) {
  return (
    <form action={placeDirectOrderAction}>
      <input
        type="hidden"
        name="productId"
        value={productId}
      />

      <input
        type="hidden"
        name="quantity"
        value={quantity}
      />

      <SubmitButton />
    </form>
  );
}
