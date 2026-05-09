"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PortalSwitcher() {
  const pathname = usePathname();

  const isBuyerPortal = pathname.startsWith("/buyer");

  const isSellerPortal = pathname.startsWith("/seller");

  return (
    <div className="inline-flex rounded-xl border border-neutral-300 bg-white p-1">
      <Link
        href="/buyer"
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          isBuyerPortal
            ? "bg-black text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        Buyer Portal
      </Link>

      <Link
        href="/seller"
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          isSellerPortal
            ? "bg-black text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        Seller Portal
      </Link>
    </div>
  );
}
