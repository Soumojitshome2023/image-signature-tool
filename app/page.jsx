"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Settings } from "lucide-react"
import PageSettings from "@/components/page-settings"
import ImageUploader from "@/components/image-uploader"
import SignaturePositioner from "@/components/signature-positioner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function Home() {
  const [mainImage, setMainImage] = useState(null)
  const [signature, setSignature] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [useWhitePage, setUseWhitePage] = useState(false)
  const [pagePadding, setPagePadding] = useState(40)
  const [pageSize, setPageSize] = useState({ width: 794, height: 1123 }) // A4 size in pixels at 96 DPI
  const [showSettings, setShowSettings] = useState(false)

  const handleMainImageUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setMainImage(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSignatureUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setSignature(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDownload = () => {
    if (!signature) return
    if (!mainImage && !useWhitePage) return

    setIsDownloading(true)

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Set canvas size based on whether we're using a white page or the main image
    if (useWhitePage) {
      canvas.width = pageSize.width
      canvas.height = pageSize.height

      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // If there's a main image, draw it with padding
      if (mainImage) {
        const mainImg = new Image()
        mainImg.crossOrigin = "anonymous"

        mainImg.onload = () => {
          // Calculate dimensions to maintain aspect ratio within padding
          const availableWidth = pageSize.width - pagePadding * 2
          const availableHeight = pageSize.height - pagePadding * 2

          const imgRatio = mainImg.width / mainImg.height
          let drawWidth, drawHeight

          if (imgRatio > availableWidth / availableHeight) {
            // Image is wider than available space (relative to height)
            drawWidth = availableWidth
            drawHeight = drawWidth / imgRatio
          } else {
            // Image is taller than available space (relative to width)
            drawHeight = availableHeight
            drawWidth = drawHeight * imgRatio
          }

          // Center the image within the available space
          const drawX = pagePadding + (availableWidth - drawWidth) / 2
          const drawY = pagePadding + (availableHeight - drawHeight) / 2

          ctx.drawImage(mainImg, drawX, drawY, drawWidth, drawHeight)

          // Now draw the signature
          drawSignature(ctx, canvas.width, canvas.height)
        }

        mainImg.src = mainImage
      } else {
        // Just draw the signature on the white page
        drawSignature(ctx, canvas.width, canvas.height)
      }
    } else {
      // Using just the main image as background
      const mainImg = new Image()
      mainImg.crossOrigin = "anonymous"

      mainImg.onload = () => {
        canvas.width = mainImg.width
        canvas.height = mainImg.height
        ctx.drawImage(mainImg, 0, 0)

        // Draw the signature
        drawSignature(ctx, canvas.width, canvas.height)
      }

      mainImg.src = mainImage
    }

    function drawSignature(ctx, canvasWidth, canvasHeight) {
      const sigImg = new Image()
      sigImg.crossOrigin = "anonymous"

      sigImg.onload = () => {
        const sigElement = document.getElementById("signature-element")
        const containerElement = document.getElementById("main-image-container")

        if (!sigElement || !containerElement) {
          setIsDownloading(false)
          return
        }

        const sigRect = sigElement.getBoundingClientRect()
        const containerRect = containerElement.getBoundingClientRect()

        // Calculate the position relative to the container
        const relativeLeft = sigRect.left - containerRect.left
        const relativeTop = sigRect.top - containerRect.top

        // Scale the position to match the actual canvas dimensions
        const scaleX = canvasWidth / containerRect.width
        const scaleY = canvasHeight / containerRect.height

        const scaledLeft = relativeLeft * scaleX
        const scaledTop = relativeTop * scaleY
        const scaledWidth = sigRect.width * scaleX
        const scaledHeight = sigRect.height * scaleY

        ctx.drawImage(sigImg, scaledLeft, scaledTop, scaledWidth, scaledHeight)

        // Create download link
        const link = document.createElement("a")
        link.download = "signed-document.png"
        link.href = canvas.toDataURL("image/png")
        link.click()

        setIsDownloading(false)
      }

      sigImg.src = signature
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Image Signature Tool</h1>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)} className="ml-2">
            <Settings size={18} />
            <span className="sr-only">Settings</span>
          </Button>
        </div>

        {showSettings && (
          <PageSettings
            useWhitePage={useWhitePage}
            setUseWhitePage={setUseWhitePage}
            pagePadding={pagePadding}
            setPagePadding={setPagePadding}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        )}

        <Tabs defaultValue="upload" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Images</TabsTrigger>
            <TabsTrigger value="position" disabled={!signature || (!mainImage && !useWhitePage)}>
              Position Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Main Image</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {useWhitePage ? "Optional: Add an image to the white page" : "Required: Upload your main document"}
                </p>
                <ImageUploader
                  onImageUpload={handleMainImageUpload}
                  imageType="main"
                  acceptedTypes="image/*"
                  required={!useWhitePage}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Signature (PNG)</h2>
                <p className="text-sm text-gray-500 mb-4">Required: Upload your signature image</p>
                <ImageUploader
                  onImageUpload={handleSignatureUpload}
                  imageType="signature"
                  // acceptedTypes="image/png"
                  acceptedTypes="image/*"
                  required={true}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="position" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Position & Resize Your Signature</h2>
            <p className="text-sm text-gray-500 mb-4">Drag to position. Use the corner handles to resize.</p>

            <div
              className="relative rounded-lg overflow-hidden bg-white border-2 border-red-900"
              id="main-image-container"
              style={{
                width: "100%",
                height: useWhitePage ? `${pageSize.height}px` : "auto",
                aspectRatio: useWhitePage ? `${pageSize.width} / ${pageSize.height}` : "auto",
              }}
            >
              {useWhitePage ? (
                mainImage ? (
                  <div
                    className="absolute border-2 border-red-900"
                    style={{
                      inset: `${pagePadding}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={mainImage || "/placeholder.svg"}
                      alt="Main uploaded image"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">White Page</div>
                )
              ) : (
                <img src={mainImage || "/placeholder.svg"} alt="Main uploaded image" className="w-full h-auto" />
              )}

              {signature && <SignaturePositioner signature={signature} />}
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2">
                <Download size={18} />
                {isDownloading ? "Processing..." : "Download Signed Document"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
