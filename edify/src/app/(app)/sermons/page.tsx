"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { searchSermons, type YouTubeSearchResult } from "@/lib/youtube"
import { PreacherSelector } from "@/components/sermons/preacher-selector"
import { SermonCard } from "@/components/sermons/sermon-card"
import { YouTubePlayer } from "@/components/sermons/youtube-player"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Loader2, X, FileText } from "lucide-react"

function SermonsContent() {
  const searchParams = useSearchParams()
  const [verseText, setVerseText] = useState(searchParams.get("verse") || "")
  const [selectedPreachers, setSelectedPreachers] = useState<string[]>([])
  const [results, setResults] = useState<YouTubeSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [player, setPlayer] = useState<{
    videoId: string; title: string; preacher: string; mode: "watch" | "listen"
  } | null>(null)
  const [summarySermon, setSummarySermon] = useState<YouTubeSearchResult | null>(null)
  const [summaryText, setSummaryText] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(false)

  const handleSearch = async () => {
    if (!verseText.trim() || selectedPreachers.length === 0) return
    setLoading(true)
    const sermons = await searchSermons(verseText, selectedPreachers)
    setResults(sermons)
    setLoading(false)
  }

  const handleSave = async (sermon: YouTubeSearchResult) => {
    const { saveSermon } = await import("@/lib/firestore")
    const { getAuth } = await import("firebase/auth")
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      await saveSermon({
        user_id: user.uid,
        video_id: sermon.videoId,
        title: sermon.title,
        preacher: sermon.preacher,
        verse_reference: verseText,
        created_at: new Date().toISOString(),
      })
    }
  }

  const handleViewSummary = async (sermon: YouTubeSearchResult) => {
    setSummarySermon(sermon)
    setSummaryText("")
    setSummaryLoading(true)
    try {
      const res = await fetch("/api/sermons/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: sermon.videoId,
          title: sermon.title,
          preacher: sermon.preacher,
          verseReference: verseText,
        }),
      })
      const data = await res.json()
      setSummaryText(data.summary || "Summary unavailable.")
    } catch {
      setSummaryText("Could not load summary. Please check your connection.")
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Sermon Finder</h1>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Verse or Topic</label>
            <Input
              placeholder="e.g. Philippians 4:13 - I can do all things..."
              value={verseText}
              onChange={(e) => setVerseText(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Select Preachers</label>
            <PreacherSelector
              selected={selectedPreachers}
              onChange={setSelectedPreachers}
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={!verseText.trim() || selectedPreachers.length === 0 || loading}
            className="w-full gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Searching..." : "Search Sermons"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Results ({results.length})</h2>
          {results.map((sermon) => (
            <SermonCard
              key={sermon.videoId}
              sermon={sermon}
              onWatch={() => setPlayer({ videoId: sermon.videoId, title: sermon.title, preacher: sermon.preacher, mode: "watch" })}
              onListen={() => setPlayer({ videoId: sermon.videoId, title: sermon.title, preacher: sermon.preacher, mode: "listen" })}
              onViewTranscript={() => handleViewSummary(sermon)}
              onSave={() => handleSave(sermon)}
            />
          ))}
        </div>
      )}

      {player && (
        <YouTubePlayer
          videoId={player.videoId}
          title={player.title}
          preacher={player.preacher}
          mode={player.mode}
          onClose={() => setPlayer(null)}
        />
      )}

      {/* Summary Modal */}
      {summarySermon && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setSummarySermon(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-base">Sermon Summary</h2>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSummarySermon(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <p className="font-medium text-sm line-clamp-2">{summarySermon.title}</p>
                <p className="text-xs text-muted-foreground">{summarySermon.preacher}</p>
              </div>

              <div className="min-h-[100px]">
                {summaryLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating summary…
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-foreground/90">{summaryText}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSummarySermon(null)
                    setPlayer({ videoId: summarySermon.videoId, title: summarySermon.title, preacher: summarySermon.preacher, mode: "watch" })
                  }}
                >
                  Watch Video
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSummarySermon(null)
                    setPlayer({ videoId: summarySermon.videoId, title: summarySermon.title, preacher: summarySermon.preacher, mode: "listen" })
                  }}
                >
                  Listen to Audio
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function SermonsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SermonsContent />
    </Suspense>
  )
}
