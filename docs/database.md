# Database

## Core Tables

- `profiles`: user profile and role information.
- `cities`: supported city list.
- `categories`: product categories.
- `shops`: seller shops.
- `products`: shop products.
- `cart_items`: buyer cart items.
- `orders`: buyer orders.
- `order_items`: products inside each order.

## Main Relationships

- `profiles.id` maps to Supabase auth user IDs.
- `shops.seller_profile_id` references `profiles.id`.
- `products.shop_id` references `shops.id`.
- `products.category_id` references `categories.id`.
- `cart_items.user_id` references auth users.
- `cart_items.product_id` references `products.id`.
- `orders.user_id` references auth users.
- `order_items.order_id` references `orders.id`.
- `order_items.product_id` references `products.id`.

## Important RLS Notes

- Products are public-readable.
- Categories are public-readable.
- Shops need public select access so buyer pages can show seller/shop names.
- Sellers should only create/update/delete products for their own shop.
- Buyers should only read/write their own cart and orders.

## Important Migration Notes

Migration filenames must be valid 14-digit timestamp versions:

```txt
YYYYMMDDHHMMSS_name.sql
```

Known renamed migrations:

- `20260509165740_create_orders.sql`
- `20260510095056_phase5_checkout_foundation.sql`
- `20260511080728_allow_public_shop_select.sql`

The public shop select policy was added so product detail and product cards can show shop names to buyers.

## Stock Behavior

- `products.stock_quantity` is the source of truth.
- Product cards show `In stock: X`.
- Product detail pages show `In stock: X`.
- Cart and direct checkout validate quantity against stock.
- Successful orders decrement stock.

## Future Database Work

- Move checkout/order creation and stock decrement into an atomic Postgres RPC.
- Add tests or SQL checks around stock race conditions.
- Audit RLS policies after each new feature.
- Add wishlist/reviews tables when those features are built.
