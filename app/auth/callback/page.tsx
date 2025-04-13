"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the code from the URL
        const code = searchParams.get("code")

        if (!code) {
          setError("Authentication failed: No authorization code received")
          return
        }

        // Exchange the code for user data via your backend
        const response = await fetch(`http://localhost:8000/auth/login/callback?code=${code}`, {
          method: "GET",
          credentials: "include", // Important for cookies
        })

        if (!response.ok) {
          throw new Error("Authentication failed")
        }

        const userData = await response.json()

        // Use the login function from AuthProvider to set the user
        await login(userData.email || "user@example.com", "", userData)

        // Redirect to the dashboard
        router.push("/dashboard")
      } catch (err) {
        console.error("Authentication error:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
      }
    }

    processAuth()
  }, [searchParams, login, router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-red-800 dark:bg-red-900/30 dark:text-red-200">
          <h2 className="mb-2 text-lg font-semibold">Authentication Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h2 className="text-lg font-medium">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we log you in.</p>
      </div>
    </div>
  )
}

