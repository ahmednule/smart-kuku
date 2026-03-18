import MobileNav from "@/components/ui/MobileNav";
import SectionHeader from "@/components/ui/SectionHeader";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import React from "react";

const ResourcesPage = () => {
  return (
    <>
      <MobileNav />
      <SectionHeader className="text-left m-0">Poultry Health Guide</SectionHeader>
      <p className="text-emerald-800 mt-5">
        KukuSmart provides a practical guide for common poultry health risks.
        It includes symptoms, likely causes, prevention protocols, and response
        steps so farmers can act quickly and reduce avoidable flock losses.
      </p>
      <Button
        as={Link}
        href="/resources/pests"
        className="!bg-emerald-600 mt-5 text-white"
      >
        Explore Pests
      </Button>
      <Button
        as={Link}
        href="/resources/diseases"
        className="!bg-emerald-600 ml-3 text-white"
      >
        Explore Diseases
      </Button>
    </>
  );
};

export default ResourcesPage;
