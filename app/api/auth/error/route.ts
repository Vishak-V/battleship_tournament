import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get("error") || "Unknown error"
  const errorDescription = searchParams.get("error_description") || "No additional details available"

  return NextResponse.json(
    {
      error,
      errorDescription,
      timestamp: new Date().toISOString(),
    },
    { status: 400 },
  )
}

