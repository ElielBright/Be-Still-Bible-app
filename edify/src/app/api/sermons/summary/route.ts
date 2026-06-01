import { NextRequest, NextResponse } from "next/server"

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
const OLLAMA_API_KEY = process.env.NEXT_PUBLIC_OLLAMA_API_KEY
const OLLAMA_ENDPOINT = process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT || "https://api.ollama.com/v1"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { videoId, title, preacher, verseReference } = body

  if (!videoId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  let description = ""
  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${YOUTUBE_API_KEY}`
    )
    if (ytRes.ok) {
      const ytData = await ytRes.json()
      description = ytData.items?.[0]?.snippet?.description?.slice(0, 1200) || ""
    }
  } catch {
    // Proceed without description
  }

  const prompt = `You are a Bible study assistant helping a Christian understand a sermon.

Sermon Title: "${title}"
Preacher: ${preacher}
${verseReference ? `Related Verse/Topic: ${verseReference}` : ""}
${description ? `\nVideo Description:\n${description}` : ""}

Write a 4–6 sentence sermon summary covering:
1. The core biblical theme or message
2. Key scripture(s) likely explored
3. The spiritual takeaway or call to action
4. How it relates to the verse/topic mentioned

Be encouraging, faith-building, and concise.`

  try {
    const aiRes = await fetch(`${OLLAMA_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    if (!aiRes.ok) throw new Error("AI service unavailable")

    const aiData = await aiRes.json()
    const summary = aiData.choices?.[0]?.message?.content?.trim()
    if (!summary) throw new Error("Empty response")

    return NextResponse.json({ summary })
  } catch {
    const fallback = `This sermon by ${preacher} titled "${title}" explores the biblical truth${verseReference ? ` of ${verseReference}` : ""}. Drawing from Scripture, ${preacher} unpacks key themes to strengthen your faith and offer practical spiritual insight for daily living. Expect a word-centred message that challenges and encourages you to walk closer with God. Watch this sermon to be spiritually enriched and equipped.`
    return NextResponse.json({ summary: fallback })
  }
}
