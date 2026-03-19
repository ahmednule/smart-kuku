import { auth } from "@/auth";
import { Card, CardBody } from "@nextui-org/react";

const CustomerSettingsPage = async () => {
  const session = await auth();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-900">Settings</h1>
      <Card className="bg-white shadow-md max-w-3xl">
        <CardBody className="p-6 space-y-2">
          <p className="text-emerald-800">Signed in as: {session?.user?.email || "Unknown user"}</p>
          <p className="text-emerald-700">
            More customer settings will be added here. The sidebar link is now active.
          </p>
        </CardBody>
      </Card>
    </section>
  );
};

export default CustomerSettingsPage;