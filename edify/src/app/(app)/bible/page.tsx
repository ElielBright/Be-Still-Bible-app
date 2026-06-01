"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BOOKS } from "@/lib/bible-api"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function BiblePage() {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filtered = BOOKS.filter((b) => b.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Choose a Book</h1>
      <Input
        placeholder="Search books..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((book) => (
          <Card
            key={book}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => router.push(`/bible/${encodeURIComponent(book)}/1`)}
          >
            <CardContent className="flex items-center gap-2 p-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{book}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
