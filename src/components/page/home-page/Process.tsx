import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faUpload } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";

const Process = () => {
  return (
    <section className="pb-10">
      <SectionHeader>Process</SectionHeader>
      <div className="flex flex-wrap md:flex-nowrap gap-8 text-white px-10 lg:px-20">
        <div className="text-center w-full rounded-xl shadow-lg shadow-black/20 bg-gradient-to-b from-emerald-800 to-emerald-700 md:basis-1/3 p-10">
          <FontAwesomeIcon className="text-[4rem]" icon={faCamera} />
          <h3 className="text-2xl mt-8 font-semibold">Capture farm data</h3>
          <p className="mt-4">
            Log flock health, water levels, feed status, egg output, and housing conditions in real time.
          </p>
        </div>
        <div className="text-center w-full rounded-xl shadow-lg shadow-black/20 bg-gradient-to-b from-emerald-800 to-emerald-700 md:basis-1/3 p-10">
          <FontAwesomeIcon className="text-[4rem]" icon={faUpload} />
          <h3 className="text-2xl mt-8 font-semibold">Trigger the agent</h3>
          <p className="mt-4">
            KukuSmart perceives trends, reasons over risk signals, and chooses the single most urgent action.
          </p>
        </div>
        <div className="items-center w-full justify-center text-center rounded-xl shadow-lg shadow-black/20 bg-gradient-to-b from-emerald-800 to-emerald-700 md:basis-1/3 p-10">
          <div className="flex items-center justify-center">
            <Image
              src="/assets/images/scan.svg"
              width={64}
              height={64}
              alt="Scan image icon"
            />
          </div>
          <h3 className="text-2xl mt-8 font-semibold">Act with confidence</h3>
          <p className="mt-4">
            Receive fast, explainable recommendations such as disease alerts, feed and water interventions, and sale timing guidance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Process;
