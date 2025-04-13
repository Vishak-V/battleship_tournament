"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/components/auth-provider"
import { RefreshCw, Clock, FastForward, AlertCircle, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function AuthCheckPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [simulationActive, setSimulationActive] = useState(false)

  const checkSession = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth-status", {
        credentials: "include",
      })
      const data = await response.json()
      setSessionInfo(data)
      setLastChecked(new Date())
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setLoading(false)
    }
  }

  const extendSession = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/extend-session", {
        method: "POST",
        credentials: "include",
      })
      const data = await response.json()
      await checkSession()
    } catch (error) {
      console.error("Error extending session:", error)
    } finally {
      setLoading(false)
    }
  }

  // Simulate 29 minutes of inactivity
  const simulateInactivity = () => {
    // Set last activity time to 29 minutes ago (1740000 ms)
    const timeAgo = Date.now() - 1740000
    localStorage.setItem("last_activity_time", timeAgo.toString())
    setSimulationActive(true)
    checkSession()
  }

  // Force a session timeout (for testing backend invalidation)
  const forceSessionTimeout = async () => {
    try {
      setLoading(true)
      // Call the logout API with timeout reason
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: "timeout" }),
        credentials: "include",
      })

      // Then perform local logout
      await logout("timeout")

      // Redirect to login
      window.location.href = "/login"
    } catch (error) {
      console.error("Error forcing session timeout:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      checkSession()
    }
  }, [isAuthenticated])

  // Update session info every second when simulation is active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (simulationActive) {
      interval = setInterval(() => {
        checkSession()
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [simulationActive])

  // Format remaining time as MM:SS
  const formatRemainingTime = (seconds: number) => {
    if (!seconds && seconds !== 0) return "00:00"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Calculate remaining time based on last activity
  const calculateRemainingTime = () => {
    if (typeof window === "undefined") return 0

    const lastActivityTime = Number.parseInt(localStorage.getItem("last_activity_time") || "0", 10)
    if (!lastActivityTime) return 0

    const elapsedSeconds = Math.floor((Date.now() - lastActivityTime) / 1000)
    const sessionDuration = 30 * 60 // 30 minutes in seconds
    return Math.max(0, sessionDuration - elapsedSeconds)
  }

  // Get real-time remaining seconds
  const remainingSeconds = calculateRemainingTime()

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Session Debug</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current user and authentication information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">Authenticated:</div>
                <div>{isAuthenticated ? "Yes" : "No"}</div>

                <div className="font-medium">User ID:</div>
                <div className="truncate">{user?.id || "N/A"}</div>

                <div className="font-medium">User Name:</div>
                <div>{user?.name || "N/A"}</div>

                <div className="font-medium">Email:</div>
                <div>{user?.email || "N/A"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Session Information</span>
                <Button variant="outline" size="sm" onClick={checkSession} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </CardTitle>
              <CardDescription>
                {lastChecked
                  ? `Last checked: ${lastChecked.toLocaleTimeString()}`
                  : "Check your current session status"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionInfo ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Session Active:</div>
                  <div>{sessionInfo.authenticated ? "Yes" : "No"}</div>

                  <div className="font-medium">Time Remaining:</div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatRemainingTime(remainingSeconds)}
                  </div>

                  <div className="font-medium">Last Activity:</div>
                  <div>
                    {localStorage.getItem("last_activity_time")
                      ? new Date(
                          Number.parseInt(localStorage.getItem("last_activity_time") || "0", 10),
                        ).toLocaleTimeString()
                      : "N/A"}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">Click refresh to check session status</div>
              )}

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Session Management</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={extendSession} disabled={loading || !isAuthenticated}>
                    Extend Session
                  </Button>

                  <Button onClick={simulateInactivity} disabled={loading || !isAuthenticated} variant="secondary">
                    <FastForward className="h-4 w-4 mr-2" />
                    Simulate 29 Minutes
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                <Button
                  onClick={forceSessionTimeout}
                  disabled={loading || !isAuthenticated}
                  variant="destructive"
                  className="w-full"
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Force Session Timeout (Test Backend Invalidation)
                </Button>
              </div>

              {simulationActive && (
                <Alert className="mt-4 bg-amber-900/20 border-amber-500/50">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-400">Simulation Active</AlertTitle>
                  <AlertDescription className="text-amber-200">
                    Session timeout will occur in approximately 1 minute. The backend will be notified to invalidate
                    your session.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-xs text-muted-foreground mt-2">
                Note: Sessions automatically expire after 30 minutes of inactivity
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
