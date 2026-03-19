import { Button, Card, CardBody, Link } from "@nextui-org/react";

const CustomerConsultantsPage = () => {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-900">Consultants</h1>
      <Card className="bg-white shadow-md max-w-3xl">
        <CardBody className="p-6 space-y-4">
          <p className="text-emerald-800">
            Browse and connect with poultry consultants for guidance on flock health,
            feeding, and management decisions.
          </p>
          <Button
            as={Link}
            href="/customer/consultants-chat"
            className="bg-emerald-500 text-white w-fit"
          >
            Open Consultants Chat
          </Button>
        </CardBody>
      </Card>
    </section>
  );
};

export default CustomerConsultantsPage;