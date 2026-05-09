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
        router.push("/seller");
        router.refresh();
      });
    }
  }

  return (
    <button
      onClick={handleBecomeSeller}
      disabled={isPending}
      className="rounded-xl bg-black px-5 py-3 text-white transition hover:bg-neutral-800 disabled:opacity-50"
    >
      {isPending
        ? "Upgrading..."
        : "Become a Seller"}
    </button>
  );
}
