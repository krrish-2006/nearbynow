drop policy if exists "Sellers can view orders containing own shop products"
on public.orders;

comment on table public.orders is
'Buyer-owned orders. Sellers read their own order item data through SECURITY DEFINER RPCs to avoid recursive orders/order_items RLS policies.';
