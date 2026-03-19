import { auth } from "@/auth";
import FarmerNav from "@/components/page/farmer-page/FarmerNav";
import Aside from "@/components/ui/Aside";
import { Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import React, { PropsWithChildren } from "react";

const layout = async ({ children }: PropsWithChildren) => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== Role.FARMER) notFound();

  const farmCount = await prisma.farm.count({
    where: { farmerId: session.user.id },
  });
  const needsFarmSetup = farmCount === 0;

  return (
    <div className="h-[93vh] flex bg-emerald-50">
      <Aside>
        <FarmerNav needsFarmSetup={needsFarmSetup} />
      </Aside>
      <main className="p-4 pt-16 md:p-6 md:pt-20 lg:p-8 lg:pt-20 lg:w-5/6 h-full w-full overflow-y-auto text-emerald-900">
        {children}
      </main>
    </div>
  );
};

export default layout;
