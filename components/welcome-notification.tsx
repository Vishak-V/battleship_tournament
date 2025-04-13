"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"

export function WelcomeNotification() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  useEffect(() => {
    // Skip on server-side rendering
    if (typeof window === "undefined") return

    // Check if the user just logged in by comparing the current time with the last login time
    const lastLoginTime = localStorage.getItem("last_login_time")
    const currentTime = Date.now()

    // Store the current login time
    if (isAuthenticated && user) {
      localStorage.setItem("last_login_time", currentTime.toString())
    }

    // Show welcome message if:
    // 1. User is authenticated
    // 2. We haven't shown it yet in this component's lifecycle
    // 3. Either there's no last login time or it was more than 1 minute ago (to prevent duplicate toasts on page refreshes)
    if (
      isAuthenticated &&
      user &&
      !hasShownWelcome &&
      (!lastLoginTime || currentTime - Number.parseInt(lastLoginTime) > 60000)
    ) {
      // Show welcome toast
      toast({
        title: "Welcome back!",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-100">Great to see you again, {user.name}. Ready for battle?</span>
          </div>
        ),
        duration: 3000, // Show for 3 seconds
        className: "welcome-toast", // Add a custom class for styling
      })

      setHasShownWelcome(true)
    }
  }, [isAuthenticated, user, toast, hasShownWelcome])

  // This component doesn't render anything visible
  return null
}
