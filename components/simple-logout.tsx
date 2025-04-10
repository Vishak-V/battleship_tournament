"use client"

import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function SimpleLogout() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      alert("Failed to log out. Please try again.")
    }
  }

  return (
    <div className="flex justify-end p-4">
      <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}

