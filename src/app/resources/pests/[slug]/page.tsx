import { notFound } from "next/navigation";
import ResourceContent from "@/components/page/resource-page/ResourceContent";
import { deletePest, editPest } from "@/lib/actions";
import MobileNav from "@/components/ui/MobileNav";
import { ResourceType } from "@/lib/types";
import { STATIC_PESTS } from "@/lib/resources-data";

const PestPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const pest = STATIC_PESTS.find((item) => item.slug === slug);
  if (!pest) notFound();

  return (
    <>
      <MobileNav />
      <ResourceContent
        deleteResource={deletePest}
        type={ResourceType.PEST}
        editFn={editPest}
        resource={pest}
        isAdmin={false}
      />
    </>
  );
};

export default PestPage;
