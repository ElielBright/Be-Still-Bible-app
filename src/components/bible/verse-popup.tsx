"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, BookOpen, MessageSquare, StickyNote, Highlighter, Hash } from "lucide-react"

interface VersePopupProps {
  verse: { number: number; text: string }
  book: string
  chapter: number
  onSearchSermons: () => void
  onFindBooks: () => void
  onAskAI: () => void
  onAddNote: () => void
  onHighlight: () => void
  onShowCrossReferences: () => void
  onClose: () => void
}

export function VersePopup({
  verse,
  onSearchSermons,
  onFindBooks,
  onAskAI,
  onAddNote,
  onHighlight,
  onShowCrossReferences,
  onClose,
}: VersePopupProps) {
  const actions = [
    { icon: Search, label: "Search sermons", onClick: onSearchSermons, color: "text-blue-500" },
    { icon: BookOpen, label: "Find books", onClick: onFindBooks, color: "text-green-500" },
    { icon: MessageSquare, label: "Ask AI", onClick: onAskAI, color: "text-purple-500" },
    { icon: StickyNote, label: "Add note", onClick: onAddNote, color: "text-yellow-500" },
    { icon: Highlighter, label: "Highlight", onClick: onHighlight, color: "text-orange-500" },
    { icon: Hash, label: "Cross-references", onClick: onShowCrossReferences, color: "text-pink-500" },
  ]

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20"
        onClick={onClose}
      />
      <Card className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 shadow-xl">
        <CardContent className="p-4">
          <p className="mb-1 text-xs text-muted-foreground">Verse {verse.number}</p>
          <p className="mb-4 text-sm leading-relaxed">&ldquo;{verse.text}&rdquo;</p>
          <div className="grid grid-cols-3 gap-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3"
                  onClick={action.onClick}
                >
                  <Icon className={`h-4 w-4 ${action.color}`} />
                  <span className="text-[10px] leading-tight">{action.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
