import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/features/auth/services/user.service";

type NominatimReverseResult = {
  place_id?: number;
  display_name?: string;
  name?: string;
};

function parseCoordinate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export async function GET(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "seller") {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const latitude = parseCoordinate(searchParams.get("lat"));
  const longitude = parseCoordinate(searchParams.get("lon"));

  if (
    latitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude === null ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      {
        error: "Invalid coordinates",
      },
      {
        status: 400,
      },
    );
  }

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
  nominatimUrl.searchParams.set("lat", String(latitude));
  nominatimUrl.searchParams.set("lon", String(longitude));
  nominatimUrl.searchParams.set("format", "jsonv2");
  nominatimUrl.searchParams.set("zoom", "18");
  nominatimUrl.searchParams.set("addressdetails", "1");

  const response = await fetch(nominatimUrl, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NearbyNow/1.0 (https://www.nearbynow.store)",
      Referer: "https://www.nearbynow.store",
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Location lookup failed",
      },
      {
        status: 502,
      },
    );
  }

  const result = (await response.json()) as NominatimReverseResult;
  const displayName = result.display_name ?? "";

  return NextResponse.json({
    result: {
      placeId: result.place_id ? String(result.place_id) : null,
      name: result.name || displayName || "Pinned pickup location",
      displayName,
      latitude,
      longitude,
    },
  });
}
