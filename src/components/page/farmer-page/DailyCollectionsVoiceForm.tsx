"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type FlockOption = {
  id: string;
  name: string;
};

type FarmOption = {
  id: string;
  name: string;
  flocks: FlockOption[];
};

type DailyCollectionsVoiceFormProps = {
  farms: FarmOption[];
  action: (formData: FormData) => Promise<void>;
};

type VoiceStepKey = "eggsCollected" | "feedKg" | "waterLiters" | "mortalityCount" | "notes";

type VoiceFieldStep = {
  key: VoiceStepKey;
  prompt: string;
  optional: boolean;
  numeric: boolean;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

const VOICE_STEPS: VoiceFieldStep[] = [
  {
    key: "eggsCollected",
    prompt: "How many eggs did you collect today? Say a number.",
    optional: false,
    numeric: true,
  },
  {
    key: "feedKg",
    prompt: "How many kilograms of feed did you use? Say a number, or say skip.",
    optional: true,
    numeric: true,
  },
  {
    key: "waterLiters",
    prompt: "How many liters of water did you use? Say a number, or say skip.",
    optional: true,
    numeric: true,
  },
  {
    key: "mortalityCount",
    prompt: "How many birds died today? Say a number, or say skip.",
    optional: true,
    numeric: true,
  },
  {
    key: "notes",
    prompt: "Any notes for today? Speak your notes, or say skip.",
    optional: true,
    numeric: false,
  },
];

const parseNumber = (value: string) => {
  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
};

const DailyCollectionsVoiceForm = ({ farms, action }: DailyCollectionsVoiceFormProps) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentStepIndexRef = useRef<number>(0);
  const askCurrentStepRef = useRef<() => void>(() => {});
  const nextVoiceActionRef = useRef<(() => void) | null>(null);
  const expectedStopRef = useRef(false);
  const isVoiceFlowActiveRef = useRef(false);

  const [farmId, setFarmId] = useState<string>(farms[0]?.id ?? "");
  const [flockId, setFlockId] = useState<string>("");
  const [eggsCollected, setEggsCollected] = useState<string>("");
  const [feedKg, setFeedKg] = useState<string>("");
  const [waterLiters, setWaterLiters] = useState<string>("");
  const [mortalityCount, setMortalityCount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [voiceSupported, setVoiceSupported] = useState(true);
  const [isVoiceFlowActive, setIsVoiceFlowActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>("");

  useEffect(() => {
    isVoiceFlowActiveRef.current = isVoiceFlowActive;
  }, [isVoiceFlowActive]);

  const flockOptions = useMemo(() => {
    return farms.find((farm) => farm.id === farmId)?.flocks ?? [];
  }, [farmId, farms]);

  useEffect(() => {
    if (flockOptions.length === 0) {
      setFlockId("");
      return;
    }

    const exists = flockOptions.some((flock) => flock.id === flockId);
    if (!exists) {
      setFlockId("");
    }
  }, [flockOptions, flockId]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const stopListening = useCallback(() => {
    try {
      expectedStopRef.current = true;
      recognitionRef.current?.abort?.();
      recognitionRef.current?.stop?.();
    } catch {
      // Browser speech APIs can throw on stop/abort race.
    }

    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const stopVoiceFlow = useCallback(() => {
    isVoiceFlowActiveRef.current = false;
    stopListening();
    stopSpeaking();
    setIsVoiceFlowActive(false);
    setVoiceStatus("Voice entry stopped.");
  }, [stopListening, stopSpeaking]);

  const writeStepValue = useCallback((key: VoiceStepKey, value: string) => {
    if (key === "eggsCollected") setEggsCollected(value);
    if (key === "feedKg") setFeedKg(value);
    if (key === "waterLiters") setWaterLiters(value);
    if (key === "mortalityCount") setMortalityCount(value);
    if (key === "notes") setNotes(value);
  }, []);

  const speak = useCallback(
    (message: string, onDone?: () => void) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        onDone?.();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "en-KE";
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onDone?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onDone?.();
      };
      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const askCurrentStep = useCallback(() => {
    if (!isVoiceFlowActiveRef.current) return;

    const step = VOICE_STEPS[currentStepIndexRef.current];
    if (!step) {
      isVoiceFlowActiveRef.current = false;
      setIsVoiceFlowActive(false);
      setVoiceStatus("All values captured. Submitting now...");
      speak("Thanks. I have captured your daily collections. Submitting now.", () => {
        formRef.current?.requestSubmit();
      });
      return;
    }

    setVoiceStatus(`Listening for ${step.key}...`);
    speak(step.prompt, () => {
      if (!isVoiceFlowActiveRef.current) return;

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setVoiceSupported(false);
        setVoiceStatus("Voice input is not supported on this browser.");
        setIsVoiceFlowActive(false);
        return;
      }

      const recognition = new SpeechRecognition();
      nextVoiceActionRef.current = null;
      expectedStopRef.current = false;
      recognition.lang = "en-KE";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = String(event?.results?.[0]?.[0]?.transcript || "").trim();
        const normalized = transcript.toLowerCase();

        nextVoiceActionRef.current = () => {
          if (!transcript) {
            setVoiceStatus("I did not catch that. Please try again.");
            askCurrentStepRef.current();
            return;
          }

          const currentStep = VOICE_STEPS[currentStepIndexRef.current];
          const askedField = currentStep?.key;

          if (!askedField) {
            return;
          }

          const wantsSkip = /\b(skip|next|none|no)\b/.test(normalized);

          if (wantsSkip && currentStep.optional) {
            writeStepValue(askedField, "");
            currentStepIndexRef.current += 1;
            askCurrentStepRef.current();
            return;
          }

          if (currentStep.numeric) {
            const numericValue = parseNumber(transcript);
            if (numericValue === null || numericValue < 0) {
              setVoiceStatus("Please say a valid non-negative number.");
              speak("Please say a valid number.", () => {
                askCurrentStepRef.current();
              });
              return;
            }

            writeStepValue(askedField, String(numericValue));
          } else {
            writeStepValue(askedField, transcript);
          }

          currentStepIndexRef.current += 1;
          askCurrentStepRef.current();
        };

        expectedStopRef.current = true;
        recognition.stop();
      };

      recognition.onerror = (event: any) => {
        const errorCode = String(event?.error || "").toLowerCase();

        if (errorCode === "aborted" && expectedStopRef.current) {
          return;
        }

        if (!isVoiceFlowActiveRef.current) {
          return;
        }

        if (errorCode === "no-speech") {
          nextVoiceActionRef.current = () => {
            setVoiceStatus("I did not hear anything. Please speak after the prompt.");
            askCurrentStepRef.current();
          };
          expectedStopRef.current = true;
          recognition.stop();
          return;
        }

        if (errorCode === "not-allowed" || errorCode === "service-not-allowed") {
          setVoiceStatus("Microphone permission denied. Allow microphone access and try again.");
          isVoiceFlowActiveRef.current = false;
          setIsVoiceFlowActive(false);
          return;
        }

        setVoiceStatus("Voice capture failed. Please try again.");
        nextVoiceActionRef.current = () => {
          askCurrentStepRef.current();
        };
        expectedStopRef.current = true;
        recognition.stop();
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;

        const nextAction = nextVoiceActionRef.current;
        nextVoiceActionRef.current = null;
        expectedStopRef.current = false;

        if (nextAction) {
          nextAction();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    });
  }, [speak, writeStepValue]);

  useEffect(() => {
    askCurrentStepRef.current = askCurrentStep;
  }, [askCurrentStep]);

  const startVoiceFlow = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceStatus("Voice input is not supported on this browser.");
      return;
    }

    setVoiceSupported(true);
    isVoiceFlowActiveRef.current = true;
    setIsVoiceFlowActive(true);
    currentStepIndexRef.current = 0;
    setVoiceStatus("Starting voice entry...");

    speak(
      "Voice daily collection started. I will ask for eggs, feed, water, mortality, then notes.",
      () => {
        askCurrentStepRef.current();
      }
    );
  }, [speak]);

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return (
    <form
      ref={formRef}
      action={action}
      className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm space-y-4"
    >
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-sm font-semibold text-emerald-900">Voice assistant</p>
        <p className="mt-1 text-sm text-emerald-800">
          Tap Start Voice Entry and answer each question. Say skip for optional fields.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={startVoiceFlow}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Start Voice Entry
          </button>
          <button
            type="button"
            onClick={stopVoiceFlow}
            className="rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Stop Voice Entry
          </button>
        </div>
        <p className="mt-2 text-xs text-emerald-700">
          {voiceStatus || "Voice assistant is idle."}
          {!voiceSupported ? " Voice input is unsupported on this browser." : ""}
          {isListening ? " Listening..." : ""}
          {isSpeaking ? " Speaking..." : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-emerald-900">
          Farm
          <select
            name="farmId"
            value={farmId}
            onChange={(event) => setFarmId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
          >
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-emerald-900">
          Flock (optional)
          <select
            name="flockId"
            value={flockId}
            onChange={(event) => setFlockId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
          >
            <option value="">All flocks / Not specific</option>
            {flockOptions.map((flock) => (
              <option key={flock.id} value={flock.id}>
                {flock.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-medium text-emerald-900">
          Eggs collected
          <input
            type="number"
            name="eggsCollected"
            min={0}
            required
            value={eggsCollected}
            onChange={(event) => setEggsCollected(event.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
            placeholder="e.g. 320"
          />
        </label>

        <label className="text-sm font-medium text-emerald-900">
          Feed used (kg)
          <input
            type="number"
            step="0.1"
            min={0}
            name="feedKg"
            value={feedKg}
            onChange={(event) => setFeedKg(event.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
            placeholder="e.g. 45"
          />
        </label>

        <label className="text-sm font-medium text-emerald-900">
          Water used (L)
          <input
            type="number"
            step="0.1"
            min={0}
            name="waterLiters"
            value={waterLiters}
            onChange={(event) => setWaterLiters(event.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
            placeholder="e.g. 210"
          />
        </label>

        <label className="text-sm font-medium text-emerald-900">
          Mortality count
          <input
            type="number"
            min={0}
            name="mortalityCount"
            value={mortalityCount}
            onChange={(event) => setMortalityCount(event.target.value)}
            className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
            placeholder="e.g. 2"
          />
        </label>
      </div>

      <label className="text-sm font-medium text-emerald-900 block">
        Notes (optional)
        <textarea
          name="notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-1 w-full rounded-lg border border-emerald-200 px-3 py-2 text-emerald-900"
          placeholder="Any observation for today..."
        />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
      >
        Save daily collection
      </button>
    </form>
  );
};

export default DailyCollectionsVoiceForm;
