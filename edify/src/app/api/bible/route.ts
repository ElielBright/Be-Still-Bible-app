import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const translationId = searchParams.get("translation") || "kjv"
  const book = searchParams.get("book")
  const chapter = searchParams.get("chapter")

  if (!book || !chapter) {
    return NextResponse.json({ error: "Missing required params: book, chapter" }, { status: 400 })
  }

  try {
    const resp = await fetch(
      `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?verse-numbers=true`
    )
    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to fetch chapter" }, { status: resp.status })
    }
    const data = await resp.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
