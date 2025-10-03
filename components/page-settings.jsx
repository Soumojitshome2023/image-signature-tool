"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PageSettings({
  useWhitePage,
  setUseWhitePage,
  pagePadding,
  setPagePadding,
  pageSize,
  setPageSize,
}) {
  const pageSizes = {
    a4: { width: 794, height: 1123 },
    a4_landscape: { width: 1123, height: 794 },
    letter: { width: 816, height: 1056 },
    letter_landscape: { width: 1056, height: 816 },
    legal: { width: 816, height: 1344 },
    legal_landscape: { width: 1344, height: 816 },
    square: { width: 1000, height: 1000 },
    tabloid: { width: 1056, height: 1632 },
    tabloid_landscape: { width: 1632, height: 1056 },
    executive: { width: 696, height: 1008 },
    executive_landscape: { width: 1008, height: 696 },
    a3: { width: 1123, height: 1587 },
    a3_landscape: { width: 1587, height: 1123 },
    a5: { width: 559, height: 794 },
    a5_landscape: { width: 794, height: 559 },
    b5: { width: 709, height: 1001 },
    b5_landscape: { width: 1001, height: 709 },
  }

  const [selectedPageSize, setSelectedPageSize] = useState("a4")

  const handlePageSizeChange = (value) => {
    setSelectedPageSize(value)
    setPageSize(pageSizes[value])
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Document Settings</CardTitle>
        <CardDescription>Configure how your document will be created</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="white-page-toggle" className="font-medium">
              Use White Page Background
            </Label>
            <p className="text-sm text-muted-foreground">Create a blank white page as the background</p>
          </div>
          <Switch id="white-page-toggle" checked={useWhitePage} onCheckedChange={setUseWhitePage} />
        </div>

        {useWhitePage && (
          <>
            <div className="space-y-2">
              <Label htmlFor="page-size">Page Size</Label>
              <Select value={selectedPageSize} onValueChange={handlePageSizeChange}>
                <SelectTrigger id="page-size">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(pageSizes).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase())} {/* Format names like "A4 Landscape" */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {pageSize.width} × {pageSize.height} pixels
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="padding-slider">Page Padding</Label>
                <span className="text-sm">{pagePadding}px</span>
              </div>
              <Slider
                id="padding-slider"
                min={0}
                max={500}
                step={5}
                value={[pagePadding]}
                onValueChange={(values) => setPagePadding(values[0])}
              />
              <p className="text-xs text-muted-foreground">
                Adjust the space between the edge of the page and your image
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
