"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"

interface OAuthButtonProps {
  provider: string
  className?: string
  children: React.ReactNode
}

export function OAuthButton({ provider, className, children }: OAuthButtonProps) {
  const { startOAuthFlow } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Update the handleClick function to handle errors better
  const handleClick = async () => {
    try {
      setIsLoading(true)

      // Clear any existing auth data before starting a new flow
      localStorage.removeItem("battleship_user")

      await startOAuthFlow(provider)
      // Note: The page will redirect, so we won't reach code after this point
    } catch (error) {
      console.error("OAuth button error:", error)
      setIsLoading(false)
      // Show an error message to the user
      alert("Failed to connect to authentication service. Please try again later.")
    }
  }

  return (
    <Button className={className} onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <div className="flex items-center">
          <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
}

