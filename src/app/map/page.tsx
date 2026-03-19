import MapClient from "./MapClient";

const MapPage = () => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_KEY ?? "";

  return <MapClient googleMapsApiKey={googleMapsApiKey} />;
};

export default MapPage;