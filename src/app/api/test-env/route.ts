import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasGoogleGenaiKey: !!process.env.GOOGLE_GENAI_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE,
  });
}