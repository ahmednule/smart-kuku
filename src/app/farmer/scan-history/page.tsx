import MobileNav from "@/components/ui/MobileNav";
import ModalUI from "@/components/ui/ModalUI";
import SectionHeader from "@/components/ui/SectionHeader";

const FarmerScanHistoryPage = () => {
  return (
    <>
      <MobileNav />
      <SectionHeader as="h1" className="m-0">
        Scan History
      </SectionHeader>
      <p className="mt-4 text-emerald-800 max-w-2xl">
        Your scan history will appear here. Start a new farm check below to
        build your scan timeline without leaving this page.
      </p>
      <div className="mt-6">
        <ModalUI />
      </div>
    </>
  );
};

export default FarmerScanHistoryPage;