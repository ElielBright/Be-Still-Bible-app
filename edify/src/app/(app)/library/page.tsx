"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getSavedSermons, type SavedSermon } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, BookOpen, Download, Play, Headphones, ExternalLink, Trash2, Loader2 } from "lucide-react"
import { YouTubePlayer } from "@/components/sermons/youtube-player"
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function LibraryPage() {
  const { user } = useAuth()
  const [sermons, setSermons] = useState<SavedSermon[]>([])
  const [loading, setLoading] = useState(true)
  const [player, setPlayer] = useState<{ videoId: string; title: string; preacher: string; mode: "watch" | "listen" } | null>(null)
  const [books, setBooks] = useState<any[]>([])
  const [booksLoading, setBooksLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setLoading(true)
      getSavedSermons(user.uid).then((data) => {
        setSermons(data)
        setLoading(false)
      })
    }
  }, [user])

  useEffect(() => {
    const fetchBooks = async () => {
      setBooksLoading(true)
      try {
        const verses = [
          "faith hope love bible christian",
          "prayer spiritual growth bible study",
          "grace mercy redemption christian",
          "wisdom proverbs bible study",
        ]
        const randomVerse = verses[Math.floor(Math.random() * verses.length)]
        const resp = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(randomVerse)}&limit=6`
        )
        const data = await resp.json()
        setBooks(
          (data.docs || []).slice(0, 6).map((doc: any) => ({
            title: doc.title,
            author: doc.author_name?.[0] || "Unknown",
            coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : "",
            url: doc.key ? `https://openlibrary.org${doc.key}` : null,
          }))
        )
      } catch {}
      setBooksLoading(false)
    }
    fetchBooks()
  }, [])

  const handleDeleteSermon = async (sermonId: string) => {
    try {
      await deleteDoc(doc(db, "saved_sermons", sermonId))
      setSermons((prev) => prev.filter((s) => s.id !== sermonId))
    } catch {}
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">My Library</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Saved Sermons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : sermons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved sermons yet. Find sermons from the Bible reader or Sermon Finder.
              </p>
            ) : (
              <div className="space-y-2">
                {sermons.map((sermon) => (
                  <div key={sermon.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => setPlayer({ videoId: sermon.video_id, title: sermon.title, preacher: sermon.preacher, mode: "watch" })}
                          className="text-sm font-medium text-left hover:text-primary transition-colors line-clamp-2"
                        >
                          {sermon.title}
                        </button>
                        <p className="text-xs text-muted-foreground mt-0.5">{sermon.preacher}</p>
                        {sermon.verse_reference && (
                          <p className="text-xs text-primary/70 mt-0.5">{sermon.verse_reference}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSermon(sermon.id!)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => setPlayer({ videoId: sermon.video_id, title: sermon.title, preacher: sermon.preacher, mode: "watch" })}
                      >
                        <Play className="h-3 w-3 mr-1" /> Watch
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => setPlayer({ videoId: sermon.video_id, title: sermon.title, preacher: sermon.preacher, mode: "listen" })}
                      >
                        <Headphones className="h-3 w-3 mr-1" /> Audio
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Book Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {booksLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : books.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Highlight a verse in the Bible reader and tap &ldquo;Find books&rdquo; to get recommendations.
              </p>
            ) : (
              <div className="space-y-2">
                {books.map((bookItem, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border p-2">
                    {bookItem.coverUrl && (
                      <img src={bookItem.coverUrl} alt={bookItem.title} className="h-14 w-10 rounded object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{bookItem.title}</p>
                      <p className="text-xs text-muted-foreground">{bookItem.author}</p>
                      {bookItem.url && (
                        <a
                          href={bookItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                        >
                          View on OpenLibrary <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Downloaded audio sermons will appear here for offline listening.
            </p>
          </CardContent>
        </Card>
      </div>

      {player && (
        <YouTubePlayer
          videoId={player.videoId}
          title={player.title}
          preacher={player.preacher}
          mode={player.mode}
          onClose={() => setPlayer(null)}
        />
      )}
    </div>
  )
}
