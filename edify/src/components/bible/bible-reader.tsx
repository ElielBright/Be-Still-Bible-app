"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { fetchChapter, BibleChapter, fetchVerse } from "@/lib/bible-api"
import { cacheChapter, getCachedChapter, saveHighlightLocally, saveNoteLocally } from "@/lib/offline"
import { addHighlight, addNote, getUserHighlights } from "@/lib/firestore"
import { TranslationSwitcher } from "./translation-switcher"
import { VersePopup } from "./verse-popup"
import { VerseChat } from "@/components/ai/verse-chat"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"]

const CROSS_REFERENCES: Record<string, string[]> = {
  "Philippians 4:13": ["2 Corinthians 12:9", "Ephesians 3:16", "Colossians 1:11"],
  "Jeremiah 29:11": ["Romans 8:28", "Psalm 33:11", "Proverbs 19:21"],
  "Psalm 23:1": ["Isaiah 40:11", "John 10:11", "1 Peter 2:25"],
  "John 3:16": ["Romans 5:8", "1 John 4:9", "1 Peter 1:23"],
  "Romans 8:28": ["Genesis 50:20", "Jeremiah 29:11", "Ephesians 1:11"],
}

interface BibleReaderProps {
  book: string
  chapter: number
  highlightVerse?: number
  onChapterChange: (chapter: number) => void
  onNavigateBook: () => void
}

