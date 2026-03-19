"use client";

import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  cn,
  useDisclosure,
} from "@nextui-org/react";
import React, { useActionState, useState } from "react";
import ImageUpload from "./ImageUpload";
import { scanPestImage, scanDiseaseImage } from "@/lib/actions";
import { ScanStatus } from "@/lib/constants";
import ChipUI from "./ChipUI";
import ScanResponse from "./ScanResponse";
import ScanButton from "./ScanButton";

const ModalUI = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pestFormState, pestFormAction] = useActionState(scanPestImage, "");
  const [diseaseFormState, diseaseFormAction] = useActionState(
    scanDiseaseImage,
    ""
  );

  const isPestScanSuccess =
    pestFormState === ScanStatus.SUCCESS
      ? true
      : pestFormState === ScanStatus.ERROR ||
        pestFormState === ScanStatus.IMAGENOTPEST
      ? false
      : pestFormState === ""
      ? false
      : true;

  const isDiseaseScanSuccess =
    diseaseFormState === ScanStatus.ERROR ||
    diseaseFormState === ScanStatus.IMAGENOTDISEASE
      ? false
      : diseaseFormState === ""
      ? false
      : true;

  const [choice, setChoice] = useState<"pest" | "disease">("pest");
  const [speechLanguage, setSpeechLanguage] = useState<"sw-KE" | "en-US">(
    "sw-KE"
  );

  return (
    <>
      <Button
          onPress={() => {
            setChoice("pest");
            onOpen();
          }}
        className="md:px-4 md:py-5 md:text-lg backdrop-blur-sm border bg-emerald-400/20 border-emerald-500/20 text-white rounded-full"
      >
        Start Farm Check
      </Button>
      <Modal
        isDismissable={false}
        size="3xl"
        isOpen={isOpen}
        scrollBehavior="outside"
        classNames={{
          backdrop: "bg-emerald-950 bg-opacity-50",
        }}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <section>
              <ModalHeader as="header">
                <h2 className="text-emerald-900 text-xl font-bold">AI SCAN</h2>
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-3 mb-1">
                  <Button
                    className={cn({
                      "bg-emerald-600 text-white": choice === "pest",
                      "bg-emerald-100 text-emerald-700": choice !== "pest",
                    })}
                    onPress={() => setChoice("pest")}
                  >
                    Pest Scan
                  </Button>
                  <Button
                    className={cn({
                      "bg-emerald-600 text-white": choice === "disease",
                      "bg-emerald-100 text-emerald-700": choice !== "disease",
                    })}
                    onPress={() => setChoice("disease")}
                  >
                    Disease Scan
                  </Button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-700">
                    Voice language:
                  </span>
                  <Button
                    size="sm"
                    className={cn("min-w-24", {
                      "bg-emerald-600 text-white": speechLanguage === "sw-KE",
                      "bg-emerald-100 text-emerald-700":
                        speechLanguage !== "sw-KE",
                    })}
                    onPress={() => setSpeechLanguage("sw-KE")}
                  >
                    Kiswahili
                  </Button>
                  <Button
                    size="sm"
                    className={cn("min-w-20", {
                      "bg-emerald-600 text-white": speechLanguage === "en-US",
                      "bg-emerald-100 text-emerald-700":
                        speechLanguage !== "en-US",
                    })}
                    onPress={() => setSpeechLanguage("en-US")}
                  >
                    English
                  </Button>
                </div>

                {choice === "pest" && (
                  <>
                    <p className="text-emerald-700">
                      Upload one clear image of the pest to start diagnosis.
                    </p>
                    <form action={pestFormAction} className="flex flex-col">
                      <ImageUpload name="image" />
                      <ScanButton />
                      <ChipUI
                        formState={pestFormState}
                        isScanSuccess={isPestScanSuccess}
                      />
                      <ScanResponse
                        isScanSuccess={isPestScanSuccess}
                        response={pestFormState}
                        speechLanguage={speechLanguage}
                      />
                      {pestFormState && (
                        <p className="text-emerald-800 mt-4">
                          Not what you are looking for?{" "}
                          <Link href="/contact">Book a session</Link> with an expert or view our
                          free comprehensive{" "}
                          <Link href="/resources">resource</Link> to learn more.
                        </p>
                      )}
                    </form>
                  </>
                )}
                {choice === "disease" && (
                  <>
                    <p className="text-emerald-700">
                      Upload one clear image of the disease to start diagnosis.
                    </p>
                    <form action={diseaseFormAction} className="flex flex-col">
                      <ImageUpload name="image" />
                      <ScanButton />
                      <ChipUI
                        formState={diseaseFormState}
                        isScanSuccess={isDiseaseScanSuccess}
                      />
                      <ScanResponse
                        isScanSuccess={isDiseaseScanSuccess}
                        response={diseaseFormState}
                        speechLanguage={speechLanguage}
                      />
                      {diseaseFormState && (
                        <p className="text-emerald-800 mt-4">
                          Not what you are looking for?{" "}
                          <Link href="/contact">Book a session</Link> with an expert or view our
                          free comprehensive{" "}
                          <Link href="/resources">resource</Link> to learn more.
                        </p>
                      )}
                    </form>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </section>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalUI;