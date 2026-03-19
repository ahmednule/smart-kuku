"use client";

import React from "react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();

  const hideOnAppShellRoutes = ["/admin", "/supplier", "/customer", "/farmer", "/profile"];
  const shouldHideFooter = hideOnAppShellRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHideFooter) return null;

  return (
    <footer className="h-[7vh] flex items-center justify-center bg-emerald-900">
      <p className="text-emerald-50">&copy; KukuSmart 2026, Built for Hackathon. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
