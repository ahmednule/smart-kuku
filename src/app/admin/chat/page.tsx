import { Card, CardBody } from "@nextui-org/react";

const AdminChatPage = () => {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-emerald-900">Admin Chat</h1>
      <Card className="bg-white shadow-md max-w-3xl">
        <CardBody className="p-6">
          <p className="text-emerald-800">
            Chat moderation and escalation tools will appear here. This page is
            now available so the sidebar link does not lead to a 404.
          </p>
        </CardBody>
      </Card>
    </section>
  );
};

export default AdminChatPage;