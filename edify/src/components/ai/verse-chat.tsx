"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { chatWithAI, type AIChatMessage } from "@/lib/ollama"
import { cacheAIResponse, getCachedAIResponse } from "@/lib/offline"

const QUICK_PROMPTS = [
  "Explain this verse in simple, everyday language",
  "What does this verse mean for my life today?",
  "What do Bible scholars and theologians say about this?",
  "Connect this to financial wisdom or self-development principles",
  "Show me other verses that relate to this theme",
]

interface VerseChatProps {
  book: string
  chapter: number
  verse: number
  verseText: string
  onClose: () => void
}

export function VerseChat({ book, chapter, verse, verseText, onClose }: VerseChatProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const verseKey = `${book}:${chapter}:${verse}`
    getCachedAIResponse(verseKey).then((cached) => {
      if (cached) {
        setMessages([{ role: "assistant", content: cached }])
      }
    })
  }, [book, chapter, verse])

  const sendMessage = async (content: string) => {
    const userMessage: AIChatMessage = { role: "user", content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    const response = await chatWithAI(newMessages, {
      book,
      chapter,
      verse,
      text: verseText,
    })

    setMessages([...newMessages, { role: "assistant", content: response }])
    setLoading(false)

    const verseKey = `${book}:${chapter}:${verse}`
    await cacheAIResponse(verseKey, response)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <Card className="fixed bottom-20 right-4 z-50 flex h-[500px] w-full max-w-md flex-col shadow-xl">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">
            AI Chat &mdash; {book} {chapter}:{verse}
          </CardTitle>
          <p className="text-xs text-muted-foreground line-clamp-1">&ldquo;{verseText}&rdquo;</p>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Quick questions:</p>
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="block w-full rounded-lg border bg-muted/50 px-3 py-2 text-left text-xs hover:bg-muted transition-colors"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-8"
                  : "bg-muted mr-8"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (input.trim() && !loading) sendMessage(input.trim())
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this verse..."
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </>
  )
}
