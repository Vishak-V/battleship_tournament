"use client"

interface GameGridProps {
  board: string[][]
  onCellClick?: (row: number, col: number) => void
}

export function GameGrid({ board, onCellClick }: GameGridProps) {
  const getCellClass = (cellType: string) => {
    switch (cellType) {
      case "ship":
        return "bg-blue-500"
      case "hit":
        return "bg-red-500"
      case "enemy-hit":
        return "bg-orange-500"
      case "miss":
        return "bg-gray-300"
      default:
        return "bg-slate-200 hover:bg-slate-300"
    }
  }

  return (
    <div className="grid grid-cols-10 gap-1 p-2 bg-slate-100 rounded-lg">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`aspect-square w-full ${getCellClass(cell)} rounded-sm cursor-pointer transition-colors`}
            onClick={() => onCellClick && onCellClick(rowIndex, colIndex)}
            aria-label={`Grid cell ${String.fromCharCode(65 + rowIndex)}${colIndex + 1}, ${cell}`}
          />
        )),
      )}
    </div>
  )
}

