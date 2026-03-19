"use client";

import { convertMarkdownToHtml } from "@/lib/utils";
import { faStop, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, cn } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

const ScanResponse = ({
  response,
  isScanSuccess,
  speechLanguage = "en-US",
}: {
  response: string;
  isScanSuccess: boolean;
  speechLanguage?: "sw-KE" | "en-US";
}) => {
  const { pending } = useFormStatus();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const plainResponse = useMemo(
    () =>
      response
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/[#*_`>\-]/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
    [response]
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopReading = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const readOutLoud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    if (!plainResponse) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(plainResponse);
    utterance.lang = speechLanguage;
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {isScanSuccess &&
        (!pending ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-emerald-950">Response</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white"
                  startContent={<FontAwesomeIcon icon={faVolumeHigh} />}
                  onPress={readOutLoud}
                >
                  Read out loud
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  className={cn("text-white", {
                    "bg-rose-600": isSpeaking,
                    "bg-slate-600": !isSpeaking,
                  })}
                  onPress={stopReading}
                >
                  <FontAwesomeIcon icon={faStop} />
                </Button>
              </div>
            </div>
            <div
              className="text-emerald-800 bg-green-50 p-4 rounded-lg"
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(response),
              }}
            />
          </div>
        ) : null)}
    </>
  );
};

export default ScanResponse;
