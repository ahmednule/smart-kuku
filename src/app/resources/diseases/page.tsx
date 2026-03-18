import MobileNav from "@/components/ui/MobileNav";
import prisma from "@/lib/prisma";
import Link from "next/link";
import React from "react";

const AllDiseasesPage = async () => {
  const diseases = await prisma.disease.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return (
    <>
      <MobileNav />
      <h1 className="text-3xl font-bold mb-6">Poultry Disease Intelligence</h1>
      <p>
        This guide summarizes common poultry diseases, key symptom clusters,
        likely causes, and recommended intervention steps. It is designed to
        support faster decisions on treatment escalation, flock isolation, and
        preventive action across smallholder farms.
      </p>
      {
        <ul className="grid grid-cols-2 mt-8 text-emerald-600 md:grid-cols-3">
          {diseases.map((disease, index) => (
            <li key={disease.id}>
              <Link
                className="hover:text-emerald-700"
                href={`/resources/diseases/${disease.slug}`}
              >
                {index + 1}. {disease.name}
              </Link>
            </li>
          ))}
        </ul>
      }
    </>
  );
};

export default AllDiseasesPage;
