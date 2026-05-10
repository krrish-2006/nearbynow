export interface CheckoutPricingInput {
  price: number;
  quantity: number;
}

export interface CheckoutPricingResult {
  subtotal: number;
  platformFee: number;
  total: number;
}

export function calculateCheckoutPricing({
  price,
  quantity,
}: CheckoutPricingInput): CheckoutPricingResult {
  const subtotal = price * quantity;

  const platformFee = 0;

  const total = subtotal + platformFee;

  return {
    subtotal,
    platformFee,
    total,
  };
}
