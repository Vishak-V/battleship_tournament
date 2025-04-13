"use client"

import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function UserMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()

  // Debug output to help troubleshoot
  console.log("UserMenu - Auth state:", { isAuthenticated, user, isLoading })

  if (isLoading) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        <div className="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Login
        </Button>
      </Link>
    )
  }

  // Get initials for avatar
  const getInitials = () => {
    if (!user.name) return "U"
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

