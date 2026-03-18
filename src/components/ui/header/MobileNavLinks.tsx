import { isLinkActive } from "@/lib/utils";
import { cn, NavbarMenu } from "@nextui-org/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const MobileNavLinks = () => {
  const pathname = usePathname();
  return (
    <NavbarMenu>
      <Link
        className={cn("text-black", {
          "text-emerald-500": isLinkActive({ route: "/", pathname }),
        })}
        href="/"
      >
        Home
      </Link>
      <Link
        className={cn("text-black", {
          "text-emerald-500": isLinkActive({ route: "/resources", pathname }),
        })}
        href="/resources"
      >
        Resources
      </Link>
      <Link
        className={cn("text-black", {
          "text-emerald-500": isLinkActive({ route: "/store", pathname }),
        })}
        href="/store"
      >
        Store
      </Link>
      <Link
        className={cn("text-black", {
          "text-emerald-500": isLinkActive({ route: "/contact", pathname }),
        })}
        href="/contact"
      >
        Contact
      </Link>
    </NavbarMenu>
  );
};

export default MobileNavLinks;
