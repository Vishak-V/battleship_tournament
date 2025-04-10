"use client"
import { useState, useEffect } from "react"
import { GameGrid } from "@/components/game-grid"

interface GameBoardProps {
  boardSize?: number
  playerBoard?: boolean
  ships?: any[]
  hits?: number[][]
  misses?: number[][]
  onCellClick?: (row: number, col: number) => void
  disabled?: boolean
}

export function GameBoard({
  boardSize = 10,
  playerBoard = false,
  ships = [],
  hits = [],
  misses = [],
  onCellClick,
  disabled = false,
}: GameBoardProps) {
  const [board, setBoard] = useState<string[][]>([])

  useEffect(() => {
    // Initialize empty board
    const newBoard = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill("empty"))

    // Place ships on board
    if (playerBoard) {
      ships.forEach((ship) => {
        if (ship.positions) {
          ship.positions.forEach((pos: [number, number]) => {
            const [row, col] = pos
            if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
              newBoard[row][col] = "ship"
            }
          })
        }
      })
    }

    // Mark hits
    hits.forEach((pos) => {
      const [row, col] = pos
      if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
        newBoard[row][col] = playerBoard ? "hit" : "enemy-hit"
      }
    })

    // Mark misses
    misses.forEach((pos) => {
      const [row, col] = pos
      if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
        newBoard[row][col] = "miss"
      }
    })

    setBoard(newBoard)
  }, [boardSize, playerBoard, ships, hits, misses])

  const handleCellClick = (row: number, col: number) => {
    if (disabled || playerBoard) return
    if (onCellClick) onCellClick(row, col)
  }

  return <GameGrid board={board} onCellClick={handleCellClick} />
}

