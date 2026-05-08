import { getCurrentProfile } from "../services/user.service";

export async function isBuyer() {
  const profile = await getCurrentProfile();

  return profile?.role === "buyer";
}

export async function isSeller() {
  const profile = await getCurrentProfile();

  return profile?.role === "seller";
}

export async function isAdmin() {
  const profile = await getCurrentProfile();

  return profile?.role === "admin";
}
