import { notFound } from "next/navigation";
import React from "react";
import ResourceContent from "@/components/page/resource-page/ResourceContent";
import { deleteDisease, editDisease } from "@/lib/actions";
import MobileNav from "@/components/ui/MobileNav";
import { ResourceType } from "@/lib/types";
import { STATIC_DISEASES } from "@/lib/resources-data";

const DiseasePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const disease = STATIC_DISEASES.find((item) => item.slug === slug);
  if (!disease) notFound();

  return (
    <>
      <MobileNav />
      <ResourceContent
        deleteResource={deleteDisease}
        type={ResourceType.DISEASE}
        editFn={editDisease}
        resource={disease}
        isAdmin={false}
      />
    </>
  );
};

export default DiseasePage;
