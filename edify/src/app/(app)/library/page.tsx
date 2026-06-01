"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getSavedSermons, type SavedSermon } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bookmark, BookOpen, Download } from "lucide-react"

export default function LibraryPage() {
  const { user } = useAuth()
  const [sermons, setSermons] = useState<SavedSermon[]>([])

  useEffect(() => {
    if (user) {
      getSavedSermons(user.uid).then(setSermons)
    }
  }, [user])

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
            {sermons.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved sermons yet. Find sermons from the Bible reader.</p>
            ) : (
              <div className="space-y-2">
                {sermons.map((sermon) => (
                  <div key={sermon.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{sermon.title}</p>
                    <p className="text-xs text-muted-foreground">{sermon.preacher}</p>
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
            <p className="text-sm text-muted-foreground">
              Book recommendations appear when you interact with a verse. Highlight a verse and tap &ldquo;Find books&rdquo;.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Downloaded sermons and offline content will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
