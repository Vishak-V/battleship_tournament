"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Trophy } from "lucide-react"
import { UserMenu } from "./user-menu"

export function MainNav() {
  const pathname = usePathname()

  // Don't render the navigation on the login page
  if (pathname === "/login") {
    return null
  }

  const navItems = [
    { href: "/upload", label: "Upload Bot" },
    { href: "/play", label: "Play" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/docs", label: "Documentation" },
    { href: "/admin", label: "Admin" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <Trophy className="h-5 w-5" />
          <span>Battleship AI Arena</span>
        </Link>
        <nav className="ml-auto flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60",
                "px-3 py-2", // Added padding for better spacing
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-4">
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  )
}

