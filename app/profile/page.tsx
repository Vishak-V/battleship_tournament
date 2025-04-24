"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"


const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export default function Profile() {
  const [profileData, setProfileData] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [newUserName, setNewUserName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await fetch(`${backendUrl}/v2/me`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          mode: "cors",
        })

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json()
          throw new Error(errorData.detail || "Failed to fetch profile data")
        }

        const profileJson = await profileResponse.json()
        setProfileData(profileJson)
        setNewUserName(profileJson.name) // Initialize with current name

        const statsResponse = await fetch(`${backendUrl}/v2/me/stats`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          mode: "cors",
        })

        if (!statsResponse.ok) {
          const errorData = await statsResponse.json()
          throw new Error(errorData.detail || "Failed to fetch stats data")
        }

        const statsJson = await statsResponse.json()
        setStatsData(statsJson)

        const activityResponse = await fetch(`${backendUrl}/v2/me/recent-activity`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          mode: "cors",
        })

        if (!activityResponse.ok) {
          const errorData = await activityResponse.json()
          throw new Error(errorData.detail || "Failed to fetch recent activity")
        }

        const activityJson = await activityResponse.json()
        setRecentActivity(activityJson)

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])


  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`${backendUrl}/v2/me?name=${newUserName}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
        },
        credentials: "include",
        mode: "cors",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update profile")
      }

      // Update the profile data after successful update
      setProfileData((prevData: any) => ({ ...prevData, name: newUserName }))

    } catch (err: any) {
      setError(err.message)
    }
  }


  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  }


  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 bg-[#0a192f] text-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 ">My Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {profileData && (
              <div>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-300">
                    Username
                  </label>
                  <div className="mt-2">
                    <Input
                      id="username"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="bg-[#1a2942] border-gray-700 text-gray-100"
                    />
                  </div>
                </div>
                <Button onClick={handleUpdateProfile} className="bg-yellow-600 hover:bg-yellow-700 text-white">Update Profile</Button>

                {/* Display other profile information */}
                {/* Example: <p>Email: {profileData.email}</p> */}
              </div>
            )}
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-gray-300">{JSON.stringify(statsData, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4"> {/* Adjust height as needed */}
              <pre className="text-gray-300">{JSON.stringify(recentActivity, null, 2)}</pre>
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </ProtectedRoute>
  )
}