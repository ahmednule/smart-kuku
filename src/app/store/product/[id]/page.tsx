import React from "react";
import ProductImageAside from "@/components/page/product-page/ProductImageAside";
import ProductDetailsCard from "@/components/page/product-page/ProductDetailsCard";
import AgrochemicalsList from "@/components/page/store-page/AgrochemicalsList";
import { notFound } from "next/navigation";
import { LOCAL_STORE_PRODUCTS } from "@/lib/store-data";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const productData = LOCAL_STORE_PRODUCTS.find((product) => product.id === id);

  if (!productData) {
    notFound();
  }

  const productsWithSupplier = LOCAL_STORE_PRODUCTS.filter(
    (product) =>
      product.supplier.id === productData.supplier.id &&
      product.id !== productData.id &&
      product.country === productData.country &&
      product.city === productData.city
  );

  return (
    <>
      <main className="min-h-[93vh] pt-24">
        <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-8  px-4 md:px-8 lg:px-16 max-w-7xl">
          <ProductImageAside images={productData?.images} />
          <ProductDetailsCard
            productData={productData}
          />
        </div>
        {productsWithSupplier.length > 0 && (
          <section className="mb-10 mx-10 mt-20">
            <h2 className="text-xl mb-10 text-emerald-900">
              More products from{" "}
              <span className="font-bold">{productData?.supplier.name}</span>
            </h2>
            <AgrochemicalsList productsWithSupplier={productsWithSupplier} />
          </section>
        )}
      </main>
    </>
  );
};

export default ProductPage;
