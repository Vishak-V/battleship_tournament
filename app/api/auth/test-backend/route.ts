import { NextResponse } from "next/server"

// This endpoint tests connectivity to the backend
export async function GET(request: Request) {
  try {
    // Get the backend URL from environment variables with fallback
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

    // Try to connect to the backend
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      const response = await fetch(`${backendUrl}/auth/me`, {
        credentials: "include",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId)

      // Return the result
      return NextResponse.json({
        status: "ok",
        backendStatus: response.status,
        backendStatusText: response.statusText,
        backendUrl: `${backendUrl}/auth/me`,
        headers: Object.fromEntries(response.headers.entries()),
      })
    } catch (fetchError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to connect to backend",
          backendUrl: `${backendUrl}/auth/me`,
          error: fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 502 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Test backend endpoint error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

