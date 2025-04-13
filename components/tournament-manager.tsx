"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Square, RotateCcw, Trophy, Users, Calendar, Clock } from "lucide-react"

interface Participant {
  id: number
  name: string
  author?: string
  score: number
  wins: number
  losses: number
  draws: number
  matches: number
  status: "idle" | "playing" | "completed"
}

interface Match {
  id: number
  player1Id: number
  player2Id: number
  winner?: number
  status: "pending" | "active" | "completed"
  turns?: number
}

interface TournamentManagerProps {
  tournamentId?: string
  tournamentName?: string
  participants: Participant[]
  matches?: Match[]
  onStart?: () => void
  onStop?: () => void
  onReset?: () => void
  isActive?: boolean
  progress?: number
  startDate?: Date
  endDate?: Date
  className?: string
}

export function TournamentManager({
  tournamentId = "T-1",
  tournamentName = "Battleship Tournament",
  participants = [],
  matches = [],
  onStart,
  onStop,
  onReset,
  isActive = false,
  progress = 0,
  startDate,
  endDate,
  className = "",
}: TournamentManagerProps) {
  const [sortedParticipants, setSortedParticipants] = useState<Participant[]>([])

  useEffect(() => {
    // Sort participants by score, then by wins
    const sorted = [...participants].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return b.wins - a.wins
    })
    setSortedParticipants(sorted)
  }, [participants])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "idle":
        return <Badge variant="outline">Idle</Badge>
      case "playing":
        return <Badge variant="secondary">Playing</Badge>
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "active":
        return <Badge variant="secondary">Active</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{tournamentName}</CardTitle>
              <CardDescription>ID: {tournamentId}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onStart} disabled={isActive} variant="default" className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                Start
              </Button>
              <Button onClick={onStop} disabled={!isActive} variant="destructive" className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                Stop
              </Button>
              <Button onClick={onReset} variant="outline" className="flex items-center gap-1">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString() || "Ongoing"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{participants.length} Participants</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {matches?.filter((m) => m.status === "completed").length || 0}/{matches?.length || 0} Matches
                  Completed
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tournament Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Bot</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">W</TableHead>
                <TableHead className="text-right">L</TableHead>
                <TableHead className="text-right">D</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedParticipants.map((participant, index) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div>{participant.name}</div>
                      {participant.author && (
                        <div className="text-xs text-muted-foreground">by {participant.author}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{participant.score}</TableCell>
                  <TableCell className="text-right">{participant.wins}</TableCell>
                  <TableCell className="text-right">{participant.losses}</TableCell>
                  <TableCell className="text-right">{participant.draws}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(participant.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

