import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get the backend URL from environment variables with fallback
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

    // Parse the request body to check if this is a timeout-triggered logout
    let body = { reason: "user_initiated" }
    try {
      body = await request.json()
    } catch (e) {
      console.warn("No JSON body in logout request, using default reason")
    }

    const isTimeout = body.reason === "timeout"
    console.log(`Logging out with reason: ${body.reason}, isTimeout: ${isTimeout}`)

    // Forward the request to the backend with the timeout information
    const response = await fetch(`${backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: isTimeout ? "session_timeout" : "user_initiated",
        timestamp: Date.now(),
      }),
      credentials: "include",
    })

    if (!response.ok) {
      console.error("Backend logout failed:", response.status, response.statusText)
      let errorText = ""
      try {
        errorText = await response.text()
      } catch (e) {
        errorText = "Could not read error response"
      }

      return NextResponse.json(
        {
          error: "Failed to logout",
          status: response.status,
          statusText: response.statusText,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Clear any session cookies by setting them to expire
    const headers = new Headers()
    const cookies = request.headers.get("cookie")
    if (cookies) {
      cookies.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        headers.append("Set-Cookie", `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`)
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: isTimeout ? "Session expired and invalidated" : "Logged out successfully",
      },
      { headers },
    )
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
