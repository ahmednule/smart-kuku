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
import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { useFormState } from "react-dom";
import { scanPestImage, scanDiseaseImage } from "@/lib/actions";
import { ScanStatus } from "@/lib/constants";
import ChipUI from "./ChipUI";
import ScanResponse from "./ScanResponse";
import ScanButton from "./ScanButton";

const ModalUI = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [pestFormState, pestFormAction] = useFormState(scanPestImage, "");
  const [diseaseFormState, diseaseFormAction] = useFormState(
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