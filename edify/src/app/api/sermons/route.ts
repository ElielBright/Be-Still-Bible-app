import { NextRequest, NextResponse } from "next/server"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")
  const preachers = searchParams.get("preachers")?.split(",") || []

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 })
  }

  try {
    const preacherQuery = preachers.map((p) => `"${p}"`).join(" OR ")
    const fullQuery = `${query} ${preacherQuery} sermon`

    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(fullQuery)}&type=video&key=${YOUTUBE_API_KEY}`
    )

    if (!searchResponse.ok) {
      return NextResponse.json({ error: "YouTube API error" }, { status: searchResponse.status })
    }

    const searchData = await searchResponse.json()
    const videoIds = searchData.items?.map((item: any) => item.id.videoId).filter(Boolean).join(",") || ""

    let statsMap: Record<string, any> = {}
    if (videoIds) {
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      )
      const statsData = await statsResponse.json()
      statsData.items?.forEach((item: any) => {
        statsMap[item.id] = item
      })
    }

    const results = searchData.items?.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      preacher: preachers.find((p) => item.snippet.title.toLowerCase().includes(p.toLowerCase())) || item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: statsMap[item.id.videoId]?.contentDetails?.duration || "PT0M",
      viewCount: statsMap[item.id.videoId]?.statistics?.viewCount || "0",
    })) || []

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
