"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OAuthButton } from "@/components/oauth-button"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { useEffect } from "react"

export default function LoginSimple() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary pl-2">
            <Trophy className="h-5 w-5" />
            <span>Battleship AI Arena</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Sign in to access Battleship AI Arena</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <OAuthButton provider="uofa" className="w-full h-12 bg-[#9E1B32] hover:bg-[#7E1629] text-white border-none">
              <div className="flex items-center justify-center w-full">
                <span className="font-bold text-2xl mr-2 font-serif italic">A</span>
                <span>Login with University of Alabama</span>
              </div>
            </OAuthButton>

            <div className="text-center text-sm text-muted-foreground mt-4">
              By logging in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="border-t border-muted py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} Battleship AI Arena. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

