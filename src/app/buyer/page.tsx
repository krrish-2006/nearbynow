import Image from "next/image";
import Link from "next/link";

import { requireBuyer } from "@/features/auth/utils/protected";

export default async function BuyerPage() {
  const profile = await requireBuyer();

  const profileInitial =
    profile.full_name?.trim().charAt(0).toUpperCase() ||
    profile.email.trim().charAt(0).toUpperCase();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-4xl font-black">Buyer Profile</h1>

      <div className="mt-8 max-w-2xl space-y-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || "Profile"}
              width={80}
              height={80}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-4xl font-semibold text-white">
              {profileInitial}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold">
              {profile.full_name || "NearbyNow Buyer"}
            </h2>

            <p className="text-neutral-600">{profile.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t pt-6">
          <Link
            href="/orders"
            className="inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-semibold transition hover:bg-neutral-100"
          >
            View Orders
          </Link>

          <Link
            href="/cart"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            View Cart
          </Link>
        </div>
      </div>
    </main>
  );
}
