import type React from "react"
import "@/app/globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { CustomCursor } from "@/components/custom-cursor"
import { CustomToaster } from "@/components/ui/custom-toast"
import { SessionManager } from "@/components/session-manager" // Add this import

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Battleship AI Arena",
  description: "Test your AI-powered Battleship bots against others in a competitive environment",
  generator: "v0.dev",
}

export const viewport: Viewport = {
  themeColor: "#030711", // Moved from metadata to viewport
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <MainNav />
            {children}
            <SessionManager /> {/* Add the SessionManager component */}
            <CustomCursor />
            <CustomToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
