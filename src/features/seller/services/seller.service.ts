import { createClient } from "@/lib/supabase/server";

export async function upgradeToSeller() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: durgapurCity } = await supabase
    .from("cities")
    .select("id")
    .ilike("name", "durgapur")
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "seller",
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  const { data: existingShop } = await supabase
    .from("shops")
    .select("id")
    .eq("seller_profile_id", user.id)
    .maybeSingle();

  if (!existingShop) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    await supabase.from("shops").insert({
      seller_profile_id: user.id,

      name: profile?.full_name
        ? `${profile.full_name}'s Shop`
        : "NearbyNow Shop",

      city_id: durgapurCity?.id,
    });
  }

  return true;
}
