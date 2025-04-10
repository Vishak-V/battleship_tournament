import { NextResponse } from "next/server"

// This is a debug endpoint to help diagnose API connectivity issues
export async function GET(request: Request) {
  try {
    // Get the backend URL from environment variables with fallback
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

    // Return diagnostic information
    return NextResponse.json({
      status: "ok",
      message: "Debug endpoint is working",
      timestamp: new Date().toISOString(),
      environment: {
        backendUrl,
        nodeEnv: process.env.NODE_ENV,
      },
      request: {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Debug endpoint error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

