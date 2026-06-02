"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { BibleReader } from "@/components/bible/bible-reader"
import { BOOK_CHAPTER_COUNT } from "@/lib/bible-api"

export default function BibleChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ book: string; chapter: string }>
  searchParams: Promise<{ verse?: string }>
}) {
  const { book, chapter } = use(params)
  const { verse } = use(searchParams)
  const router = useRouter()
  const chapterNum = parseInt(chapter)
  const decodedBook = decodeURIComponent(book)
  const highlightVerse = verse ? parseInt(verse) : undefined

  const handleChapterChange = (newChapter: number) => {
    const maxChapter = BOOK_CHAPTER_COUNT[decodedBook]
    if (newChapter < 1) return
    if (maxChapter && newChapter > maxChapter) return
    router.push(`/bible/${encodeURIComponent(decodedBook)}/${newChapter}`)
  }

  return (
    <BibleReader
      book={decodedBook}
      chapter={chapterNum}
      highlightVerse={highlightVerse}
      onChapterChange={handleChapterChange}
      onNavigateBook={() => router.push("/bible")}
    />
  )
}
