import SectionHeader from "@/components/ui/SectionHeader";
import Link from "next/link";

const FarmerResourcesPage = () => {
  return (
    <>
      <SectionHeader className="text-left m-0">Poultry Health Guide</SectionHeader>
      <p className="text-emerald-800 mt-5">
        KukuSmart provides a practical guide for common poultry health risks.
        It includes symptoms, likely causes, prevention protocols, and response
        steps so farmers can act quickly and reduce avoidable flock losses.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/resources/pests"
          className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
        >
          Explore Pests
        </Link>
        <Link
          href="/resources/diseases"
          className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
        >
          Explore Diseases
        </Link>
      </div>
    </>
  );
};

export default FarmerResourcesPage;