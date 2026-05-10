"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

export default function BecomeSellerButton() {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  async function handleBecomeSeller() {
    const response = await fetch("/api/seller/upgrade", {
      method: "POST",
    });

    if (response.ok) {
      startTransition(() => {
        router.refresh();

        window.location.href = "/seller";
      });
    }
  }

  return (
    <button
      onClick={handleBecomeSeller}
      disabled={isPending}
      className="flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
    >
      {isPending ? "Upgrading..." : "Become a Seller"}
    </button>
  );
}
