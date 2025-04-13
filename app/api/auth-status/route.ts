import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        // Get the backend URL from environment variables with fallback
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })

        if (!response.ok) {
            return NextResponse.json(
                {
                    authenticated: false,
                    session_remaining_seconds: 0,
                    error: "Not authenticated",
                },
                { status: 200 }, // Return 200 even for unauthenticated to avoid errors
            )
        }

        // Calculate remaining session time (30 minutes from last activity)
        const lastActivity = localStorage?.getItem?.("last_activity_time")
            ? Number.parseInt(localStorage.getItem("last_activity_time") || "0", 10)
            : Date.now()

        const sessionDuration = 30 * 60 // 30 minutes in seconds
        const elapsedSeconds = Math.floor((Date.now() - lastActivity) / 1000)
        const remainingSeconds = Math.max(0, sessionDuration - elapsedSeconds)

        return NextResponse.json({
            authenticated: true,
            session_remaining_seconds: remainingSeconds,
        })
    } catch (error) {
        console.error("Error checking auth status:", error)
        return NextResponse.json(
            {
                authenticated: false,
                session_remaining_seconds: 0,
                error: "Internal server error",
            },
            { status: 200 }, // Return 200 to avoid errors
        )
    }
}
