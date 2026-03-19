"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, cn } from "@nextui-org/react";
import { signOut } from "next-auth/react";
import { isLinkActive } from "@/lib/utils";

const FARMER_TOP_NAV_LINKS = [
  { href: "/farmer/dashboard", label: "Dashboard" },
  { href: "/farmer/map", label: "Farm Map" },
  { href: "/farmer/scan-history", label: "Scan History" },
  { href: "/resources", label: "Resources" },
  { href: "/store", label: "Store" },
];

const FarmerTopNav = ({ userName }: { userName: string }) => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 mb-6 rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-emerald-700">
            Signed in as <span className="font-semibold">{userName}</span>
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {FARMER_TOP_NAV_LINKS.map((item) => (
            <Button
              key={item.href}
              as={Link}
              href={item.href}
              size="sm"
              variant="light"
              className={cn("text-emerald-700", {
                "bg-emerald-100 text-emerald-800": isLinkActive({
                  pathname,
                  route: item.href,
                }),
              })}
            >
              {item.label}
            </Button>
          ))}

          <Button
            size="sm"
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
        </nav>
      </div>
    </header>
  );
};

export default FarmerTopNav;
