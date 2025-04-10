import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        // Get the backend URL from environment variables with fallback
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

        console.log("Extending session with backend:", backendUrl)

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/auth/extend-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                timestamp: Date.now(),
            }),
            credentials: "include",
        })

        if (!response.ok) {
            console.error("Failed to extend session with backend:", response.status, response.statusText)
            return NextResponse.json(
                { error: "Failed to extend session", status: response.status },
                { status: response.status },
            )
        }

        // Set the session expiry time to 30 minutes from now
        const expiryTime = Date.now() + 30 * 60 * 1000 // 30 minutes in milliseconds

        return NextResponse.json({
            success: true,
            message: "Session extended",
            expiryTime,
            expiryTimeFormatted: new Date(expiryTime).toLocaleTimeString(),
        })
    } catch (error) {
        console.error("Error extending session:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
