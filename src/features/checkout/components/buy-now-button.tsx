"use client";

import { useRouter } from "next/navigation";

import { useState } from "react";

import Button from "@/components/ui/button";

interface BuyNowButtonProps {
  productId: string;
  stockQuantity: number;
  isActive: boolean;
}

export default function BuyNowButton({
  productId,
  stockQuantity,
  isActive,
}: BuyNowButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const isOutOfStock = stockQuantity <= 0;

  const isDisabled = isOutOfStock || !isActive || isLoading;

  const handleBuyNow = () => {
    setIsLoading(true);

    router.push(`/checkout/direct?productId=${productId}&quantity=1`);
  };

  return (
    <Button type="button" onClick={handleBuyNow} disabled={isDisabled}>
      {isOutOfStock ? "Out of Stock" : isLoading ? "Redirecting..." : "Buy Now"}
    </Button>
  );
}
