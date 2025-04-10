"use client"

import { motion } from "framer-motion"

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    // Increased vertical spacing by using i * 5 instead of i * 3 for y-coordinates
    // This spreads the paths further apart vertically while keeping them horizontal
    d: `M-${380 - i * 5 * position} -${189 + i * 5}C-${
      380 - i * 5 * position
    } -${189 + i * 5} -${312 - i * 5 * position} ${216 - i * 5} ${
      152 - i * 5 * position
    } ${243 - i * 5}C${616 - i * 5 * position} ${320 - i * 5} ${
      684 - i * 5 * position
    } ${600 - i * 5} ${684 - i * 5 * position} ${600 - i * 5}`,
    width: 0.6 + i * 0.04, // Keeping the increased stroke width for glow
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full text-crimson"
        viewBox="0 0 696 600"
        fill="none"
        style={{
          filter: "drop-shadow(0 0 3px rgba(158, 27, 50, 0.5))",
        }}
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.12 + path.id * 0.012}
            initial={{ pathLength: 0.3, opacity: 0.7 }}
            animate={{
              pathLength: 1,
              opacity: [0.4, 0.7, 0.4],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default FloatingPaths

