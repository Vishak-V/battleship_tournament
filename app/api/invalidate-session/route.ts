import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        // Get the backend URL from environment variables with fallback
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

        console.log("Invalidating session with backend:", backendUrl)

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/auth/invalidate-session`, {
            method: "GET", // Backend expects GET for this endpoint
            credentials: "include",
        })

        if (!response.ok) {
            console.error("Failed to invalidate session with backend:", response.status, response.statusText)
            return NextResponse.json(
                { error: "Failed to invalidate session", status: response.status },
                { status: response.status },
            )
        }

        // Get response data from backend
        let responseData = {}
        try {
            responseData = await response.json()
        } catch (e) {
            // If the response is not JSON, use a default success message
            responseData = { success: true, message: "Session invalidated successfully" }
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
                ...responseData,
                success: true,
                message: "Session invalidated successfully",
                timestamp: new Date().toISOString(),
            },
            { headers },
        )
    } catch (error) {
        console.error("Error invalidating session:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}
