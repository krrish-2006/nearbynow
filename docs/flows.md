# App Flows

## Buyer Marketplace Flow

1. Buyer visits `/`.
2. App reads selected city from `selected_city_id` cookie.
3. If city is not Durgapur, app shows coming soon.
4. App fetches products through `getMarketplaceProducts`.
5. Product cards render product image, shop name, title, description, price, and stock.
6. Search and category filters update query params and refetch products.

## Product Detail Flow

1. Buyer clicks a product card.
2. Next.js opens `/products/[id]`.
3. App fetches product details through `getProductDetails`.
4. App checks whether the current user already has the product in cart.
5. Page shows image, title, category, description, price, stock, shop name, Add to Cart/View Cart, and Buy Now.
6. Related products are fetched through `getRelatedProducts`.

## Cart Flow

1. Buyer clicks Add to Cart.
2. `addToCartAction` validates auth, product availability, and stock.
3. Product is inserted into `cart_items` or existing quantity is incremented.
4. Cart page fetches typed cart items through `getCartItemsByUserId`.
5. Cart quantity controls prevent quantity from exceeding stock.
6. `updateCartQuantityAction` also validates quantity server-side.

## Cart Checkout Flow

1. Buyer clicks Place COD Order in `/cart`.
2. `placeOrderAction` fetches cart items with product stock.
3. Action validates every item is active and in stock.
4. Action creates an order.
5. Action creates order items.
6. Action decrements product stock.
7. Action clears the cart.
8. Action revalidates cart, marketplace, products, product detail pages, and orders.
9. Buyer is redirected to `/orders`.

## Direct Buy Now Flow

1. Buyer clicks Buy Now on product detail.
2. App redirects to `/checkout/direct?productId=...`.
3. Checkout page shows product summary and pricing.
4. Buyer places order.
5. `placeDirectOrderAction` validates auth, product status, and stock.
6. Action creates order and order item.
7. Action decrements product stock.
8. Action revalidates affected pages.
9. Buyer is redirected to `/orders`.

## Seller Product Flow

1. Seller opens `/seller/products`.
2. Seller can add, edit, or delete products.
3. Product form validates with Zod and React Hook Form.
4. Product images upload to Supabase Storage.
5. Product create/update/delete actions revalidate seller product pages.

## Auth/Role Flow

1. User signs in through Supabase Auth.
2. App reads the current user through Supabase server/client helpers.
3. Profile role determines whether seller UI is shown.
4. Seller-only pages redirect when user is not authenticated or not a seller.
