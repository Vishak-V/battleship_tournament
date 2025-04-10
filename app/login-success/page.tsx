"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function LoginSuccess() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Try to fetch user data from cookies/session
    const checkAuthAndRedirect = async () => {
      try {
        // Get the backend URL from environment variables with fallback
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

        console.log("Checking authentication status with backend URL:", backendUrl)

        // Clear any previous auth state first to ensure a fresh login
        if (isAuthenticated) {
          console.log("Already authenticated, redirecting to home...")
          router.push("/")
          return
        }

        // Add a timestamp to prevent caching issues
        const timestamp = new Date().getTime()

        // Attempt to fetch user data from the backend with proper error handling
        try {
          const response = await fetch(`${backendUrl}/auth/me?_=${timestamp}`, {
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            // Set a timeout to prevent hanging
            signal: AbortSignal.timeout(10000), // 10 second timeout
          })

          console.log("Backend response status:", response.status)

          if (response.ok) {
            // If successful, get user data and use the login function to set auth state
            const userData = await response.json()
            console.log("Authentication successful, user data:", userData)

            // Create a minimal user object if the backend doesn't provide all required fields
            const userObject = {
              id: userData.id || `user_${Date.now()}`,
              name: userData.name || userData.username || userData.email?.split("@")[0] || "User",
              email: userData.email || "user@example.com",
              ...userData,
            }

            // Use the login function to properly set authentication state
            await login("", "", userObject)

            // Short delay to ensure data is saved before redirect
            setTimeout(() => {
              router.push("/")
            }, 500)
          } else {
            // Try to get more detailed error information
            let errorDetail = "Server returned status " + response.status
            try {
              const errorData = await response.json()
              errorDetail = errorData.message || errorData.error || errorDetail
            } catch (e) {
              // If we can't parse the error as JSON, use the status text
              errorDetail = response.statusText || errorDetail
            }

            console.error("Authentication failed:", errorDetail)
            setError(`Authentication failed: ${errorDetail}. Please try logging in again.`)
            setIsProcessing(false)

            // If not authenticated, redirect to login page after a delay
            setTimeout(() => {
              router.push("/login")
            }, 3000)
          }
        } catch (fetchError) {
          // Handle network errors specifically
          console.error("Fetch error:", fetchError)

          // Provide more helpful error messages based on the error type
          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              setError("Connection to authentication server timed out. Please try again later.")
            } else if (fetchError.message.includes("Failed to fetch")) {
              setError(
                "Could not connect to authentication server. Please check your network connection and try again.",
              )
            } else {
              setError(`Error checking authentication: ${fetchError.message}. Please try again later.`)
            }
          } else {
            // If it's not an Error object, provide a generic message
            setError("Could not connect to authentication server. Please try again later.")
          }

          setIsProcessing(false)

          // On error, redirect to login page after a delay
          setTimeout(() => {
            router.push("/login")
          }, 3000) // Reduced from 5000 to 3000 for better UX
        }
      } catch (error) {
        console.error("General error in authentication check:", error)
        setError(
          `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again later.`,
        )
        setIsProcessing(false)

        // On error, redirect to login page after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000) // Reduced from 5000 to 3000 for better UX
      }
    }

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isProcessing) {
        setError("Login process is taking too long. Please try again.")
        setIsProcessing(false)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    }, 15000) // 15 seconds timeout

    // Only run this once
    checkAuthAndRedirect()

    // Clean up timeout
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md p-6">
        {error ? (
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-md text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
            <p className="font-semibold mb-2">Authentication Error</p>
            <p>{error}</p>
            <p className="mt-4 text-xs">Redirecting to login page...</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <h2 className="text-lg font-medium">{isProcessing ? "Processing login..." : "Login successful!"}</h2>
            <p className="text-muted-foreground">
              {isProcessing ? "Please wait while we verify your credentials..." : "Redirecting you to the homepage..."}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
