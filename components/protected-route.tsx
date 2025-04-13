"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after authentication check is complete
    if (!isLoading && !isAuthenticated) {
      console.log("Access denied: User not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <h2 className="text-lg font-medium">Checking authentication...</h2>
          <p className="text-muted-foreground">Please wait while we verify your access.</p>
        </div>
      </div>
    )
  }

  // If not authenticated, render nothing (will redirect in useEffect)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}

