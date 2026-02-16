import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI lazily to avoid build-time errors
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not set");
      return null;
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function GET() {
  const openaiClient = getOpenAI();
  return NextResponse.json({
    success: true,
    message: "Simplified chatbot GET endpoint is working",
    hasOpenAI: !!openaiClient,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || "Hello";

    // Simple response without complex logic
    const response = {
      success: true,
      message: `I received your message: "${message}". This is a simplified chatbot response.`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in simplified chatbot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
