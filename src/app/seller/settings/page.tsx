import { createClient } from "@/lib/supabase/server";

import { requireSeller } from "@/features/seller/utils/require-seller";

export default async function SellerSettingsPage() {
  const profile = await requireSeller();

  const supabase: any = await createClient();

  const { data: cities } = await supabase
    .from("cities")
    .select("*")
    .order("name");

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("seller_profile_id", profile.id)
    .single();

  async function updateCity(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const cityId = formData.get("city_id") as string;

    await supabase
      .from("shops")
      .update({
        city_id: cityId,
      })
      .eq("seller_profile_id", profile.id);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Seller Settings</h1>

      <div className="mt-8 max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Marketplace City</h2>

          <p className="mt-2 text-neutral-600">
            Choose the city where your shop operates.
          </p>
        </div>

        <form action={updateCity} className="mt-8">
          <label className="block text-sm font-semibold">City</label>

          <select
            name="city_id"
            defaultValue={shop?.city_id || ""}
            className="mt-2 h-12 w-full rounded-2xl border bg-white px-4 text-sm font-medium shadow-sm outline-none transition focus:ring-2 focus:ring-black"
          >
            <option value="">Select City</option>

            {cities?.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-black px-6 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            Save City
          </button>
        </form>
      </div>
    </div>
  );
}
