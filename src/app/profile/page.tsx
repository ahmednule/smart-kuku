"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Card, CardBody, Divider } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <h1 className="text-3xl font-bold text-emerald-900">My Profile</h1>
        </div>

        {/* Profile Card */}
        <Card className="bg-white shadow-md">
          <CardBody className="gap-6 p-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold text-2xl">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-emerald-900">
                  {user?.name || "No name set"}
                </h2>
                <p className="text-emerald-700">{user?.role || "No role"}</p>
              </div>
            </div>

            <Divider />

            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-emerald-800">
                  Email
                </label>
                <p className="text-emerald-700 mt-1">{user?.email || "N/A"}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-emerald-800">
                  Role
                </label>
                <p className="text-emerald-700 mt-1 capitalize">
                  {user?.role?.toLowerCase() || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-emerald-800">
                  Account Status
                </label>
                <p className="text-emerald-700 mt-1">Active</p>
              </div>
            </div>

            <Divider />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                color="default"
                variant="bordered"
                startContent={<FontAwesomeIcon icon={faEdit} />}
                onClick={() => {
                  // TODO: Implement profile edit functionality
                }}
              >
                Edit Profile
              </Button>
              <Button
                color="warning"
                variant="bordered"
                onClick={() => {
                  // TODO: Implement change password functionality
                }}
              >
                Change Password
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Additional Info */}
        <Card className="bg-white shadow-md mt-6">
          <CardBody className="gap-4 p-6">
            <h3 className="text-lg font-semibold text-emerald-900">
              About Your Account
            </h3>
            <p className="text-emerald-700 text-sm leading-relaxed">
              You are logged in as a <strong>{user?.role?.toLowerCase()}</strong>. 
              Your account gives you access to SMARTKUKU features tailored to your role.
              {user?.role === "FARMER" && (
                <> You can access the farmer dashboard, manage your farms, get AI recommendations, 
                and track your poultry operations.</>
              )}
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
