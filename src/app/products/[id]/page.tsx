import Image from "next/image";

import { notFound } from "next/navigation";

import Link from "next/link";

import Button from "@/components/ui/button";

import { createClient } from "@/lib/supabase/server";

import BuyNowButton from "@/features/checkout/components/buy-now-button";
import ProductCard from "@/features/products/components/product-card";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase: any = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `
        *,
        shops (
          id,
          name,
          description
        ),
        categories (
          name
        )
      `,
    )
    .eq("id", id)
    .single();

  if (!product) {
    notFound();
  }

  const { data: existingCartItem } = await supabase
    .from("cart_items")
    .select("id")
    .eq("product_id", product.id)
    .limit(1)
    .maybeSingle();

  const { data: relatedProducts } = await supabase
    .from("products")
    .select(
      `
        id,
        title,
        price,
        image_url
      `,
    )
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  return (
    <main className="min-h-screen bg-neutral-100">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
            <div className="relative aspect-square bg-neutral-100">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  sizes="700px"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white">
                  {product.categories?.name}
                </span>

                <span className="rounded-full border bg-white px-4 py-2 text-xs font-semibold">
                  Local Store Product
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  {product.title}
                </h1>

                <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:mt-5 sm:text-lg">
                  {product.description}
                </p>
              </div>

              <div>
                <p className="text-3xl font-black sm:text-5xl">
                  â‚¹ {product.price}
                </p>

                <p className="mt-2 text-sm text-neutral-500">
                  Inclusive of all taxes
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Sold by</p>

                    <h2 className="mt-1 text-xl font-bold">
                      {product.shops?.name}
                    </h2>
                  </div>

                  <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                    Available
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link href="/cart">
                  <Button className="h-14 w-full text-lg font-semibold">
                    {existingCartItem ? "View Cart" : "Add to Cart"}
                  </Button>
                </Link>

                <BuyNowButton
                  productId={product.id}
                  stockQuantity={product.stock_quantity ?? 0}
                  isActive={product.is_active ?? true}
                />
              </div>
            </div>
          </div>
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-3xl font-black">Related Products</h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related: any) => (
  <ProductCard
    key={related.id}
    product={related}
  />
))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
