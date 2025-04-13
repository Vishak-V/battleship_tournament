import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

type GameStatusType = "waiting" | "playing" | "won" | "lost" | "error"

interface GameStatusProps {
  status: GameStatusType
  message?: string
  className?: string
}

export function GameStatus({ status, message, className = "" }: GameStatusProps) {
  const getStatusDetails = () => {
    switch (status) {
      case "waiting":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: "Waiting",
          variant: "outline" as const,
        }
      case "playing":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          label: "In Progress",
          variant: "default" as const,
        }
      case "won":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Victory",
          variant: "success" as const,
        }
      case "lost":
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: "Defeat",
          variant: "destructive" as const,
        }
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Error",
          variant: "destructive" as const,
        }
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: "Unknown",
          variant: "outline" as const,
        }
    }
  }

  const { icon, label, variant } = getStatusDetails()

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Badge variant={variant} className="flex items-center gap-1 px-3 py-1">
        {icon}
        <span>{label}</span>
      </Badge>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}

