import { requireSeller } from "@/features/seller/utils/require-seller";
import Image from "next/image";

export default async function SellerProfilePage() {
  const profile = await requireSeller();

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Seller Profile
      </h1>

      <div className="mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {profile.avatar_url && (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || "Profile"}
              width={80}
              height={80}
              className="rounded-full"
            />
          )}

          <div>
            <h2 className="text-2xl font-semibold">
              {profile.full_name}
            </h2>

            <p className="text-neutral-600">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="rounded-lg bg-neutral-100 px-4 py-3">
            <span className="font-medium">
              Role:
            </span>{" "}
            {profile.role}
          </div>
        </div>
      </div>
    </div>
  );
}
