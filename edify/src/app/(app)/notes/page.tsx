"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getUserNotes, type Note } from "@/lib/firestore"
import { getLocalNotes } from "@/lib/offline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StickyNote } from "lucide-react"

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [isOnline, setIsOnline] = useState(true)

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
    const loadNotes = async () => {
      if (user && navigator.onLine) {
        const data = await getUserNotes(user.uid)
        setNotes(data)
      } else {
        const local = await getLocalNotes()
        setNotes(local)
      }
    }
    loadNotes()
  }, [user])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Notes & Highlights</h1>
        {!isOnline && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">Offline</span>
        )}
      </div>

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
                  <p className="text-xs text-muted-foreground">
                    {note.book} {note.chapter}:{note.verse}
                  </p>
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
    </div>
  )
}