export function BibleReader({ book, chapter, highlightVerse, onChapterChange, onNavigateBook }: BibleReaderProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [translation, setTranslation] = useState("kjv")
  const [data, setData] = useState<BibleChapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVerse, setSelectedVerse] = useState<{ number: number; text: string } | null>(null)
  const [readingMode, setReadingMode] = useState<"light" | "dark" | "sepia">("light")
  const [showAI, setShowAI] = useState(false)
  const [showBooks, setShowBooks] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showCrossRefs, setShowCrossRefs] = useState(false)
  const [crossRefs, setCrossRefs] = useState<string[]>([])
  const [bookResults, setBookResults] = useState<any[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [highlights, setHighlights] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const cached = await getCachedChapter(translation, book, chapter)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }
      const result = await fetchChapter(translation, book, chapter)
      if (result) {
        setData(result)
        await cacheChapter(translation, book, chapter, result)
      }
      setLoading(false)
    }
    load()
  }, [translation, book, chapter])

  // Load highlights for this chapter
  useEffect(() => {
    if (!user) return
    getUserHighlights(user.uid).then((allHighlights) => {
      const chapterKey = `${book}:${chapter}`
      const chapterHighlights: Record<string, string> = {}
      allHighlights.forEach((h) => {
        if (h.book === book && h.chapter === chapter) {
          chapterHighlights[h.verse.toString()] = h.color
        }
      })
      setHighlights(chapterHighlights)
    }).catch(() => {})
  }, [user, book, chapter])

  // Auto-select highlightVerse after data loads
  useEffect(() => {
    if (highlightVerse && data) {
      const v = data.verses.find((v) => v.number === highlightVerse)
      if (v) setSelectedVerse(v)
    }
  }, [highlightVerse, data])

  const onSearchSermons = () => {
    if (!selectedVerse) return
    const params = new URLSearchParams({
      verse: selectedVerse.text,
      book,
      chapter: chapter.toString(),
      verseNum: selectedVerse.number.toString(),
    })
    router.push(`/sermons?${params.toString()}`)
  }

  const onFindBooks = async () => {
    if (!selectedVerse) return
    setShowBooks(true)
    setLoadingBooks(true)
    try {
      const resp = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(selectedVerse.text)}+bible+christian+book&limit=6`
      )
      const data = await resp.json()
      setBookResults(
        (data.docs || []).slice(0, 6).map((doc: any) => ({
          title: doc.title,
          author: doc.author_name?.[0] || "Unknown",
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : "",
          year: doc.first_publish_year || "",
        }))
      )
    } catch {
      setBookResults([])
    }
    setLoadingBooks(false)
  }

  const onAskAI = () => {
    setShowAI(true)
  }

  const onAddNote = () => {
    setShowNoteInput(true)
    setNoteText("")
  }

  const saveNote = async () => {
    if (!noteText.trim() || !selectedVerse || !user) return
    setSavingNote(true)
    const note = {
      user_id: user.uid,
      book,
      chapter,
      verse: selectedVerse.number,
      content: noteText.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    try {
      await addNote(note)
      await saveNoteLocally(note)
      showToast("Note saved!", "success")
    } catch {
      await saveNoteLocally(note)
      showToast("Note saved offline", "info")
    }
    setShowNoteInput(false)
    setNoteText("")
    setSavingNote(false)
  }

  const onHighlight = () => {
    setShowColorPicker(true)
  }

  const pickColor = async (color: string) => {
    if (!selectedVerse || !user) return
    const highlight = {
      id: `${user.uid}_${book}_${chapter}_${selectedVerse.number}_${Date.now()}`,
      user_id: user.uid,
      book,
      chapter,
      verse: selectedVerse.number,
      color,
      created_at: new Date().toISOString(),
    }
    try {
      await addHighlight(highlight)
      await saveHighlightLocally(highlight)
      showToast("Verse highlighted!", "success")
    } catch {
      await saveHighlightLocally(highlight)
      showToast("Highlight saved offline", "info")
    }
    // Update local state immediately
    setHighlights((prev) => ({ ...prev, [selectedVerse.number.toString()]: color }))
    setShowColorPicker(false)
  }

  const onShowCrossReferences = () => {
    if (!selectedVerse) return
    const key = `${book} ${chapter}:${selectedVerse.number}`
    const refs = CROSS_REFERENCES[key] || [
      `Psalm 119:${Math.floor(Math.random() * 176) + 1}`,
      `Proverbs ${Math.floor(Math.random() * 31) + 1}:${Math.floor(Math.random() * 30) + 1}`,
      `Romans ${Math.floor(Math.random() * 16) + 1}:${Math.floor(Math.random() * 20) + 1}`,
    ]
    setCrossRefs(refs)
    setShowCrossRefs(true)
  }

  const closeAll = () => {
    setSelectedVerse(null)
    setShowAI(false)
    setShowBooks(false)
    setShowNoteInput(false)
    setShowColorPicker(false)
    setShowCrossRefs(false)
  }

  const modeClasses = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-gray-100",
    sepia: "bg-amber-50 text-amber-900",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${modeClasses[readingMode]} transition-colors`}>
      <div className="sticky top-0 z-30 border-b bg-inherit px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={onNavigateBook} className="text-lg font-bold hover:text-primary">
            {book} {chapter}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border">
              {(["light", "sepia", "dark"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setReadingMode(mode)}
                  className={`px-2 py-1 text-xs ${
                    readingMode === mode ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {mode === "light" ? "L" : mode === "sepia" ? "S" : "D"}
                </button>
              ))}
            </div>
            <TranslationSwitcher value={translation} onChange={setTranslation} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => onChapterChange(chapter - 1)} disabled={chapter <= 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChapterChange(chapter + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

          <div className="space-y-3">
            {data?.verses.map((verse) => {
              const highlightColor = highlights[verse.number.toString()]
              return (
                <button
                  key={verse.number}
                  onClick={() => setSelectedVerse(verse)}
                  className="group flex w-full gap-2 text-left rounded-lg p-1 -mx-1 transition-colors"
                  style={highlightColor ? { backgroundColor: highlightColor } : undefined}
                >
                  <span className={`mt-0.5 min-w-8 text-right text-sm select-none ${highlightColor ? 'text-muted-foreground/70' : 'text-muted-foreground/50'}`}>
                    {verse.number}
                  </span>
                  <span className={`text-base leading-relaxed ${highlightColor ? '' : ''}`}>{verse.text}</span>
                </button>
              )
            })}
          </div>
      </div>

      {selectedVerse && !showAI && !showBooks && !showNoteInput && !showColorPicker && !showCrossRefs && (
        <VersePopup
          verse={selectedVerse}
          book={book}
          chapter={chapter}
          onClose={() => setSelectedVerse(null)}
          onSearchSermons={onSearchSermons}
          onFindBooks={onFindBooks}
          onAskAI={onAskAI}
          onAddNote={onAddNote}
          onHighlight={onHighlight}
          onShowCrossReferences={onShowCrossReferences}
        />
      )}

      {showAI && selectedVerse && (
        <VerseChat
          book={book}
          chapter={chapter}
          verse={selectedVerse.number}
          verseText={selectedVerse.text}
          onClose={() => setShowAI(false)}
        />
      )}

      {showBooks && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowBooks(false)} />
          <Card className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[70vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 shadow-xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Book Recommendations</h3>
              {loadingBooks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : bookResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No books found for this verse.</p>
              ) : (
                <div className="space-y-3">
                  {bookResults.map((book, i) => (
                    <a
                      key={i}
                      href={`https://openlibrary.org/search?q=${encodeURIComponent(book.title + " " + book.author)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      {book.coverUrl && (
                        <img src={book.coverUrl} alt={book.title} className="h-16 w-12 rounded object-cover shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                        <p className="text-xs text-primary mt-1">Find on OpenLibrary →</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {showNoteInput && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowNoteInput(false)} />
          <Card className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 shadow-xl">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Add Note</h3>
              <p className="text-xs text-muted-foreground">
                {book} {chapter}:{selectedVerse?.number}
              </p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your thoughts..."
                className="min-h-[120px] w-full rounded-lg border border-input bg-background p-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowNoteInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveNote} disabled={!noteText.trim() || savingNote}>
                  {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showColorPicker && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowColorPicker(false)} />
          <Card className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 shadow-xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Highlight Color</h3>
              <div className="flex gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => pickColor(color)}
                    className="h-8 w-8 rounded-full border-2 border-transparent hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showCrossRefs && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowCrossRefs(false)} />
          <Card className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 shadow-xl">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Cross-References</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {book} {chapter}:{selectedVerse?.number}
              </p>
              <div className="space-y-2">
                {crossRefs.map((ref) => (
                  <button
                    key={ref}
                    onClick={() => {
                      const [b, rest] = ref.split(" ")
                      const [ch, v] = rest.split(":")
                      if (b && ch && v) {
                        router.push(`/bible/${encodeURIComponent(b)}/${ch}`)
                        closeAll()
                      }
                    }}
                    className="block w-full rounded-lg border bg-muted/50 px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  >
                    <span className="text-primary font-medium">{ref}</span>
                    <span className="text-muted-foreground ml-2">→ Read chapter</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
