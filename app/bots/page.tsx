"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileCode, Trash2, Eye, UploadCloud, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProtectedRoute } from "@/components/protected-route"
import { listBots, uploadBot, getBot, deleteBot } from "@/app/api/v2/bots/route" // Import the API client methods

interface Bot {
  id: string
  name: string
  filename?: string
  created_at?: string
  [key: string]: any // for extra fields
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all bots
  const fetchBots = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listBots()
      setBots(data)
    } catch (err: any) {
      setError(err.message || "Error fetching bots")
    } finally {
      setLoading(false)
    }
  }

  // Fetch details for a single bot
  const fetchBotDetails = async (bot_id: string) => {
    setError(null)
    try {
      const data = await getBot(bot_id)
      setSelectedBot(data)
    } catch (err: any) {
      setError(err.message || "Error fetching bot details")
    }
  }

  // Upload a new bot
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return
    setUploading(true)
    setError(null)
    const file = event.target.files[0]
    try {
      await uploadBot(file, file.name)
      await fetchBots()
    } catch (err: any) {
      setError(err.message || "Error uploading bot")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Delete a bot
  const handleDelete = async (bot_id: string) => {
    setError(null)
    try {
      await deleteBot(bot_id)
      await fetchBots()
      if (selectedBot && selectedBot.id === bot_id) setSelectedBot(null)
    } catch (err: any) {
      setError(err.message || "Error deleting bot")
    }
  }

  useEffect(() => {
    fetchBots()
    // eslint-disable-next-line
  }, [])

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a192f] text-gray-100">
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a192f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a192f]/60">
          <div className="container flex h-14 items-center">
            <div className="flex items-center gap-2 font-bold ">
              <FileCode className="h-5 w-5" />
              My Bots
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={fetchBots}
                className="text-gray-400 hover:text-gray-300"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-6 space-y-8">
          {/* Upload Section */}
          <div className="rounded-lg border border-gray-800 bg-[#1a2942] shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold leading-none tracking-tight ">Upload New Bot</h3>
              </div>
            </div>
            <div className="p-6 pt-0 space-y-4">
              <div className="flex gap-4 items-center">
                <Input
                  type="file"
                  accept=".py"
                  onChange={handleUpload}
                  ref={fileInputRef}
                  className="cursor-pointer bg-[#0a192f] border-gray-700 text-gray-300"
                  disabled={uploading}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={uploading}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Select Bot"}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="bg-[#1a2942] border-gray-800 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Bots Table */}
          <div className="rounded-lg border border-gray-800 bg-[#1a2942] shadow-lg">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 ">Your Bots</h2>
              {bots.length === 0 ? (
                <p className="text-gray-400">No bots uploaded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="w-12 text-gray-300">#</TableHead>
                      <TableHead className="text-gray-300">Bot Name</TableHead>
                      <TableHead className="text-gray-300">File</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-right text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bots.map((bot, idx) => (
                      <TableRow key={bot.id} className="border-gray-800">
                        <TableCell className="font-medium text-gray-300">{idx + 1}</TableCell>
                        <TableCell>
                          <span className="text-gray-300 flex items-center gap-2">
                            <FileCode className="h-4 w-4 " />
                            {bot.name || bot.filename || bot.id}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-300">{bot.filename || "-"}</TableCell>
                        <TableCell className="text-gray-300">
                          {bot.created_at ? new Date(bot.created_at).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => fetchBotDetails(bot.id)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Details</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(bot.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Bot</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Bot Details */}
          {selectedBot && (
            <div className="rounded-lg border border-gray-800 bg-[#1a2942] shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold ">Bot Details</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedBot(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    Close
                  </Button>
                </div>
                <div className="space-y-2 text-gray-200">
                  <div>
                    <span className="font-semibold">ID:</span> {selectedBot.id}
                  </div>
                  <div>
                    <span className="font-semibold">Name:</span> {selectedBot.name || selectedBot.filename}
                  </div>
                  <div>
                    <span className="font-semibold">File:</span> {selectedBot.filename}
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span>{" "}
                    {selectedBot.created_at ? new Date(selectedBot.created_at).toLocaleString() : "-"}
                  </div>
                  {/* Show all other fields */}
                  {Object.entries(selectedBot)
                    .filter(([key]) => !["id", "name", "filename", "created_at"].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <span className="font-semibold">{key}:</span> {String(value)}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}