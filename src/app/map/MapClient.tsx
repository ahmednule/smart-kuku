"use client";

import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  MarkerF,
} from "@react-google-maps/api";
import React, { useMemo, useState } from "react";

type Shop = {
  name: string;
  lat: number;
  lng: number;
};

const containerClassName = "w-full h-[440px] rounded-xl border border-emerald-200";

const defaultCenter = {
  lat: -1.286389,
  lng: 36.817223,
};

const shops: Shop[] = [
  { name: "Kuku Feed Depot", lat: -1.2812, lng: 36.8228 },
  { name: "Poultry Vet Supplies", lat: -1.2935, lng: 36.8065 },
  { name: "Farm Equipment Hub", lat: -1.3012, lng: 36.8358 },
];

const MapClient = ({ googleMapsApiKey }: { googleMapsApiKey: string }) => {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    }),
    []
  );

  if (!googleMapsApiKey) {
    return (
      <section>
        <h1 className="text-2xl font-bold mb-4 text-emerald-900">
          Find Nearby Poultry Supply Points
        </h1>
        <p className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-700">
          Missing GOOGLE_MAPS_KEY. Add it to your .env and restart the dev server.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4 text-emerald-900">
        Find Nearby Poultry Supply Points
      </h1>
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerClassName={containerClassName}
          center={defaultCenter}
          zoom={12}
          options={mapOptions}
        >
          <MarkerF position={defaultCenter} title="You are here" />

          {shops.map((shop) => (
            <MarkerF
              key={shop.name}
              position={{ lat: shop.lat, lng: shop.lng }}
              onClick={() => setSelectedShop(shop)}
            />
          ))}

          {selectedShop && (
            <InfoWindow
              position={{ lat: selectedShop.lat, lng: selectedShop.lng }}
              onCloseClick={() => setSelectedShop(null)}
            >
              <div className="text-sm font-semibold text-emerald-900">
                {selectedShop.name}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </section>
  );
};

export default MapClient;
