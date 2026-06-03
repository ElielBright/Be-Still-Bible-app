import { NextRequest, NextResponse } from "next/server"
import { execFile } from "child_process"
import { promisify } from "util"
import { mkdtempSync, rmSync, existsSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { readFile } from "fs/promises"

export const runtime = "nodejs"

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
}

const exec = promisify(execFile)

// ── Find yt-dlp on the system ────────────────────────────────────────────────
function findYtDlp(): string {
  const candidates = [
    "yt-dlp",
    join(process.env.APPDATA || "", "Python", "Python314", "Scripts", "yt-dlp.exe"),
    join(process.env.LOCALAPPDATA || "", "Programs", "yt-dlp", "yt-dlp.exe"),
  ]
  return candidates.find((c) => existsSync(c)) || "yt-dlp"
}

function findFfmpeg(): string {
  // Check npm-installed ffmpeg binary
  const npmFfmpeg = join(process.cwd(), "node_modules", "@ffmpeg-installer", "win32-x64", "ffmpeg.exe")
  if (existsSync(npmFfmpeg)) return npmFfmpeg
  // Fallback to PATH
  return "ffmpeg"
}

// ── Method 1: yt-dlp (most reliable) ─────────────────────────────────────────
async function extractWithYtDlp(
  videoId: string
): Promise<{ audioUrl: string; title: string } | null> {
  const ytdl = findYtDlp()
  try {
    const { stdout } = await exec(
      ytdl,
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
  } catch (err) {
    console.error(`[audio] yt-dlp failed for ${videoId}:`, err)
    return null
  }
}

// ── Method 2: yt-dlp download + ffmpeg → MP3 ─────────────────────────────────
async function downloadAsMp3(
  videoId: string,
  title: string
): Promise<{ filePath: string; fileName: string } | null> {
  const ytdl = findYtDlp()
  const ffmpeg = findFfmpeg()
  const tmpDir = mkdtempSync(join(tmpdir(), "edify-audio-"))
  const outPath = join(tmpDir, `${videoId}.mp3`)

  try {
    await exec(
      ytdl,
      [
        "--no-playlist",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "--ffmpeg-location", ffmpeg,
        "-o", outPath,
        `https://www.youtube.com/watch?v=${videoId}`,
      ],
      { timeout: 120000 }
    )
    const safeName = (title || videoId).replace(/[^a-z0-9]/gi, "_") + ".mp3"
    return { filePath: outPath, fileName: safeName }
  } catch (err) {
    console.error(`[audio] MP3 download failed for ${videoId}:`, err)
    // Clean up
    try { rmSync(tmpDir, { recursive: true, force: true }) } catch {}
    return null
  }
}

// ── Method 3: @distube/ytdl-core fallback ────────────────────────────────────
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
  } catch (err) {
    console.error(`[audio] ytdl-core failed for ${videoId}:`, err)
    return null
  }
}

// ── POST: Extract audio URL for streaming ────────────────────────────────────
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const videoId = (body.videoUrl as string)?.match(/(?:v=|\/)([\w-]{11})/)?.[1]

  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
  }

  console.log(`[audio] Extracting videoId=${videoId}, mode=stream`)

  // Try yt-dlp first
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
        "Could not extract audio. Make sure yt-dlp is installed and accessible.",
    },
    { status: 500 }
  )
}

// ── GET: Download audio as MP3 file ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId")
  const title = request.nextUrl.searchParams.get("title") || "audio"

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 })
  }

  console.log(`[audio] Downloading MP3 for videoId=${videoId}`)

  // First get the title from yt-dlp
  const info = await extractWithYtDlp(videoId)
  const videoTitle = info?.title || title

  // Download and convert to MP3
  const mp3 = await downloadAsMp3(videoId, videoTitle)
  if (!mp3) {
    return NextResponse.json(
      { error: "Failed to download and convert audio to MP3. Make sure yt-dlp and ffmpeg are available." },
      { status: 500 }
    )
  }

  // Read the file and return it, then clean up
  const buffer = await readFile(mp3.filePath)
  const dir = mp3.filePath.replace(/\\[^\\]+$/, "")
  rmSync(dir, { recursive: true, force: true })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename="${mp3.fileName}"`,
      "Content-Length": buffer.length.toString(),
    },
  })
}
