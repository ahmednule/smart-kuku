import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      throw new Error("Latitude and longitude are required");
    }

    const apiKey = process.env.GOOGLE_MAPS_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "Missing server configuration: GOOGLE_MAPS_KEY" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Geocoding API error: ${errorText}`);
      return NextResponse.json(
        { message: "Failed to fetch location details" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const firstResult = data?.results?.[0];

    if (!firstResult) {
      return NextResponse.json(
        { message: "No location details found for coordinates" },
        { status: 404 }
      );
    }

    const components = firstResult.address_components || [];
    const getComponent = (type: string) =>
      components.find((component: { types: string[] }) =>
        component.types.includes(type)
      );

    const city =
      getComponent("locality")?.long_name ||
      getComponent("administrative_area_level_2")?.long_name ||
      "Unknown city";
    const principalSubdivision =
      getComponent("administrative_area_level_1")?.long_name ||
      "Unknown region";
    const countryName = getComponent("country")?.long_name || "Unknown country";
    const countryCode = getComponent("country")?.short_name || "XX";

    return NextResponse.json(
      {
        latitude: Number(lat),
        longitude: Number(lon),
        lookupSource: "google-geocoding",
        countryName,
        countryCode,
        principalSubdivision,
        city,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Google geolocation API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
