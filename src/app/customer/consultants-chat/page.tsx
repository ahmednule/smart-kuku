import { Button, Card, CardBody, Link } from "@nextui-org/react";

const CustomerConsultantsChatPage = () => {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-900">Consultants Chat</h1>
      <Card className="bg-white shadow-md max-w-3xl">
        <CardBody className="p-6 space-y-4">
          <p className="text-emerald-800">
            Start a conversation with a consultant to get farm support.
          </p>
          <Button as={Link} href="/contact" className="bg-emerald-500 text-white w-fit">
            Book Consultant Support
          </Button>
        </CardBody>
      </Card>
    </section>
  );
};

export default CustomerConsultantsChatPage;