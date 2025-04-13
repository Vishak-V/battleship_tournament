import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Target, Ship, Crosshair } from "lucide-react"

interface Player {
  name: string
  score?: number
  hits?: number
  misses?: number
  accuracy?: number
  ships?: {
    total: number
    sunk: number
  }
}

interface MatchInfoProps {
  matchId?: string
  player1: Player
  player2: Player
  currentTurn?: number
  maxTurns?: number
  timeElapsed?: string
  className?: string
}

export function MatchInfo({
  matchId = "Unknown",
  player1,
  player2,
  currentTurn = 0,
  maxTurns = 100,
  timeElapsed = "00:00",
  className = "",
}: MatchInfoProps) {
  const formatAccuracy = (hits?: number, misses?: number) => {
    if (hits === undefined || misses === undefined) return "N/A"
    const total = hits + misses
    if (total === 0) return "0%"
    return `${Math.round((hits / total) * 100)}%`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Match #{matchId}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{timeElapsed}</span>
          <span className="text-xs">
            Turn {currentTurn}/{maxTurns}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-medium">{player1.name}</div>
            <div className="flex items-center gap-2 text-sm">
              <Ship className="h-4 w-4 text-muted-foreground" />
              <span>
                {player1.ships?.sunk ?? 0}/{player1.ships?.total ?? 5}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{player1.hits ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Crosshair className="h-4 w-4 text-muted-foreground" />
              <span>{formatAccuracy(player1.hits, player1.misses)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-right">{player2.name}</div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <span>
                {player2.ships?.sunk ?? 0}/{player2.ships?.total ?? 5}
              </span>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <span>{player2.hits ?? 0}</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-end gap-2 text-sm">
              <span>{formatAccuracy(player2.hits, player2.misses)}</span>
              <Crosshair className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="w-full flex justify-center">
          <Badge variant="outline" className="text-xs">
            {currentTurn % 2 === 0 ? player1.name : player2.name}'s turn
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}

