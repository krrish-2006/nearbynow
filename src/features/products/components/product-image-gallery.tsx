"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type ProductImageGalleryProps = {
  images: string[];
  productTitle: string;
};

export function ProductImageGallery({
  images,
  productTitle,
}: ProductImageGalleryProps) {
  const uniqueImages = useMemo(
    () => Array.from(new Set(images.filter(Boolean))),
    [images],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);
  const lastImageIndex = Math.max(uniqueImages.length - 1, 0);
  const safeSelectedIndex = Math.min(selectedIndex, lastImageIndex);
  const selectedImage = uniqueImages[safeSelectedIndex] ?? null;

  useEffect(() => {
    const strip = thumbnailStripRef.current;

    if (!strip) {
      return;
    }

    const activeThumbnail = strip.querySelector<HTMLElement>(
      `[data-gallery-index="${safeSelectedIndex}"]`,
    );

    activeThumbnail?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [safeSelectedIndex]);

  function showPreviousImage() {
    setSelectedIndex((currentIndex) =>
      currentIndex <= 0 ? lastImageIndex : currentIndex - 1,
    );
  }

  function showNextImage() {
    setSelectedIndex((currentIndex) =>
      currentIndex >= lastImageIndex ? 0 : currentIndex + 1,
    );
  }

  if (!selectedImage) {
    return (
      <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
        <div className="flex aspect-square items-center justify-center bg-neutral-100 text-neutral-400">
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border bg-white shadow-sm">
      <div className="relative aspect-square bg-neutral-100">
        <Image
          src={selectedImage}
          alt={productTitle}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-cover"
        />

        {uniqueImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Show previous product image"
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-3xl font-bold leading-none text-black shadow-md transition hover:bg-black hover:text-white"
            >
              {"<"}
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label="Show next product image"
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-3xl font-bold leading-none text-black shadow-md transition hover:bg-black hover:text-white"
            >
              {">"}
            </button>
          </>
        )}
      </div>

      {uniqueImages.length > 1 && (
        <div className="border-t bg-white p-4">
          <div
            ref={thumbnailStripRef}
            className="flex snap-x gap-3 overflow-x-auto scroll-smooth pb-2"
            aria-label={`${productTitle} images`}
          >
            {uniqueImages.map((imageUrl, index) => {
              const isSelected = index === safeSelectedIndex;

              return (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Show ${productTitle} image ${index + 1}`}
                  aria-current={isSelected}
                  data-gallery-index={index}
                  className={`relative h-28 w-28 shrink-0 snap-start overflow-hidden rounded-2xl border bg-neutral-100 transition sm:h-32 sm:w-32 ${
                    isSelected
                      ? "border-black ring-2 ring-black"
                      : "border-neutral-200 hover:border-black"
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${productTitle} image ${index + 1}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
