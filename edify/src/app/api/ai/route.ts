import { NextRequest, NextResponse } from "next/server"

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || "https://api.ollama.com/v1"

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

    const response = await fetch(`${OLLAMA_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3",
        messages: fullMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: "Ollama API error", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ response: data.choices?.[0]?.message?.content || "No response generated." })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
