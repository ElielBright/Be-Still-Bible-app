"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Headphones, FileText, Bookmark } from "lucide-react"
import type { YouTubeSearchResult } from "@/lib/youtube"

interface SermonCardProps {
  sermon: YouTubeSearchResult
  onWatch: () => void
  onListen: () => void
  onViewTranscript: () => void
  onSave: () => void
}

export function SermonCard({ sermon, onWatch, onListen, onViewTranscript, onSave }: SermonCardProps) {
  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    const hours = parseInt(match?.[1]?.replace("H", "") || "0")
    const minutes = parseInt(match?.[2]?.replace("M", "") || "0")
    const seconds = parseInt(match?.[3]?.replace("S", "") || "0")
    if (hours) return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatViews = (views: string) => {
    const num = parseInt(views)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return views
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-4 p-3">
        <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg">
          <img src={sermon.thumbnail} alt={sermon.title} className="h-full w-full object-cover" />
          <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
            {formatDuration(sermon.duration)}
          </span>
        </div>
        <CardContent className="flex-1 p-0">
          <h4 className="line-clamp-2 text-sm font-medium leading-tight">{sermon.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{sermon.preacher}</p>
          <p className="text-xs text-muted-foreground">{formatViews(sermon.viewCount)} views</p>
          <div className="mt-2 flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onWatch}>
              <Play className="h-3 w-3 mr-1" /> Watch
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onListen}>
              <Headphones className="h-3 w-3 mr-1" /> Audio
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onViewTranscript}>
              <FileText className="h-3 w-3 mr-1" /> Summary
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onSave}>
              <Bookmark className="h-3 w-3 mr-1" /> Save
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
