import MobileNav from "@/components/ui/MobileNav";
import { STATIC_PESTS } from "@/lib/resources-data";
import Link from "next/link";
import React from "react";

const AllPestsPage = () => {
  const pests = STATIC_PESTS;
  return (
    <>
      <MobileNav />
      <h1 className="text-3xl font-bold mb-6">Poultry Risk Signals</h1>
      <p>
        This section highlights common poultry threat patterns KukuSmart can
        detect early, including likely triggers, symptoms, and immediate farm
        response priorities. Each item helps farmers recognize warning signs and
        take practical action before losses escalate.
      </p>
      {
        <ul className="grid grid-cols-2 mt-8 text-emerald-600 md:grid-cols-3">
          {pests.map((pest, index) => (
            <li key={pest.id}>
              <Link
                className="hover:text-emerald-700"
                href={`/resources/pests/${pest.slug}`}
              >
                {index + 1}. {pest.name}
              </Link>
            </li>
          ))}
        </ul>
      }
    </>
  );
};

export default AllPestsPage;
