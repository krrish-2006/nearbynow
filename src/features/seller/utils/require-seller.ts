import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/services/user.service";

export async function requireSeller() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "seller") {
    redirect("/buyer");
  }

  return profile;
}
