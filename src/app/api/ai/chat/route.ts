import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = "gemini-2.0-flash";

type SupportedLanguage = "sw-KE" | "en-US";

const buildLanguageInstruction = (language: SupportedLanguage) => {
  if (language === "sw-KE") {
    return "Default to Kiswahili (Kenya). Use English only if the farmer asks in English.";
  }

  return "Default to English, but if the farmer asks in Kiswahili, you may answer in Kiswahili.";
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
    return NextResponse.json(
      {
        message: "Failed to process AI request.",
      },
      { status: 500 }
    );
  }
}
