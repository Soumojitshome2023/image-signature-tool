"use client"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ImageUploader({ onImageUpload, imageType, acceptedTypes, required = false }) {
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // Pass file to parent component
    onImageUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  return (
    <div className="w-full">
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
            }`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm font-medium">
              Drag & drop your {imageType === "signature" ? "signature" : "image"} here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              {imageType === "signature" ? "PNG format only" : "Supports JPG, PNG, GIF"}
            </p>
            {required && <p className="text-xs text-red-500 mt-1">Required</p>}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={acceptedTypes} className="hidden" />
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden group">
          <img src={preview || "/placeholder.svg"} alt={`Uploaded ${imageType}`} className="w-full h-auto" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setPreview(null)
                fileInputRef.current.value = ""
              }}
            >
              Change {imageType === "signature" ? "Signature" : "Image"}
            </Button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={acceptedTypes} className="hidden" />
        </div>
      )}
    </div>
  )
}
