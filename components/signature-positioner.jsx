"use client"

import { useState, useRef, useEffect } from "react"

export default function SignaturePositioner({ signature }) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [size, setSize] = useState({ width: 150, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState("")
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })

  const sigRef = useRef(null)
  const containerRef = useRef(null)

  // Initialize signature size and position
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
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

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  // Handle mouse down for resizing
  const handleResizeStart = (e, handle) => {
    e.preventDefault()
    e.stopPropagation() // Prevent dragging when resizing
    setIsResizing(true)
    setResizeHandle(handle)
    setStartPos({
      x: e.clientX,
      y: e.clientY,
    })
    setStartSize({
      width: size.width,
      height: size.height,
    })
  }

  // Handle touch start for dragging
  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    setStartPos({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  // Handle touch start for resizing
  const handleTouchResizeStart = (e, handle) => {
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    setIsResizing(true)
    setResizeHandle(handle)
    setStartPos({
      x: touch.clientX,
      y: touch.clientY,
    })
    setStartSize({
      width: size.width,
      height: size.height,
    })
  }

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return
    e.preventDefault()

    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    if (isDragging) {
      // Handle dragging
      let newX = e.clientX - startPos.x
      let newY = e.clientY - startPos.y

      // Constrain to container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - size.width))
      newY = Math.max(0, Math.min(newY, containerRect.height - size.height))

      setPosition({ x: newX, y: newY })
    } else if (isResizing) {
      // Handle resizing based on which handle is being dragged
      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y

      let newWidth = startSize.width
      let newHeight = startSize.height
      let newX = position.x
      let newY = position.y

      const aspectRatio = startSize.width / startSize.height

      switch (resizeHandle) {
        case "top-left":
          newWidth = startSize.width - deltaX
          newHeight = newWidth / aspectRatio
          newX = position.x + deltaX
          newY = position.y + (startSize.height - newHeight)
          break
        case "top-right":
          newWidth = startSize.width + deltaX
          newHeight = newWidth / aspectRatio
          newY = position.y + (startSize.height - newHeight)
          break
        case "bottom-left":
          newWidth = startSize.width - deltaX
          newHeight = newWidth / aspectRatio
          newX = position.x + deltaX
          break
        case "bottom-right":
          newWidth = startSize.width + deltaX
          newHeight = newWidth / aspectRatio
          break
      }

      // Enforce minimum size
      const minSize = 30
      if (newWidth >= minSize && newHeight >= minSize) {
        // Ensure signature stays within container bounds
        if (
          newX >= 0 &&
          newY >= 0 &&
          newX + newWidth <= containerRect.width &&
          newY + newHeight <= containerRect.height
        ) {
          setSize({ width: newWidth, height: newHeight })
          setPosition({ x: newX, y: newY })
        }
      }
    }
  }

  // Handle touch move for dragging and resizing
  const handleTouchMove = (e) => {
    if (!isDragging && !isResizing) return
    e.preventDefault()

    const touch = e.touches[0]
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    if (isDragging) {
      // Handle dragging
      let newX = touch.clientX - startPos.x
      let newY = touch.clientY - startPos.y

      // Constrain to container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - size.width))
      newY = Math.max(0, Math.min(newY, containerRect.height - size.height))

      setPosition({ x: newX, y: newY })
    } else if (isResizing) {
      // Handle resizing based on which handle is being dragged
      const deltaX = touch.clientX - startPos.x
      const deltaY = touch.clientY - startPos.y

      let newWidth = startSize.width
      let newHeight = startSize.height
      let newX = position.x
      let newY = position.y

      const aspectRatio = startSize.width / startSize.height

      switch (resizeHandle) {
        case "top-left":
          newWidth = startSize.width - deltaX
          newHeight = newWidth / aspectRatio
          newX = position.x + deltaX
          newY = position.y + (startSize.height - newHeight)
          break
        case "top-right":
          newWidth = startSize.width + deltaX
          newHeight = newWidth / aspectRatio
          newY = position.y + (startSize.height - newHeight)
          break
        case "bottom-left":
          newWidth = startSize.width - deltaX
          newHeight = newWidth / aspectRatio
          newX = position.x + deltaX
          break
        case "bottom-right":
          newWidth = startSize.width + deltaX
          newHeight = newWidth / aspectRatio
          break
      }

      // Enforce minimum size
      const minSize = 30
      if (newWidth >= minSize && newHeight >= minSize) {
        // Ensure signature stays within container bounds
        if (
          newX >= 0 &&
          newY >= 0 &&
          newX + newWidth <= containerRect.width &&
          newY + newHeight <= containerRect.height
        ) {
          setSize({ width: newWidth, height: newHeight })
          setPosition({ x: newX, y: newY })
        }
      }
    }
  }

  // Handle mouse up to end dragging or resizing
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Handle touch end to end dragging or resizing
  const handleTouchEnd = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Set up and clean up event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, isResizing, startPos, startSize, position, size, resizeHandle])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div
        id="signature-element"
        ref={sigRef}
        className={`absolute cursor-move ${isDragging || isResizing ? "opacity-80" : "opacity-100"}`}
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
        <div className="absolute inset-0 border-2 border-dashed border-gray-400 pointer-events-none"></div>

        {/* Resize handles */}
        <div
          className="absolute w-4 h-4 bg-gray-500 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
          onMouseDown={(e) => handleResizeStart(e, "top-left")}
          onTouchStart={(e) => handleTouchResizeStart(e, "top-left")}
        ></div>
        <div
          className="absolute w-4 h-4 bg-gray-500 rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
          onMouseDown={(e) => handleResizeStart(e, "top-right")}
          onTouchStart={(e) => handleTouchResizeStart(e, "top-right")}
        ></div>
        <div
          className="absolute w-4 h-4 bg-gray-500 rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
          onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
          onTouchStart={(e) => handleTouchResizeStart(e, "bottom-left")}
        ></div>
        <div
          className="absolute w-4 h-4 bg-gray-500 rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
          onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
          onTouchStart={(e) => handleTouchResizeStart(e, "bottom-right")}
        ></div>
      </div>
    </div>
  )
}
