const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

export interface YouTubeSearchResult {
  videoId: string
  title: string
  preacher: string
  thumbnail: string
  duration: string
  viewCount: string
}

export async function searchSermons(
  verseText: string,
  preachers: string[]
): Promise<YouTubeSearchResult[]> {
  try {
    const preacherQuery = preachers.map((p) => `"${p}"`).join(" OR ")
    const query = `${verseText} ${preacherQuery} sermon`
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`
    )
    if (!response.ok) return []
    const data = await response.json()
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",")
    if (!videoIds) return []

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )
    const statsData = await statsResponse.json()
    const statsMap: Record<string, any> = {}
    statsData.items?.forEach((item: any) => {
      statsMap[item.id] = item
    })

    return data.items.map((item: any) => {
      const stats = statsMap[item.id.videoId]
      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        preacher: preachers.find((p) =>
          item.snippet.title.toLowerCase().includes(p.toLowerCase())
        ) || item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: stats?.contentDetails?.duration || "PT0M",
        viewCount: stats?.statistics?.viewCount || "0",
      }
    })
  } catch {
    return []
  }
}
