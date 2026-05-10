"use server";

import { cookies } from "next/headers";

import { revalidatePath } from "next/cache";

export async function setSelectedCity(
  cityId: string,
) {
  const cookieStore =
    await cookies();

  cookieStore.set(
    "selected_city_id",
    cityId,
    {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    },
  );

  revalidatePath("/");
}
