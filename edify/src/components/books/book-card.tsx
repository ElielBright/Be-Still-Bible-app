"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface BookSuggestion {
  title: string
  author: string
  coverUrl: string
  description: string
  connection: string
  url: string
  source: "christian" | "self-development"
}

interface BookCardProps {
  book: BookSuggestion
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded border bg-muted">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No cover
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-0">
          <h4 className="text-sm font-medium line-clamp-2">{book.title}</h4>
          <p className="text-xs text-muted-foreground">{book.author}</p>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{book.description}</p>
          <p className="mt-1 text-xs italic text-primary/70 line-clamp-1">
            {book.connection}
          </p>
          <a href={book.url} target="_blank" rel="noopener noreferrer">
            <Button variant="link" size="sm" className="h-6 px-0 text-xs">
              Read free <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </a>
        </CardContent>
      </div>
    </Card>
  )
}
