import { type NextRequest, NextResponse } from "next/server"

// This route handles initiating OAuth flows
export async function GET(request: NextRequest, { params }: { params: { provider: string[] } }) {
  try {
    // Extract the provider from the dynamic route parameter
    const provider = params.provider[0] || "uofa"

    // Get the backend URL from environment variables with fallback
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

    // Construct the auth URL based on the provider
    const authUrl = `${backendUrl}/auth/login/`

    // Get the frontend callback URL to pass to the backend
    const origin = request.headers.get("origin") || request.nextUrl.origin
    const frontendCallbackUrl = `${origin}/login-success`

    // Add the frontend callback URL as a query parameter
    const finalAuthUrl = `${authUrl}?redirect_uri=${encodeURIComponent(frontendCallbackUrl)}`

    console.log(`Redirecting to auth URL: ${finalAuthUrl}`)

    // Redirect to the authentication URL
    return NextResponse.redirect(finalAuthUrl, { status: 302 })
  } catch (error) {
    console.error("OAuth initiation error:", error)

    // Return a more informative error response
    return NextResponse.json(
      {
        error: "Failed to initiate authentication",
        details: error instanceof Error ? error.message : "Unknown error",
        provider: params.provider,
      },
      { status: 500 },
    )
  }
}

