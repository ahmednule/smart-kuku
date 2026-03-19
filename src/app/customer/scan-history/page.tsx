import { auth } from "@/auth";
import ActionButton from "@/components/ui/ActionButton";
import CustomerScansTable from "@/components/ui/CustomerScansTable";
import MobileNav from "@/components/ui/MobileNav";
import SectionHeader from "@/components/ui/SectionHeader";
import { deleteAllScans } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import React from "react";

const CustomerScanHistory = async () => {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) notFound();

  const customer = await prisma.customer.findUnique({
    where: {
      id: user.id,
    },
    include: {
      scan: true,
    },
  });

  const resourceNames = customer
    ? await prisma.scan.findMany({
        where: {
          customerId: user.id,
        },
        select: {
          name: true,
        },
        distinct: ["name"],
      })
    : [];

  return (
    <>
      <MobileNav />
      <div className="flex items-center justify-between mb-8">
        <SectionHeader as="h1" className="m-0">
          Scan History
        </SectionHeader>
        {(customer?.scan.length ?? 0) > 1 && (
          <ActionButton
            successMessage="All scans deleted successfully"
            action={deleteAllScans}
          >
            Delete all
          </ActionButton>
        )}
      </div>
      <CustomerScansTable resourceNames={resourceNames} scanData={customer} />
    </>
  );
};

export default CustomerScanHistory;
