"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Define the user type
interface User {
  id: string
  name: string
  email: string
  // Add any other user properties you need
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, userData?: any) => Promise<void>
  logout: (reason?: string) => Promise<void>
  startOAuthFlow: (provider: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => { },
  logout: async () => { },
  startOAuthFlow: async () => { },
  register: async () => { },
})

// Create the auth provider component
export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check for stored auth token or session
        const storedUser = localStorage.getItem("battleship_user")

        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          console.log("User authenticated from localStorage:", userData)
          setIsLoading(false)
          return
        }

        // If no stored user, try to fetch from the backend
        // Use AbortController to set a timeout for the fetch request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

        try {
          console.log("Attempting to fetch user data from:", `${backendUrl}/auth/me`)
          const response = await fetch(`${backendUrl}/auth/me`, {
            credentials: "include",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            setIsAuthenticated(true)
            localStorage.setItem("battleship_user", JSON.stringify(userData))
            console.log("User authenticated from backend:", userData)
          } else {
            setUser(null)
            setIsAuthenticated(false)
            console.log("Not authenticated: Backend response not OK", response.status, response.statusText)
          }
        } catch (fetchError) {
          // Handle network errors or timeouts with more detail
          console.log("Backend connection failed:", fetchError instanceof Error ? fetchError.message : fetchError)
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
    // Only run this effect once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Login function - supports both direct login and OAuth callback
  const login = async (email: string, password: string, userData?: any) => {
    setIsLoading(true)
    try {
      // If userData is provided, use it directly (from OAuth callback)
      if (userData) {
        // Create a proper user object if one isn't provided
        const userObject = {
          id: userData.id || `user_${Date.now()}`,
          name: userData.name || userData.username || (email ? email.split("@")[0] : "User"),
          email: userData.email || email || "user@example.com",
          ...userData,
        }

        setUser(userObject)
        setIsAuthenticated(true)
        localStorage.setItem("battleship_user", JSON.stringify(userObject))
        console.log("User logged in with provided data:", userObject)
        return
      }

      // Otherwise, perform regular login
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`)
      }

      const user = await response.json()
      setUser(user)
      setIsAuthenticated(true)
      localStorage.setItem("battleship_user", JSON.stringify(user))
      console.log("User logged in via API:", user)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (reason = "user_initiated") => {
    setIsLoading(true)
    try {
      // Try to call the logout API with the reason
      try {
        console.log("Attempting to logout at:", `${backendUrl}/auth/logout`)
        await fetch(`/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
          credentials: "include",
        })
      } catch (logoutError) {
        // Silently handle logout API failures
        console.log(
          "Logout API call failed, proceeding with local logout:",
          logoutError instanceof Error ? logoutError.message : logoutError,
        )
      }

      // Always clear stored user data
      localStorage.removeItem("battleship_user")
      localStorage.removeItem("last_activity_time") // Also clear the last login time

      // Clear any session cookies by setting them to expire
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      })

      // Reset auth state
      setUser(null)
      setIsAuthenticated(false)
      console.log("User logged out - authentication state cleared")

      // Add a small delay to ensure state updates are processed
      await new Promise((resolve) => setTimeout(resolve, 50))
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Function to start OAuth flow
  const startOAuthFlow = async (provider: string) => {
    try {
      // Instead of trying to fetch and handle the response,
      // directly navigate to the backend auth URL
      const redirectUri = encodeURIComponent(`${window.location.origin}/login-success`)
      const authUrl = `${backendUrl}/auth/login/?redirect_uri=${redirectUri}`

      console.log(`Starting OAuth flow: ${authUrl}`)

      // Directly navigate to the auth URL
      window.location.href = authUrl
    } catch (error) {
      console.error("Failed to start OAuth flow:", error)
      throw error
    }
  }

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // For a real implementation, you would call your backend API
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`)
      }

      const user = await response.json()
      setUser(user)
      setIsAuthenticated(true)
      localStorage.setItem("battleship_user", JSON.stringify(user))
      console.log("User registered:", user)
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        startOAuthFlow,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
