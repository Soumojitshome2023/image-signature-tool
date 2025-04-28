"use client"

import { useState } from "react"
import ImageUploader from "@/components/image-uploader"
import SignaturePositioner from "@/components/signature-positioner"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function Home() {
  const [mainImage, setMainImage] = useState(null)
  const [signature, setSignature] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)

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
    if (!mainImage || !signature) return

    setIsDownloading(true)

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const mainImg = new Image()

    mainImg.onload = () => {
      canvas.width = mainImg.width
      canvas.height = mainImg.height
      ctx.drawImage(mainImg, 0, 0)

      const sigImg = new Image()
      sigImg.crossOrigin = "anonymous"

      sigImg.onload = () => {
        const sigPosition = document.getElementById("signature-element").getBoundingClientRect()
        const mainImgPosition = document.getElementById("main-image-container").getBoundingClientRect()

        // Calculate the position relative to the main image
        const relativeLeft = sigPosition.left - mainImgPosition.left
        const relativeTop = sigPosition.top - mainImgPosition.top

        // Scale the position to match the actual image dimensions
        const scaleX = mainImg.width / mainImgPosition.width
        const scaleY = mainImg.height / mainImgPosition.height

        const scaledLeft = relativeLeft * scaleX
        const scaledTop = relativeTop * scaleY
        const scaledWidth = sigPosition.width * scaleX
        const scaledHeight = sigPosition.height * scaleY

        ctx.drawImage(sigImg, scaledLeft, scaledTop, scaledWidth, scaledHeight)

        // Create download link
        const link = document.createElement("a")
        link.download = "signed-image.png"
        link.href = canvas.toDataURL("image/png")
        link.click()

        setIsDownloading(false)
      }

      sigImg.src = signature
    }

    mainImg.src = mainImage
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Image Signature Tool
          <span className="mt-2 block text-lg text-center">
            (Designed by
            <a
              href="https://soumojitshomeblog.vercel.app/"
              className="ml-2 text-white underline hover:text-yellow-300 transition"
              target="_blank"
            >
              Soumojit Shome
            </a>{" "}
            )
          </span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Main Image</h2>
            <ImageUploader onImageUpload={handleMainImageUpload} imageType="main" acceptedTypes="image/*" />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Signature (PNG)</h2>
            <ImageUploader onImageUpload={handleSignatureUpload} imageType="signature" acceptedTypes="image/png" />
          </div>
        </div>

        {mainImage && signature && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Position Your Signature</h2>
            <p className="text-sm text-gray-500 mb-4">Drag the signature to position it on the image</p>

            <div className="relative border rounded-lg overflow-hidden" id="main-image-container">
              <img src={mainImage || "/placeholder.svg"} alt="Main uploaded image" className="w-full h-auto" />

              <SignaturePositioner signature={signature} />
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2">
                <Download size={18} />
                {isDownloading ? "Processing..." : "Download Signed Image"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
