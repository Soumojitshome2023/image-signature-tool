"use client"

import { useState, useRef, useEffect } from "react"

export default function SignaturePositioner({ signature }) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ width: 150, height: 100 })
  const sigRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    // Load the signature image to get its natural dimensions
    const img = new Image()
    img.onload = () => {
      // Calculate a reasonable default size (max 30% of container width)
      const containerWidth = containerRef.current?.offsetWidth || 600
      const maxWidth = containerWidth * 0.3

      let newWidth = img.width
      let newHeight = img.height

      if (newWidth > maxWidth) {
        const ratio = maxWidth / newWidth
        newWidth = maxWidth
        newHeight = img.height * ratio
      }

      setSize({ width: newWidth, height: newHeight })

      // Center the signature initially
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (containerRect) {
        setPosition({
          x: (containerRect.width - newWidth) / 2,
          y: (containerRect.height - newHeight) / 2,
        })
      }
    }
    img.src = signature
  }, [signature])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    setStartPos({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    // Calculate new position
    let newX = e.clientX - startPos.x
    let newY = e.clientY - startPos.y

    // Constrain to container bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - size.width))
    newY = Math.max(0, Math.min(newY, containerRect.height - size.height))

    setPosition({ x: newX, y: newY })
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    e.preventDefault()

    const touch = e.touches[0]
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    // Calculate new position
    let newX = touch.clientX - startPos.x
    let newY = touch.clientY - startPos.y

    // Constrain to container bounds
    newX = Math.max(0, Math.min(newX, containerRect.width - size.width))
    newY = Math.max(0, Math.min(newY, containerRect.height - size.height))

    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    // Add event listeners for mouse events
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    // Add event listeners for touch events
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, startPos]) // Add dependencies to ensure event handlers update

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div
        id="signature-element"
        ref={sigRef}
        className={`absolute cursor-move ${isDragging ? "opacity-80" : "opacity-100"}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          touchAction: "none",
          zIndex: 10,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img src={signature || "/placeholder.svg"} alt="Signature" className="w-full h-full object-contain" />
        <div className="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none"></div>
      </div>
    </div>
  )
}
