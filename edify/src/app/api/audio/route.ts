import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
}

// ── Method 1: yt-dlp (most reliable) ─────────────────────────────────────────
async function extractWithYtDlp(
  videoId: string
): Promise<{ audioUrl: string; title: string } | null> {
  const { execFile } = await import("child_process")
  const { promisify } = await import("util")

  try {
    const { stdout } = await promisify(execFile)(
      "yt-dlp",
      [
        "--no-playlist",
        "--dump-json",
        "-f",
        "bestaudio[ext=m4a]/bestaudio/best",
        `https://www.youtube.com/watch?v=${videoId}`,
      ],
      { timeout: 30000 }
    )
    const info = JSON.parse(stdout)
    if (!info.url) return null
    return { audioUrl: info.url, title: info.title ?? videoId }
  } catch {
    return null
  }
}

// ── Method 2: @distube/ytdl-core fallback ────────────────────────────────────
async function extractWithYtdlCore(
  videoId: string
): Promise<{ audioUrl: string; mimeType: string; title: string } | null> {
  try {
    const ytdl = (await import("@distube/ytdl-core")).default
    const agent = ytdl.createAgent()
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`, {
      agent,
      requestOptions: { headers: BROWSER_HEADERS },
    })

    // Sort by bitrate, prefer audio-only over muxed
    const formats = info.formats
      .filter((f) => f.hasAudio && f.url)
      .sort((a, b) => {
        const aScore = (a.audioBitrate ?? 0) + (a.hasVideo ? 0 : 1000)
        const bScore = (b.audioBitrate ?? 0) + (b.hasVideo ? 0 : 1000)
        return bScore - aScore
      })

    const format = formats[0]
    if (!format?.url) return null

    return {
      audioUrl: format.url,
      mimeType: format.mimeType ?? "audio/webm",
      title: info.videoDetails.title,
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const videoId = (body.videoUrl as string)?.match(/(?:v=|\/)([\w-]{11})/)?.[1]

  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
  }

  console.log(`[audio] Extracting videoId=${videoId}`)

  // Try yt-dlp first — if installed it almost always works
  const ytdlpResult = await extractWithYtDlp(videoId)
  if (ytdlpResult) {
    console.log(`[audio] yt-dlp succeeded for ${videoId}`)
    return NextResponse.json(ytdlpResult)
  }

  // Fall back to ytdl-core
  const coreResult = await extractWithYtdlCore(videoId)
  if (coreResult) {
    console.log(`[audio] ytdl-core succeeded for ${videoId}`)
    return NextResponse.json(coreResult)
  }

  console.error(`[audio] All methods failed for ${videoId}`)
  return NextResponse.json(
    {
      error:
        "Could not extract audio. Install yt-dlp for reliable extraction: run  winget install yt-dlp.yt-dlp  in a terminal, then restart the dev server.",
    },
    { status: 500 }
  )
}
