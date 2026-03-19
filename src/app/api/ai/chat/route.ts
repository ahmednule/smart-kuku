import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.5-flash";

type SupportedLanguage = "sw-KE" | "en-US";

const buildLanguageInstruction = (language: SupportedLanguage) => {
  if (language === "sw-KE") {
    return "Default to Kiswahili (Kenya). Use English only if the farmer asks in English.";
  }

  return "Default to English, but if the farmer asks in Kiswahili, you may answer in Kiswahili.";
};

const getGeminiErrorPayload = (error: unknown) => {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : 500;

  const rawMessage =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";

  if (
    status === 403 &&
    (rawMessage.includes("SERVICE_DISABLED") ||
      rawMessage.includes("Generative Language API has not been used"))
  ) {
    return {
      status: 503,
      message:
        "Gemini is not enabled for this Google Cloud project yet. Enable the Generative Language API, then retry in a few minutes.",
    };
  }

  if (status === 401 || rawMessage.toLowerCase().includes("api key")) {
    return {
      status: 401,
      message: "Invalid GOOGLE_API_KEY configuration for Gemini.",
    };
  }

  if (
    status === 429 ||
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.toLowerCase().includes("quota exceeded")
  ) {
    const retryMatch = rawMessage.match(/retry in\s+([\d.]+)s/i);
    const retryAfterSeconds = retryMatch
      ? Math.max(1, Math.ceil(Number(retryMatch[1])))
      : 15;

    return {
      status: 429,
      message:
        "Gemini quota is exhausted for this project. Check billing/quota in Google AI Studio or Google Cloud and retry shortly.",
      retryAfterSeconds,
    };
  }

  return {
    status: 500,
    message: "Failed to process AI request.",
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message || "").trim();
    const language = (body?.language || "sw-KE") as SupportedLanguage;

    if (!message) {
      return NextResponse.json(
        {
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          message: "Missing server configuration: GOOGLE_API_KEY",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are KukuSmart AI, an autonomous poultry advisor for small and medium poultry farms. Answer with practical, step-by-step guidance for poultry only: broilers, layers, chicks, feed, water, housing, vaccination, biosecurity, mortality reduction, egg production, and sales timing. If a question is outside poultry, briefly say you can only help with poultry farm operations. Keep responses clear and concise. " +
                buildLanguageInstruction(language) +
                "\n\nFarmer question: " +
                message,
            },
          ],
        },
      ],
    });

    const text =
      typeof response?.text === "function" ? response.text() : response?.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          message: "AI response was empty.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ response: text }, { status: 200 });
  } catch (error) {
    console.error("Gemini chat route error:", error);
    const payload = getGeminiErrorPayload(error);
    const response = NextResponse.json(
      {
        message: payload.message,
      },
      { status: payload.status }
    );

    if (
      "retryAfterSeconds" in payload &&
      typeof payload.retryAfterSeconds === "number"
    ) {
      response.headers.set("Retry-After", String(payload.retryAfterSeconds));
    }

    return response;
  }
}
