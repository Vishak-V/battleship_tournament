"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Trophy, ArrowLeft } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // In a real app, you would make an API call to your backend
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to send reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background hexagon-pattern">
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
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {!isSubmitted
                ? "Enter your email address and we'll send you a link to reset your password"
                : "Check your email for a reset link"}
            </CardDescription>
          </CardHeader>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-sm text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-primary/20"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-md text-sm text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">
                If an account exists with the email <strong>{email}</strong>, we've sent a password reset link.
              </div>
              <div className="text-center mt-4">
                <Link href="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </CardContent>
          )}
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

