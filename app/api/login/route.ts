import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // This is a mock implementation
    // In a real app, you would validate credentials against your database

    // For demo purposes, let's accept any email with password "password"
    if (password === "password") {
      return NextResponse.json({
        id: "user_123",
        name: email.split("@")[0], // Use part of email as name
        email: email,
      })
    } else {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      })
    }
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    })
  }
}

