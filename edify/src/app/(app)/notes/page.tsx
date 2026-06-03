"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getUserNotes, getUserHighlights, updateNote, type Note, type Highlight } from "@/lib/firestore"
import { getLocalNotes, getLocalHighlights } from "@/lib/offline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { StickyNote, Highlighter, Pencil, Trash2, BookOpen, X, Loader2 } from "lucide-react"
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function NotesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [tab, setTab] = useState<"notes" | "highlights">("notes")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editContent, setEditContent] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      if (user && navigator.onLine) {
        const [noteData, highlightData] = await Promise.all([
          getUserNotes(user.uid),
          getUserHighlights(user.uid),
        ])
        setNotes(noteData)
        setHighlights(highlightData)
      } else {
        const [localNotes, localHighlights] = await Promise.all([
          getLocalNotes(),
          getLocalHighlights(),
        ])
        setNotes(localNotes)
        setHighlights(localHighlights)
      }
    }
    load()
  }, [user])

  const handleEdit = async () => {
    if (!editingNote?.id || !editContent.trim() || !user) return
    setSaving(true)
    try {
      await updateNote(editingNote.id, { content: editContent.trim(), updated_at: new Date().toISOString() })
      setEditingNote(null)
      setEditContent("")
      const refreshed = await getUserNotes(user.uid)
      setNotes(refreshed)
    } catch {}
    setSaving(false)
  }

  const handleDelete = async (noteId: string) => {
    if (!user) return
    try {
      await deleteDoc(doc(db, "notes", noteId))
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } catch {}
  }

  const navigateToVerse = (book: string, chapter: number, verse?: number) => {
    const path = `/bible/${encodeURIComponent(book)}/${chapter}${verse ? `?verse=${verse}` : ""}`
    router.push(path)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Notes & Highlights</h1>
        {!isOnline && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">Offline</span>
        )}
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab("notes")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "notes" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <StickyNote className="h-4 w-4" />
          Notes ({notes.length})
        </button>
        <button
          onClick={() => setTab("highlights")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "highlights" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Highlighter className="h-4 w-4" />
          Highlights ({highlights.length})
        </button>
      </div>

      {tab === "notes" && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Journal Feed</CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No notes yet. Tap a verse in the Bible reader and select &ldquo;Add note&rdquo; to start journalling.
              </p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => navigateToVerse(note.book, note.chapter, note.verse)}
                        className="text-xs text-primary hover:underline text-left shrink-0"
                      >
                        {note.book} {note.chapter}:{note.verse}
                      </button>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingNote(note); setEditContent(note.content) }}
                          className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent"
                          title="Edit note"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id!)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete note"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm">{note.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "highlights" && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Highlighter className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Highlighted Verses</CardTitle>
          </CardHeader>
          <CardContent>
            {highlights.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No highlights yet. Tap a verse in the Bible reader and select &ldquo;Highlight&rdquo; to save it.
              </p>
            ) : (
              <div className="space-y-2">
                {highlights.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => navigateToVerse(h.book, h.chapter, h.verse)}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="h-8 w-8 shrink-0 rounded" style={{ backgroundColor: h.color }} />
                    <div>
                      <p className="text-sm font-medium">
                        {h.book} {h.chapter}:{h.verse}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <BookOpen className="ml-auto h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {editingNote && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setEditingNote(null)} />
          <Card className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 shadow-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Edit Note</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingNote(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {editingNote.book} {editingNote.chapter}:{editingNote.verse}
              </p>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your thoughts..."
                className="min-h-[120px] w-full rounded-lg border border-input bg-background p-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEdit} disabled={!editContent.trim() || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
