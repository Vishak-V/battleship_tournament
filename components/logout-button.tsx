"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  showIcon?: boolean
  redirectTo?: string
}

export function LogoutButton({
  className,
  variant = "ghost",
  showIcon = true,
  redirectTo = "/login",
}: LogoutButtonProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()

      // Add a small delay to ensure the auth state is updated before redirecting
      setTimeout(() => {
        router.push(redirectTo)
      }, 100)
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoading(false)
      // If logout fails, we can show an alert or handle it silently
      alert("Failed to log out. Please try again.")
    }
  }

  return (
    <Button variant={variant} className={className} onClick={handleLogout} disabled={isLoading}>
      {isLoading ? (
        <div className="flex items-center">
          <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
          <span>Logging out...</span>
        </div>
      ) : (
        <div className="flex items-center">
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          <span>Logout</span>
        </div>
      )}
    </Button>
  )
}

