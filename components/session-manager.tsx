"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Clock } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Session duration in seconds (30 minutes)
const SESSION_DURATION = 30 * 60

export function SessionManager() {
    const { isAuthenticated, logout } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [sessionRemaining, setSessionRemaining] = useState(SESSION_DURATION)
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
    const [lastActivity, setLastActivity] = useState(Date.now())

    // Function to refresh the session
    const refreshSession = async () => {
        if (!isAuthenticated) return

        try {
            const response = await fetch("/api/extend-session", {
                method: "POST",
                credentials: "include",
            })

            if (response.ok) {
                const data = await response.json()
                // Update last activity time
                const now = Date.now()
                localStorage.setItem("last_activity_time", now.toString())
                setLastActivity(now)
                setSessionRemaining(SESSION_DURATION) // Reset to 30 minutes
                setShowTimeoutWarning(false)

                console.log("Session refreshed. New expiry:", new Date(now + SESSION_DURATION * 1000).toLocaleTimeString())
            }
        } catch (error) {
            console.error("Failed to refresh session:", error)
        }
    }

    // Handle user activity
    useEffect(() => {
        if (!isAuthenticated) return

        // Initialize last activity time if not set
        if (!localStorage.getItem("last_activity_time")) {
            const now = Date.now()
            localStorage.setItem("last_activity_time", now.toString())
            console.log("Initial activity time set:", new Date(now).toLocaleTimeString())
        }

        // Set up event listeners for user activity
        const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"]

        // Debounced refresh function (only refresh once every 5 minutes)
        let lastRefresh = Date.now()
        const handleActivity = () => {
            const now = Date.now()
            // Update last activity time
            localStorage.setItem("last_activity_time", now.toString())
            setLastActivity(now)

            // Log activity for debugging
            console.log("Activity detected at:", new Date(now).toLocaleTimeString())

            // Only refresh the session if it's been more than 5 minutes since the last refresh
            if (now - lastRefresh > 5 * 60 * 1000) {
                console.log("Refreshing session due to activity after 5+ minutes")
                refreshSession()
                lastRefresh = now
            }
        }

        // Add event listeners
        activityEvents.forEach((event) => {
            window.addEventListener(event, handleActivity)
        })

        // Clean up
        return () => {
            activityEvents.forEach((event) => {
                window.removeEventListener(event, handleActivity)
            })
        }
    }, [isAuthenticated])

    // Check session status periodically
    useEffect(() => {
        if (!isAuthenticated) return

        // Function to calculate remaining time
        const calculateRemainingTime = () => {
            const lastActivityTime = Number.parseInt(localStorage.getItem("last_activity_time") || "0", 10)
            if (!lastActivityTime) {
                return SESSION_DURATION
            }

            const elapsedSeconds = Math.floor((Date.now() - lastActivityTime) / 1000)
            return Math.max(0, SESSION_DURATION - elapsedSeconds)
        }

        // Check session status every second
        const checkInterval = setInterval(() => {
            try {
                // Calculate remaining time based on last activity
                const remainingSeconds = calculateRemainingTime()
                setSessionRemaining(remainingSeconds)

                // Show warning if less than 2 minutes remaining
                if (remainingSeconds < 120 && remainingSeconds > 0 && !showTimeoutWarning) {
                    setShowTimeoutWarning(true)
                    console.log("Session warning shown. Remaining time:", remainingSeconds)
                }

                // Auto logout if session has expired
                if (remainingSeconds <= 0) {
                    console.log("Session expired. Initiating timeout procedure.")
                    handleSessionTimeout()
                    return
                }
            } catch (error) {
                console.error("Failed to check session status:", error)
            }
        }, 1000) // Check every second for more responsive UI

        return () => {
            clearInterval(checkInterval)
        }
    }, [isAuthenticated, showTimeoutWarning])

    // Handle session timeout
    const handleSessionTimeout = async () => {
        setShowTimeoutWarning(false)

        try {
            console.log("Handling session timeout - notifying backend")

            // First, explicitly invalidate the session on the backend using the new API endpoint
            const response = await fetch("/api/invalidate-session", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to logout: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log("Session invalidated:", data)

            // Then perform the local logout
            await logout("timeout")

            toast({
                title: "Session Expired",
                description: "Your session has expired due to inactivity. Please log in again.",
                variant: "destructive",
            })

            // Redirect to login page with reason parameter
            router.push("/login?reason=timeout")
        } catch (error) {
            console.error("Error during session timeout:", error)
        }
    }

    // Format remaining time as MM:SS
    const formatRemainingTime = () => {
        const minutes = Math.floor(sessionRemaining / 60)
        const seconds = sessionRemaining % 60
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    if (!isAuthenticated) return null

    return (
        <>
            <AlertDialog open={showTimeoutWarning} onOpenChange={setShowTimeoutWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Session Timeout Warning
                        </AlertDialogTitle>
                        {/* Fix: Don't use AlertDialogDescription for complex content */}
                    </AlertDialogHeader>

                    {/* Move the content outside of AlertDialogDescription */}
                    <div className="space-y-4 py-2">
                        <p>
                            Your session will expire in <span className="font-bold text-destructive">{formatRemainingTime()}</span>{" "}
                            due to inactivity.
                        </p>
                        <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                For security reasons, you will be automatically logged out after 30 minutes of inactivity.
                            </span>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowTimeoutWarning(false)}>Dismiss</AlertDialogCancel>
                        <AlertDialogAction onClick={refreshSession}>Stay Logged In</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
