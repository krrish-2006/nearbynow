import { createClient } from "@/lib/supabase/server";

export async function upgradeToSeller() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "seller",
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
