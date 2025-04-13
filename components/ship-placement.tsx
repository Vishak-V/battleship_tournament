"use client"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"

interface Ship {
  id: number
  name: string
  size: number
  positions: number[][]
  orientation: "horizontal" | "vertical"
}

interface ShipPlacementProps {
  ships: Ship[]
  boardSize?: number
  onPlaceShip: (shipId: number, positions: number[][]) => void
  onRotateShip: (shipId: number) => void
  selectedShipId?: number
  onSelectShip: (shipId: number) => void
}

export function ShipPlacement({
  ships,
  boardSize = 10,
  onPlaceShip,
  onRotateShip,
  selectedShipId,
  onSelectShip,
}: ShipPlacementProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Place Your Ships</h3>
      <div className="space-y-2">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className={`flex items-center justify-between p-2 border rounded-md ${
              selectedShipId === ship.id ? "border-primary bg-primary/10" : ""
            }`}
            onClick={() => onSelectShip(ship.id)}
          >
            <div>
              <span className="font-medium">{ship.name}</span>
              <span className="text-sm text-muted-foreground ml-2">({ship.size})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRotateShip(ship.id)
              }}
              disabled={ship.positions.length > 0}
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Rotate
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

