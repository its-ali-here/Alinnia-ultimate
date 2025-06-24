// app/api/market-pulse/route.ts

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // TODO: In a future step, we will replace this with a real call to the Groq AI.
    // For now, we return a hardcoded response to test our component.
    const mockApiResponse = {
      sentiment: "Optimistic",
      indicator: "Consumer spending in the retail sector is up 5% month-over-month, showing strong confidence.",
      suggestion: "Consider increasing ad spend on top-performing products to capitalize on the current trend."
    };

    // Simulate a network delay to see our loading state
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json(mockApiResponse);

  } catch (error) {
    console.error("Market Pulse API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI-powered market pulse." },
      { status: 500 }
    );
  }
}