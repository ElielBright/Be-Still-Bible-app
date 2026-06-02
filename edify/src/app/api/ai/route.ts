import { NextRequest, NextResponse } from "next/server"

const OLLAMA_API_KEY = process.env.NEXT_PUBLIC_OLLAMA_API_KEY
const OLLAMA_BASE = "https://api.ollama.com"
const MODEL = "ministral-3:8b"

export async function POST(request: NextRequest) {
  try {
    const { messages, verseContext } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Missing messages array" }, { status: 400 })
    }

    const systemPrompt = verseContext
      ? `You are a helpful Bible study assistant. The user is reading ${verseContext.book} ${verseContext.chapter}:${verseContext.verse} - "${verseContext.text}". Provide thoughtful, scripture-based responses. Keep responses concise. Include relevant cross-references.`
      : "You are a helpful Bible study assistant."

    const fullMessages = [{ role: "system", content: systemPrompt }, ...messages]

    const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        stream: false,
        options: { num_predict: 500, temperature: 0.7 },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      const message = response.status === 401
        ? "Your Ollama API key is invalid or expired. Please check your key at ollama.com."
        : `Ollama API error (${response.status}): ${errorText}`
      return NextResponse.json({ error: message }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json({ response: data.message?.content || "No response generated." })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
