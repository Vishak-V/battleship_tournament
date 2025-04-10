import { NextResponse } from "next/server"

// This is a direct route to the backend auth endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider") || "uofa"

    // Get the backend URL from environment variables with fallback
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

    // Construct the auth URL based on the provider
    const authUrl = `${backendUrl}/auth/login/`

    // Get the frontend callback URL
    const origin = new URL(request.url).origin
    const frontendCallbackUrl = `${origin}/login-success`

    // Add the frontend callback URL as a query parameter
    const finalAuthUrl = `${authUrl}?redirect_uri=${encodeURIComponent(frontendCallbackUrl)}`

    // Return the URL for client-side redirection
    return NextResponse.json({ url: finalAuthUrl })
  } catch (error) {
    console.error("Direct auth error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate auth URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

