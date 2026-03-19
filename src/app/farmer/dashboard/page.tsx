import { auth } from "@/auth";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import FarmerDashboardClient from "./client";

const FarmerDashboard = async () => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "FARMER") {
    notFound();
  }

  // Fetch farmer's farms
  const farms = await prisma.farm.findMany({
    where: { farmerId: session.user.id },
    include: {
      flocks: {
        include: {
          alerts: {
            where: { status: "OPEN" },
          },
        },
      },
      alerts: {
        where: { status: "OPEN" },
      },
    },
  });

  const totalFarms = farms.length;
  const totalFlocks = farms.reduce((sum: number, farm: any) => sum + farm.flocks.length, 0);
  const totalAlerts = farms.reduce((sum: number, farm: any) => sum + farm.alerts.length, 0);

  return (
    <FarmerDashboardClient
      userName={session.user.name || "Farmer"}
      totalFarms={totalFarms}
      totalFlocks={totalFlocks}
      totalAlerts={totalAlerts}
      farms={farms}
    />
  );
};

export default FarmerDashboard;
