"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { sellerNavigation } from "../utils/navigation";
import PortalSwitcher from "./portal-switcher";

export default function SellerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-neutral-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seller Portal</h2>

        <p className="mt-1 text-sm text-neutral-500">NearbyNow Seller</p>
      </div>

      <div className="mb-8">
        <PortalSwitcher />
      </div>

      <nav className="flex flex-col gap-2">
        {sellerNavigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
