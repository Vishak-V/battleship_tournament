"use client"

import { useEffect, useRef } from "react"

function FloatingPathsSimple({ position }: { position: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create paths
    const paths: {
      width: number
      opacity: number
      speed: number
      offset: number
      yOffset: number
    }[] = []

    for (let i = 0; i < 36; i++) {
      paths.push({
        width: 0.6 + i * 0.04,
        opacity: 0.12 + i * 0.012,
        speed: 0.5 + Math.random() * 0.5,
        offset: Math.random() * canvas.width,
        yOffset: -100 + i * 15 * position, // Spread paths vertically
      })
    }

    // Animation loop
    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      paths.forEach((path) => {
        path.offset += path.speed
        if (path.offset > canvas.width * 2) {
          path.offset = -canvas.width / 2
        }

        // Draw a curved line from top-left to bottom-right
        ctx.beginPath()

        // Calculate diagonal path
        const startX = path.offset - canvas.width
        const startY = path.yOffset

        const endX = startX + canvas.width
        const endY = startY + canvas.height * 0.7 // Diagonal to bottom right

        // Control points for the curve
        const cp1x = startX + canvas.width * 0.33
        const cp1y = startY + canvas.height * 0.2 + Math.sin(path.offset / 200) * 30

        const cp2x = startX + canvas.width * 0.66
        const cp2y = startY + canvas.height * 0.5 - Math.sin(path.offset / 180) * 30

        ctx.moveTo(startX, startY)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)

        ctx.strokeStyle = `rgba(158, 27, 50, ${path.opacity})`
        ctx.lineWidth = path.width
        ctx.stroke()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [position])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 3px rgba(158, 27, 50, 0.5))" }}
      />
    </div>
  )
}

export default FloatingPathsSimple

