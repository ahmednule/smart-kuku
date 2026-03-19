"use client";

import { motion } from "framer-motion";
import React from "react";
import { Button, Link } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { ImagesSlider } from "@/components/ui/ImagesSlider";
import ModalUI from "@/components/ui/ModalUI";
import useHashState from "@/lib/hooks/useHashState";

const Carousel = () => {
  const images = [
    "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=2400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?q=80&w=2400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563132337-f159f484226c?q=80&w=2400&auto=format&fit=crop",
  ];

  // Custom hook to show toast notification when the URL has a hash of user trying to log in with a different role
  useHashState();

  return (
    <section>
      <ImagesSlider
        className="h-[100svh]"
        overlayClassName="bg-gradient-to-br from-emerald-950/90 via-emerald-900/75 to-black/70"
        images={images}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: -80,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="z-50 flex flex-col justify-center items-center px-4"
        >
          <div className="-mt-12 md:mt-0 rounded-3xl border border-emerald-200/20 bg-emerald-950/35 px-5 py-8 md:px-10 md:py-10 backdrop-blur-md shadow-2xl shadow-emerald-950/30">
            <p className="text-center text-xs md:text-sm uppercase tracking-[0.3em] text-emerald-200/90 font-semibold">
              Smart Poultry Intelligence
            </p>
            <h1 className="text-3xl md:text-5xl max-w-4xl mx-auto text-center font-extrabold text-white leading-tight mt-3">
              Run your poultry farm with SMART
              <span className="text-emerald-300">KUKU</span> using fast,
              practical AI guidance.
            </h1>
            <p className="mt-4 text-center text-emerald-100/90 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Diagnose pests and diseases, get farm recommendations, and make
              better decisions from one trusted assistant built for daily farm
              work.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-10">
            <Button
              as={Link}
              href="#process"
              variant="ghost"
              className="md:px-5 md:py-6 rounded-full md:text-lg bg-transparent hover:!bg-emerald-400/20 border-emerald-300/70 border-large text-white"
            >
              See How It Works
            </Button>
            <Button
              startContent={<FontAwesomeIcon icon={faMicrophone} />}
              className="md:px-5 md:py-6 rounded-full md:text-lg bg-emerald-400 text-emerald-950 hover:!bg-emerald-300 font-semibold"
              onPress={() =>
                window.dispatchEvent(new CustomEvent("kukusmart:startTalking"))
              }
            >
              start talking
            </Button>
            <ModalUI />
          </div>
        </motion.div>
      </ImagesSlider>
    </section>
  );
};

export default Carousel;
