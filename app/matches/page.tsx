"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Eye, Repeat, PlusCircle, FileCode } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProtectedRoute } from "@/components/protected-route"
import { createMatch, listMatches, getMatch, rematch, Match } from "@/app/api/v2/matches/route"
import { listBots, Bot } from "@/app/api/v2/bots/route"

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [rematching, setRematching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Bots state
  const [bots, setBots] = useState<Bot[]>([])

  // New match form state (indices, 1-based)
  const [bot1Index, setBot1Index] = useState("")
  const [bot2Index, setBot2Index] = useState("")
  const [rounds, setRounds] = useState(3)

  // Fetch all matches
  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listMatches()
      setMatches(data)
    } catch (err: any) {
      setError(err.message || "Error fetching matches")
    } finally {
      setLoading(false)
    }
  }

  // Fetch all bots
  const fetchBots = async () => {
    setError(null)
    try {
      const data = await listBots()
      setBots(data)
    } catch (err: any) {
      setError(err.message || "Error fetching bots")
    }
  }

  // Fetch details for a single match
  const fetchMatchDetails = async (matchId: string) => {
    setError(null)
    try {
      const data = await getMatch(matchId)
      setSelectedMatch(data)
    } catch (err: any) {
      setError(err.message || "Error fetching match details")
    }
  }

  // Create a new match using bot indices
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      // Convert indices to numbers and adjust for 0-based array
      const idx1 = parseInt(bot1Index, 10) - 1
      const idx2 = parseInt(bot2Index, 10) - 1

      if (
        isNaN(idx1) || isNaN(idx2) ||
        idx1 < 0 || idx2 < 0 ||
        idx1 >= bots.length || idx2 >= bots.length
      ) {
        setError("Invalid bot indices")
        setCreating(false)
        return
      }
      if (idx1 === idx2) {
        setError("Please select two different bots")
        setCreating(false)
        return
      }

      const bot1_id = bots[idx1].id
      const bot2_id = bots[idx2].id

      await createMatch(bot1_id, bot2_id, rounds)
      setBot1Index("")
      setBot2Index("")
      setRounds(3)
      await fetchMatches()
    } catch (err: any) {
      setError(err.message || "Error creating match")
    } finally {
      setCreating(false)
    }
  }

  // Rematch
  const handleRematch = async (matchId: string) => {
    setRematching(matchId)
    setError(null)
    try {
      await rematch(matchId)
      await fetchMatches()
    } catch (err: any) {
      setError(err.message || "Error creating rematch")
    } finally {
      setRematching(null)
    }
  }

  useEffect(() => {
    fetchBots()
    fetchMatches()
    // eslint-disable-next-line
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a192f] text-gray-100">
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a192f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0a192f]/60">
          <div className="container flex h-14 items-center">
            <div className="flex items-center gap-2 font-bold ">
              <Repeat className="h-5 w-5" />
              Matches
            </div>
            <div className="flex flex-1 items-center justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={() => { fetchBots(); fetchMatches(); }}
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

          {/* Bots List Section */}
          <div className="rounded-lg border border-gray-800 bg-[#1a2942] shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Your Bots
                </h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              {bots.length === 0 ? (
                <p className="text-gray-400">No bots uploaded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="w-12 text-gray-300">Index</TableHead>
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Filename</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bots.map((bot, idx) => (
                      <TableRow key={bot.id} className="border-gray-800">
                        <TableCell className="font-medium text-gray-300">{idx + 1}</TableCell>
                        <TableCell className="text-gray-300">{bot.name}</TableCell>
                        <TableCell className="text-gray-300">{bot.filename}</TableCell>
                        <TableCell className="text-gray-300">
                          {bot.created_at ? new Date(bot.created_at).toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Create Match Section */}
          <div className="rounded-lg border border-gray-800 bg-[#1a2942] shadow-lg">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold leading-none tracking-tight ">Create New Match</h3>
              </div>
            </div>
            <form className="p-6 pt-0 space-y-4" onSubmit={handleCreateMatch}>
              <div className="flex gap-4 items-center flex-wrap">
                <Input
                  placeholder="Bot 1 Index"
                  value={bot1Index}
                  onChange={e => setBot1Index(e.target.value.replace(/[^0-9]/g, ""))}
                  className="bg-[#0a192f] border-gray-700 text-gray-300 w-32"
                  required
                  disabled={creating}
                  min={1}
                  max={bots.length}
                  type="number"
                />
                <Input
                  placeholder="Bot 2 Index"
                  value={bot2Index}
                  onChange={e => setBot2Index(e.target.value.replace(/[^0-9]/g, ""))}
                  className="bg-[#0a192f] border-gray-700 text-gray-300 w-32"
                  required
                  disabled={creating}
                  min={1}
                  max={bots.length}
                  type="number"
                />
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={rounds}
                  onChange={e => setRounds(Number(e.target.value))}
                  className="bg-[#0a192f] border-gray-700 text-gray-300 w-24"
                  required
                  disabled={creating}
                />
                <Button
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={creating}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {creating ? "Creating..." : "Create Match"}
                </Button>
              </div>
              <div className="text-xs text-gray-400 pt-2">
                Enter the <b>index</b> of each bot from the list above (e.g. 1 and 2 for the first and second bot).
              </div>
            </form>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="bg-[#1a2942] border-gray-800 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Matches Table */}
          <div className="rounded-lg border border-gray-800 bg-[#1a2942] shadow-lg">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 ">All Matches</h2>
              {matches.length === 0 ? (
                <p className="text-gray-400">No matches found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="w-12 text-gray-300">#</TableHead>
                      <TableHead className="text-gray-300">Bot 1</TableHead>
                      <TableHead className="text-gray-300">Bot 2</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Winner</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Completed</TableHead>
                      <TableHead className="text-right text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match, idx) => (
                      <TableRow key={match.id} className="border-gray-800">
                        <TableCell className="font-medium text-gray-300">{idx + 1}</TableCell>
                        <TableCell className="text-gray-300">{match.bot1?.name || match.bot1?.id}</TableCell>
                        <TableCell className="text-gray-300">{match.bot2?.name || match.bot2?.id}</TableCell>
                        <TableCell className="text-gray-300">{match.status}</TableCell>
                        <TableCell className="text-gray-300">{match.winner?.name || "-"}</TableCell>
                        <TableCell className="text-gray-300">
                          {match.created_at ? new Date(match.created_at).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {match.completed_at ? new Date(match.completed_at).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-right flex gap-2 justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => fetchMatchDetails(match.id)}
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
                                  onClick={() => handleRematch(match.id)}
                                  className="text-yellow-400 hover:text-yellow-300"
                                  disabled={rematching === match.id}
                                >
                                  <Repeat className={`h-4 w-4 ${rematching === match.id ? "animate-spin" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Rematch</TooltipContent>
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

          {/* Match Details */}
          {selectedMatch && (
            <div className="rounded-lg border border-gray-800 bg-[#1a2942] shadow-lg">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold ">Match Details</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedMatch(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    Close
                  </Button>
                </div>
                <div className="space-y-2 text-gray-200">
                  <div>
                    <span className="font-semibold">ID:</span> {selectedMatch.id}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {selectedMatch.status}
                  </div>
                  <div>
                    <span className="font-semibold">Bot 1:</span> {selectedMatch.bot1?.name} (Wins: {selectedMatch.bot1?.wins})
                  </div>
                  <div>
                    <span className="font-semibold">Bot 2:</span> {selectedMatch.bot2?.name} (Wins: {selectedMatch.bot2?.wins})
                  </div>
                  <div>
                    <span className="font-semibold">Winner:</span> {selectedMatch.winner?.name || "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span>{" "}
                    {selectedMatch.created_at ? new Date(selectedMatch.created_at).toLocaleString() : "-"}
                  </div>
                  <div>
                    <span className="font-semibold">Completed:</span>{" "}
                    {selectedMatch.completed_at ? new Date(selectedMatch.completed_at).toLocaleString() : "-"}
                  </div>
                  {/* Show game logs if present */}
                  {selectedMatch.game_logs && (
                    <div>
                      <span className="font-semibold">Game Logs:</span>
                      <pre className="bg-[#0a192f] border border-gray-700 rounded p-2 mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(selectedMatch.game_logs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}