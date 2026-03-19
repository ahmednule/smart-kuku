import AgrochemicalProducts from "@/components/page/store-page/AgrochemicalProducts";
import LocationDisplay from "@/components/ui/LocationDisplay";
import SectionHeader from "@/components/ui/SectionHeader";
import { LOCAL_PRODUCT_LOCATIONS, LOCAL_STORE_PRODUCTS } from "@/lib/store-data";

const StorePage = async () => {
  const productsWithSupplier = LOCAL_STORE_PRODUCTS;
  const uniqueProductLocations = LOCAL_PRODUCT_LOCATIONS;

  return (
    <main className="min-h-[93vh] pt-20">
      <SectionHeader as="h1" className="m-0">
        Shop Agrochemicals
      </SectionHeader>
      <LocationDisplay />
      <AgrochemicalProducts
        uniqueProductLocations={uniqueProductLocations}
        productsWithSupplier={productsWithSupplier}
      />
    </main>
  );
};

export default StorePage;
