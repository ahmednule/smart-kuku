"use client";

import { Button, Card, CardBody, Link } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faMapLocationDot,
  faFeather,
  faHeartPulse,
} from "@fortawesome/free-solid-svg-icons";

interface FarmerDashboardClientProps {
  userName: string;
  totalFarms: number;
  totalFlocks: number;
  totalAlerts: number;
  farms: any[];
}

const FarmerDashboardClient = ({
  userName,
  totalFarms,
  totalFlocks,
  totalAlerts,
  farms,
}: FarmerDashboardClientProps) => {
  return (
    <section className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-emerald-700">
            Manage your poultry farms and get AI-powered insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-md">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">
                    Total Farms
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {totalFarms}
                  </p>
                </div>
                <div className="text-3xl text-emerald-400">
                  <FontAwesomeIcon icon={faMapLocationDot} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-md">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">
                    Total Flocks
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {totalFlocks}
                  </p>
                </div>
                <div className="text-3xl text-emerald-400">
                  <FontAwesomeIcon icon={faFeather} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-md">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">
                    Open Alerts
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {totalAlerts}
                  </p>
                </div>
                <div className="text-3xl text-red-400">
                  <FontAwesomeIcon icon={faHeartPulse} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white shadow-md">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-semibold">
                    AI Assistance
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">24/7</p>
                </div>
                <div className="text-3xl text-blue-400">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              as={Link}
              href="/farmer/map"
              className="bg-emerald-500 text-white hover:bg-emerald-600 py-6"
              fullWidth
            >
              View Farm Map
            </Button>
            <Button
              as={Link}
              href="/farmer/scan-history"
              className="bg-blue-500 text-white hover:bg-blue-600 py-6"
              fullWidth
            >
              Scan History
            </Button>
            <Button
              as={Link}
              href="/farmer/resources"
              className="bg-yellow-500 text-white hover:bg-yellow-600 py-6"
              fullWidth
            >
              Learning Resources
            </Button>
          </div>
        </div>

        {/* Farms Section */}
        {totalFarms > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">
              Your Farms
            </h2>
            <div className="space-y-4">
              {farms.map((farm: any) => (
                <Card key={farm.id} className="bg-emerald-50">
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-emerald-900">
                          {farm.name}
                        </p>
                        <p className="text-sm text-emerald-700">
                          {farm.flocks.length} flock
                          {farm.flocks.length !== 1 ? "s" : ""} • {farm.alerts.length} active alert
                          {farm.alerts.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button
                        as={Link}
                        href={`/farmer/map?farm=${farm.id}`}
                        size="sm"
                        className="bg-emerald-500 text-white"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-white shadow-md">
            <CardBody className="p-8 text-center">
              <p className="text-emerald-700 mb-4">
                You don't have any farms yet. Create your first farm to get started!
              </p>
              <Button
                as={Link}
                href="/farmer/map"
                className="bg-emerald-500 text-white"
              >
                Create Farm
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Help Section */}
        <Card className="bg-emerald-100 shadow-md mt-8">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              Need help?
            </h3>
            <p className="text-emerald-800 mb-4">
              Use the "Start Talking" button on the homepage to chat with SMARTKUKU AI in real-time.
              Get instant advice on pests, diseases, farm management, and more!
            </p>
            <Button
              as={Link}
              href="/"
              variant="bordered"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              Go to Home
            </Button>
          </CardBody>
        </Card>
    </section>
  );
};

export default FarmerDashboardClient;
