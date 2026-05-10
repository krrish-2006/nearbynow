import Image from "next/image";

import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    image_url?: string | null;
    shops?: {
      name?: string;
    } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="400px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            No Image
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        {product.shops?.name && (
          <p className="text-sm text-neutral-500">{product.shops.name}</p>
        )}

        <h3 className="line-clamp-2 min-h-[52px] text-lg font-bold leading-snug">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <p className="text-2xl font-black">₹ {product.price}</p>

          <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
            Nearby
          </span>
        </div>
      </div>
    </Link>
  );
}
