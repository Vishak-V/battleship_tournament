"use client"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Pause, SkipForward } from "lucide-react"

interface GameControlsProps {
  onStart?: () => void
  onPause?: () => void
  onReset?: () => void
  onSkip?: () => void
  isPlaying?: boolean
  canStart?: boolean
  canPause?: boolean
  canReset?: boolean
  canSkip?: boolean
}

export function GameControls({
  onStart,
  onPause,
  onReset,
  onSkip,
  isPlaying = false,
  canStart = true,
  canPause = true,
  canReset = true,
  canSkip = true,
}: GameControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {isPlaying ? (
        <Button variant="outline" size="icon" onClick={onPause} disabled={!canPause} title="Pause" aria-label="Pause">
          <Pause className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="outline" size="icon" onClick={onStart} disabled={!canStart} title="Start" aria-label="Start">
          <Play className="h-4 w-4" />
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={onReset} disabled={!canReset} title="Reset" aria-label="Reset">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onSkip} disabled={!canSkip} title="Skip" aria-label="Skip">
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  )
}

