const OLLAMA_API_KEY = process.env.NEXT_PUBLIC_OLLAMA_API_KEY
const OLLAMA_ENDPOINT = process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT || "https://api.ollama.com/v1"

export interface AIChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function chatWithAI(
  messages: AIChatMessage[],
  verseContext?: { book: string; chapter: number; verse: number; text: string }
): Promise<string> {
  try {
    const systemPrompt = verseContext
      ? `You are a helpful Bible study assistant. The user is currently reading ${verseContext.book} ${verseContext.chapter}:${verseContext.verse} - "${verseContext.text}". Provide thoughtful, scripture-based responses. Keep responses concise (under 200 words). Include relevant cross-references when appropriate.`
      : "You are a helpful Bible study assistant. Provide thoughtful, scripture-based responses."

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

    if (!response.ok) return "Sorry, I'm having trouble connecting right now. Please try again."

    const data = await response.json()
    return data.choices?.[0]?.message?.content || "No response generated."
  } catch {
    return "Unable to reach the AI service. Please check your connection."
  }
}
