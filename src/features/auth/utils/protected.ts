import { redirect } from "next/navigation";
import { getCurrentProfile } from "../services/user.service";

export async function requireBuyer() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}
