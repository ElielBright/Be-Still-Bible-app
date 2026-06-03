import { NextRequest, NextResponse } from "next/server"

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const verseText = searchParams.get("verse")
  const book = searchParams.get("book")
  const chapter = searchParams.get("chapter")
  const verse = searchParams.get("verseNum")

  if (!verseText) {
    return NextResponse.json({ error: "Missing verse parameter" }, { status: 400 })
  }

  try {
    const response = await fetch("https://openlibrary.org/search.json", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: undefined,
    })

    const openLibraryResponse = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(verseText)}+bible+christian&limit=5`
    )
    const openLibraryData = await openLibraryResponse.json()

    const books = (openLibraryData.docs || []).slice(0, 5).map((doc: any) => ({
      title: doc.title,
      author: doc.author_name?.[0] || "Unknown",
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : "",
      description: doc.first_sentence?.[0] || "A Christian book recommendation",
      connection: `Related to ${book || "scripture"} ${chapter ? chapter + ":" : ""}${verse || ""}`,
      url: `https://openlibrary.org${doc.key}`,
      source: "christian" as const,
    }))

    return NextResponse.json({ books })
  } catch {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}
