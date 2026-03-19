"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import React, { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";
import { submitFarmOnboarding } from "@/app/farmer/onboarding/actions";
import { initialFarmSetupState } from "@/app/farmer/onboarding/state";

const FarmSetupPrompt = ({ needsFarmSetup }: { needsFarmSetup: boolean }) => {
  const router = useRouter();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isCompleted, setIsCompleted] = useState(false);
  const [formState, formAction] = useActionState(
    submitFarmOnboarding,
    initialFarmSetupState
  );

  useEffect(() => {
    if (!formState.db) return;

    if (formState.db === "success") {
      toast.success("Farm setup saved. Your data has been prepopulated.");
      setIsCompleted(true);
      onClose();
      router.refresh();
      return;
    }

    toast.error(formState.db);
  }, [formState.db, onClose, router]);

  if (!needsFarmSetup || isCompleted) return null;

  return (
    <>
      <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-900/30 p-3">
        <Button
          size="sm"
          className="w-full min-h-10 whitespace-normal break-words bg-emerald-300 text-emerald-900 font-semibold"
          onPress={onOpen}
        >
          Onboarding only
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        size="2xl"
        classNames={{
          backdrop: "bg-emerald-950/70",
        }}
      >
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader>
                <div>
                  <h2 className="text-xl font-bold text-emerald-900">
                    Tell us about your farm
                  </h2>
                  <p className="text-sm text-emerald-700 font-normal">
                    We will use these answers to prepopulate your farmer data.
                  </p>
                </div>
              </ModalHeader>
              <form action={formAction}>
                <ModalBody>
                  <Input
                    label="Farm name"
                    name="farmName"
                    isRequired
                    color="success"
                    isInvalid={!!formState.farmName}
                    errorMessage={formState.farmName}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="County"
                      name="county"
                      isRequired
                      color="success"
                      isInvalid={!!formState.county}
                      errorMessage={formState.county}
                    />
                    <Input
                      label="Sub-county"
                      name="subCounty"
                      color="success"
                      isInvalid={!!formState.subCounty}
                      errorMessage={formState.subCounty}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone number"
                      name="phone"
                      color="success"
                      isInvalid={!!formState.phone}
                      errorMessage={formState.phone}
                    />
                    <Input
                      label="Approximate farm location"
                      name="locationText"
                      color="success"
                      placeholder="e.g. Kitengela"
                      isInvalid={!!formState.locationText}
                      errorMessage={formState.locationText}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-sm text-emerald-800 font-medium">
                      Preferred language
                      <select
                        name="preferredLanguage"
                        defaultValue="en-KE"
                        className="mt-1 block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900"
                      >
                        <option value="en-KE">English</option>
                        <option value="sw-KE">Kiswahili</option>
                      </select>
                      {formState.preferredLanguage && (
                        <span className="mt-1 block text-xs text-rose-600">
                          {formState.preferredLanguage}
                        </span>
                      )}
                    </label>

                    <label className="text-sm text-emerald-800 font-medium">
                      Primary flock type
                      <select
                        name="flockType"
                        defaultValue="BROILER"
                        className="mt-1 block w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900"
                      >
                        <option value="BROILER">Broiler</option>
                        <option value="LAYER">Layer</option>
                        <option value="KIENYEJI">Kienyeji</option>
                      </select>
                      {formState.flockType && (
                        <span className="mt-1 block text-xs text-rose-600">
                          {formState.flockType}
                        </span>
                      )}
                    </label>
                  </div>

                  <Input
                    label="Starting bird count"
                    name="birdCount"
                    type="number"
                    min={1}
                    defaultValue="200"
                    isRequired
                    color="success"
                    isInvalid={!!formState.birdCount}
                    errorMessage={formState.birdCount}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={closeModal}>
                    Close
                  </Button>
                  <SubmitButton>Save setup</SubmitButton>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FarmSetupPrompt;