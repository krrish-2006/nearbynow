import { cookies } from "next/headers";

export async function getSelectedCityId() {
  const cookieStore =
    await cookies();

  return (
    cookieStore.get(
      "selected_city_id",
    )?.value || null
  );
}
