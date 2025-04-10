"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/components/auth-provider"
import { RefreshCw, Clock, FastForward, AlertCircle, ShieldAlert, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Session duration in seconds (30 minutes)
const SESSION_DURATION = 30 * 60

export default function AuthStatusPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [simulationActive, setSimulationActive] = useState(false)
  const [simulationTime, setSimulationTime] = useState(29) // Default to 29 minutes

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

      // Reset simulation if active
      if (simulationActive) {
        setSimulationActive(false)
      }

      // Update last activity time
      localStorage.setItem("last_activity_time", Date.now().toString())
    } catch (error) {
      console.error("Error extending session:", error)
    } finally {
      setLoading(false)
    }
  }

  // Simulate inactivity
  const simulateInactivity = () => {
    // Calculate time to set based on simulation minutes
    const minutesInMs = simulationTime * 60 * 1000
    const timeAgo = Date.now() - minutesInMs
    localStorage.setItem("last_activity_time", timeAgo.toString())
    setSimulationActive(true)
    checkSession()

    console.log(
      `Simulating ${simulationTime} minutes of inactivity. Last activity set to:`,
      new Date(timeAgo).toLocaleTimeString(),
    )
  }

  // Force a session timeout (for testing backend invalidation)
  const forceSessionTimeout = async () => {
    try {
      setLoading(true)
      console.log("Forcing session timeout - testing backend invalidation")

      // Call the new API endpoint with POST method
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

      // Then perform local logout
      await logout("timeout")

      // Redirect to login with reason parameter
      window.location.href = "/login?reason=timeout"
    } catch (error) {
      console.error("Error forcing session timeout:", error)
      alert("Error forcing session timeout. Check console for details.")
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
    if (typeof window === "undefined") return SESSION_DURATION

    const lastActivityTime = Number.parseInt(localStorage.getItem("last_activity_time") || "0", 10)
    if (!lastActivityTime) return SESSION_DURATION

    const elapsedSeconds = Math.floor((Date.now() - lastActivityTime) / 1000)
    return Math.max(0, SESSION_DURATION - elapsedSeconds)
  }

  // Get real-time remaining seconds
  const remainingSeconds = calculateRemainingTime()

  // Calculate progress percentage
  const progressPercentage = (remainingSeconds / SESSION_DURATION) * 100

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Session Status Debug</h1>

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

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This page helps debug the session timeout functionality. You can simulate inactivity or force a
                  session timeout.
                </AlertDescription>
              </Alert>
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
                <div className="space-y-4">
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

                    <div className="font-medium">Session Expires:</div>
                    <div>
                      {localStorage.getItem("last_activity_time")
                        ? new Date(
                            Number.parseInt(localStorage.getItem("last_activity_time") || "0", 10) +
                              SESSION_DURATION * 1000,
                          ).toLocaleTimeString()
                        : "N/A"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Session Time Remaining</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
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

                  <Button onClick={checkSession} disabled={loading || !isAuthenticated} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Simulation Tools</h3>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="simulation-time" className="text-sm text-muted-foreground">
                      Simulate minutes of inactivity:
                    </label>
                    <input
                      id="simulation-time"
                      type="range"
                      min="1"
                      max="29"
                      value={simulationTime}
                      onChange={(e) => setSimulationTime(Number.parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="w-12 text-center font-mono bg-muted rounded-md py-1">{simulationTime}</div>
                </div>

                <Button
                  onClick={simulateInactivity}
                  disabled={loading || !isAuthenticated}
                  variant="secondary"
                  className="w-full"
                >
                  <FastForward className="h-4 w-4 mr-2" />
                  Simulate {simulationTime} Minutes of Inactivity
                </Button>

                <div className="text-xs text-muted-foreground">
                  This will set your last activity time to {simulationTime} minutes ago, leaving you with{" "}
                  {30 - simulationTime} minutes until timeout.
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

                <div className="text-xs text-destructive">
                  This will immediately invalidate your session on the backend and log you out.
                </div>
              </div>

              {simulationActive && (
                <Alert className="mt-4 bg-amber-900/20 border-amber-500/50">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-400">Simulation Active</AlertTitle>
                  <AlertDescription className="text-amber-200">
                    Simulating {simulationTime} minutes of inactivity. Session will expire in {30 - simulationTime}{" "}
                    minutes.
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
