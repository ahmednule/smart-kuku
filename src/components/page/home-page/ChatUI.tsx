"use client";
// app/components/ChatButton.tsx
import { useState, useCallback, FormEvent, useRef, useEffect } from "react";
import { Button, cn, Image, Input } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faMicrophone,
  faPaperPlane,
  faStop,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { convertMarkdownToHtml } from "@/lib/utils";

type SupportedLanguage = "sw-KE" | "en-US";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>("sw-KE");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakResponse = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      const plainText = text.replace(/[#*_`>\-]/g, " ").trim();
      if (!plainText) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.lang = language;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setInput((prev) => (prev ? `${prev} ${transcript}`.trim() : transcript));
    };

    recognition.onerror = () => {
      setError("Voice capture failed. Try again.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setError("");
    setIsListening(true);
    recognition.start();
  }, [language]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening();
  }, [isListening, startListening, stopListening]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError("");

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    try {
      setIsLoading(true);
      const apiResponse = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          language,
        }),
      });

      const data = await apiResponse.json();
      if (!apiResponse.ok) {
        throw new Error(data?.message || "Failed to get AI response");
      }

      const botMessage = { text: data.response as string, isUser: false };
      setMessages((prev) => [...prev, botMessage]);
      speakResponse(botMessage.text);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className={cn(
          "fixed bottom-5 right-5 bg-emerald-500 text-white z-50 p-2 transition duration-500 rotate-0",
          {
            "rotate-45": isOpen,
          }
        )}
        title="Chat with KukuSmart AI"
        onPress={() => setIsOpen(!isOpen)}
        isIconOnly
        size="lg"
      >
        <FontAwesomeIcon icon={faCommentDots} />
      </Button>
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-80 bg-white p-4 shadow-lg rounded-lg border border-gray-300">
          <div className="mb-3 flex items-center justify-between">
            <label
              htmlFor="chat-language"
              className="text-xs font-medium text-gray-600"
            >
              Language
            </label>
            <select
              id="chat-language"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as SupportedLanguage)
              }
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="sw-KE">Kiswahili (Default)</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div className="h-64 overflow-y-auto mb-2">
            {error && (
              <div className="my-2 p-2 rounded-lg bg-red-500 text-white">
                {error}
              </div>
            )}

            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`my-2 p-2 whitespace-pre-wrap rounded-lg ${
                    message.isUser ? "bg-emerald-500 text-white" : "bg-gray-200"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: convertMarkdownToHtml(message.text),
                  }}
                />
              ))
            ) : (
              <div className=" text-gray-500">No messages yet.</div>
            )}
          </div>
          <form onSubmit={handleSendMessage}>
            <Input
              fullWidth
              placeholder="Ask a question..."
              value={input}
              classNames={{
                inputWrapper: "!pr-0",
              }}
              onValueChange={(value) => setInput(value)}
              endContent={
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    isIconOnly
                    className={cn("text-white", {
                      "bg-rose-600": isListening,
                      "bg-emerald-600": !isListening,
                    })}
                    title={isListening ? "Stop recording" : "Start voice input"}
                    onPress={toggleListening}
                  >
                    <FontAwesomeIcon icon={isListening ? faStop : faMicrophone} />
                  </Button>

                  <Button
                    type="button"
                    isIconOnly
                    isDisabled={!messages.length}
                    className={cn("bg-slate-700 text-white", {
                      "opacity-80": isSpeaking,
                    })}
                    title="Read latest assistant reply"
                    onPress={() => {
                      const latestBotMessage = [...messages]
                        .reverse()
                        .find((message) => !message.isUser);
                      if (latestBotMessage) {
                        speakResponse(latestBotMessage.text);
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faVolumeHigh} />
                  </Button>

                  <Button
                    type="submit"
                    isIconOnly
                    isDisabled={!input.trim()}
                    className="bg-emerald-600 text-white"
                    isLoading={isLoading}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </Button>
                </div>
              }
            />
          </form>
        </div>
      )}
    </>
  );
}
