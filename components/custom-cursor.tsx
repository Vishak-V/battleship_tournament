"use client"

import { useState, useEffect } from "react"

export function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Only run on client-side
        setIsVisible(true)

        // Track mouse position
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        // Track button hover state
        const handleMouseOver = (e: MouseEvent) => {
            if (
                e.target instanceof Element &&
                (e.target.tagName === "BUTTON" ||
                    e.target.closest("button") ||
                    e.target.closest("a") ||
                    e.target.closest("[role='button']") ||
                    e.target.closest(".cursor-pointer"))
            ) {
                setIsHovering(true)
            }
        }

        const handleMouseOut = (e: MouseEvent) => {
            if (
                e.target instanceof Element &&
                (e.target.tagName === "BUTTON" ||
                    e.target.closest("button") ||
                    e.target.closest("a") ||
                    e.target.closest("[role='button']") ||
                    e.target.closest(".cursor-pointer"))
            ) {
                setIsHovering(false)
            }
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseover", handleMouseOver)
        document.addEventListener("mouseout", handleMouseOut)

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseover", handleMouseOver)
            document.removeEventListener("mouseout", handleMouseOut)
        }
    }, [])

    // Don't render anything during SSR or if not visible yet
    if (!isVisible) return null

    return (
        <>
            {/* Main cursor */}
            <div
                className={`fixed pointer-events-none z-[9999] rounded-full ${isHovering ? "border-2 border-white bg-transparent w-6 h-6" : "bg-[#9E1B32] w-4 h-4"
                    }`}
                style={{
                    left: mousePosition.x - (isHovering ? 12 : 8),
                    top: mousePosition.y - (isHovering ? 12 : 8),
                    opacity: 1,
                    transition: "opacity 0.2s",
                }}
            />

            {/* Cursor trail */}
            <div
                className={`fixed pointer-events-none z-[9998] rounded-full bg-[#9E1B32] w-3 h-3 ${isHovering ? "opacity-0" : "opacity-30"
                    }`}
                style={{
                    left: mousePosition.x - 6,
                    top: mousePosition.y - 6,
                    transition: "opacity 0.2s",
                }}
            />
        </>
    )
}

