import MapClient from "@/app/map/MapClient";

const FarmerMapPage = () => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_KEY ?? "";

  return <MapClient googleMapsApiKey={googleMapsApiKey} />;
};

export default FarmerMapPage;