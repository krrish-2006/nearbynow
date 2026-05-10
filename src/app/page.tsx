import Link from "next/link";

import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

import ProductCard from "@/features/products/components/product-card";

import SearchBar from "@/components/shared/search-bar";

import CityComingSoon from "@/features/cities/components/city-coming-soon";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;

  const cookieStore = await cookies();

  const selectedCityId = cookieStore.get("selected_city_id")?.value;

  const supabase: any = await createClient();

  const { data: cities } = await supabase.from("cities").select("*");

  const selectedCity = cities?.find((city: any) => city.id === selectedCityId);

  if (selectedCity && selectedCity.name?.trim().toLowerCase() !== "durgapur") {
    return <CityComingSoon cityName={selectedCity.name} />;
  }

  let query = supabase.from("products").select(`
      *,
      shops (
        name
      ),
      categories (
        name
      )
    `);

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  const { data: products } = await query.order("created_at", {
    ascending: false,
  });

  const { data: categories } = await supabase.from("categories").select("*");

  return (
    <main className="min-h-screen bg-neutral-100">
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              NearbyNow
            </h1>

            <p className="mt-3 max-w-2xl text-base text-neutral-600 sm:text-lg">
              Discover products from nearby local shops.
            </p>
          </div>

          <SearchBar />

          <div className="flex flex-wrap gap-3 pb-2">
            <Link
              href="/"
              className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                !params.category
                  ? "bg-black text-white"
                  : "border bg-white hover:bg-neutral-100"
              }`}
            >
              All
            </Link>

            {categories?.map((category: any) => (
              <Link
                key={category.id}
                href={`/?category=${category.id}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                  params.category === category.id
                    ? "bg-black text-white"
                    : "border bg-white hover:bg-neutral-100"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        {!products || products.length === 0 ? (
          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm sm:p-16">
            <h2 className="text-2xl font-bold">No products found</h2>

            <p className="mt-2 text-neutral-500">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
