"use client";

import { FARMER_ROUTES } from "@/lib/constants";
import { isLinkActive } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, cn, Divider } from "@nextui-org/react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import FarmSetupPrompt from "./FarmSetupPrompt";

const FarmerNav = ({ needsFarmSetup }: { needsFarmSetup: boolean }) => {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col">
      <div>
        <FarmSetupPrompt needsFarmSetup={needsFarmSetup} />
      </div>
      <ul className="space-y-4">
        {FARMER_ROUTES.map((route, index) => (
          <React.Fragment key={route.path}>
            {route.path === "/farmer/resources" && <Divider className="my-2 bg-emerald-600" />}
            <li>
              <Button
                href={route.path}
                as={Link}
                startContent={<FontAwesomeIcon icon={route.icon} />}
                className={cn(
                  "w-full gap-3 !justify-start text-emerald-300 hover:!bg-emerald-200/85 hover:text-emerald-700",
                  {
                    "bg-emerald-200 text-emerald-700": isLinkActive({
                      pathname,
                      route: route.path,
                    }),
                  }
                )}
                variant="light"
              >
                {route.value}
              </Button>
            </li>
          </React.Fragment>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <Divider className="mb-4 bg-emerald-600" />
        <Button
          className="w-full"
          color="danger"
          variant="flat"
          onPress={() =>
            signOut({
              callbackUrl: "/",
            })
          }
        >
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default FarmerNav;
