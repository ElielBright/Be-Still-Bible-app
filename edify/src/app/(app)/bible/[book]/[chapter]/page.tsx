"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { BibleReader } from "@/components/bible/bible-reader"
import { BOOK_CHAPTER_COUNT } from "@/lib/bible-api"

export default function BibleChapterPage({
  params,
}: {
  params: Promise<{ book: string; chapter: string }>
}) {
  const { book, chapter } = use(params)
  const router = useRouter()
  const chapterNum = parseInt(chapter)
  const decodedBook = decodeURIComponent(book)

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
      onChapterChange={handleChapterChange}
      onNavigateBook={() => router.push("/bible")}
    />
  )
}
