"use client"

import { useState, useEffect, useRef, useMemo, useId } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Loader2, Headphones, Play, Pause, Volume2, VolumeX } from "lucide-react"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YouTubePlayerProps {
  videoId: string
  title: string
  preacher: string
  mode: "watch" | "listen"
  onClose: () => void
}

function formatTime(s: number) {
  if (!s || !isFinite(s)) return "0:00"
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  return `${m}:${String(sec).padStart(2, "0")}`
}

/** Load youtube iframe_api script once; resolves when window.YT.Player is ready */
function loadYtApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return
    if (window.YT?.Player) { resolve(); return }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement("script")
      s.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(s)
    }
  })
}

export function YouTubePlayer({ videoId, title, preacher, mode, onClose }: YouTubePlayerProps) {
  // ── Extraction state ──────────────────────────────────────────────────────
  const [audioUrl, setAudioUrl]         = useState<string | null>(null)
  const [audioTitle, setAudioTitle]     = useState("")
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioFallback, setAudioFallback] = useState(false)

  // ── Fallback player (YouTube IFrame API) ─────────────────────────────────
  const uid          = useId()
  const playerDivId  = useMemo(() => `ytp-${uid.replace(/:/g, "")}`, [uid])
  const ytRef        = useRef<any>(null)
  const [fbReady,    setFbReady]    = useState(false)
  const [fbPlaying,  setFbPlaying]  = useState(false)
  const [fbTime,     setFbTime]     = useState(0)
  const [fbDuration, setFbDuration] = useState(0)
  const [fbVolume,   setFbVolume]   = useState(80)
  const [fbMuted,    setFbMuted]    = useState(false)

  // Deterministic waveform heights
  const waveBars = useMemo(
    () => Array.from({ length: 24 }, (_, i) => 20 + ((i * 11 + 7) % 70)),
    []
  )

  // ── Fetch extracted audio URL on mount (listen mode) ─────────────────────
  useEffect(() => {
    if (mode !== "listen") return
    setAudioLoading(true)
    setAudioFallback(false)
    setAudioUrl(null)

    const ctrl = new AbortController()
    fetch("/api/audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl: `https://www.youtube.com/watch?v=${videoId}` }),
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.audioUrl) {
          setAudioUrl(data.audioUrl)
          setAudioTitle(data.title ?? "")
        } else {
          setAudioFallback(true)
        }
      })
      .catch((err) => { if (err.name !== "AbortError") setAudioFallback(true) })
      .finally(() => setAudioLoading(false))

    return () => ctrl.abort()
  }, [videoId, mode])

  // ── YouTube IFrame API player (fallback) ──────────────────────────────────
  useEffect(() => {
    if (!audioFallback) return
    let alive = true

    loadYtApi().then(() => {
      if (!alive || !document.getElementById(playerDivId)) return
      ytRef.current = new window.YT.Player(playerDivId, {
        videoId,
        playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, disablekb: 1, fs: 0 },
        events: {
          onReady: () => {
            if (!alive) return
            setFbReady(true)
            setFbDuration(ytRef.current?.getDuration() ?? 0)
            ytRef.current?.setVolume(80)
          },
          onStateChange: ({ data }: { data: number }) => {
            if (!alive) return
            // 1 = playing, 2 = paused, 3 = buffering, 0 = ended
            setFbPlaying(data === 1 || data === 3)
            if (data === 0) { setFbPlaying(false); setFbTime(0) }
          },
        },
      })
    })

    return () => {
      alive = false
      ytRef.current?.destroy()
      ytRef.current = null
      setFbReady(false)
      setFbPlaying(false)
      setFbTime(0)
      setFbDuration(0)
    }
  }, [audioFallback, videoId, playerDivId])

  // Poll current time while playing
  useEffect(() => {
    if (!fbPlaying) return
    const id = setInterval(() => {
      if (!ytRef.current) return
      setFbTime(ytRef.current.getCurrentTime?.() ?? 0)
      const d = ytRef.current.getDuration?.() ?? 0
      if (d > 0) setFbDuration(d)
    }, 500)
    return () => clearInterval(id)
  }, [fbPlaying])

  const fbTogglePlay = () => {
    if (!ytRef.current) return
    fbPlaying ? ytRef.current.pauseVideo() : ytRef.current.playVideo()
  }

  const fbSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ytRef.current || fbDuration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * fbDuration
    ytRef.current.seekTo(t, true)
    setFbTime(t)
  }

  const fbChangeVolume = (val: number) => {
    setFbVolume(val)
    if (val === 0) {
      ytRef.current?.mute()
      setFbMuted(true)
    } else {
      ytRef.current?.unMute()
      ytRef.current?.setVolume(val)
      setFbMuted(false)
    }
  }

  const fbToggleMute = () => {
    if (fbMuted) {
      ytRef.current?.unMute()
      ytRef.current?.setVolume(fbVolume || 80)
      setFbMuted(false)
    } else {
      ytRef.current?.mute()
      setFbMuted(true)
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement("a")
    a.href = audioUrl
    a.download = `${(audioTitle || title).replace(/[^a-z0-9]/gi, "_")}.webm`
    a.target = "_blank"
    a.rel = "noopener noreferrer"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />

      <div className={`fixed z-50 bg-black rounded-lg overflow-hidden shadow-2xl ${
        mode === "listen"
          ? "bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl"
          : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl"
      }`}>

        {/* ── WATCH MODE ────────────────────────────────────────────────── */}
        {mode === "watch" && (
          <>
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
            <div className="flex justify-end px-3 py-2">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/10" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* ── LISTEN MODE ───────────────────────────────────────────────── */}
        {mode === "listen" && (
          <div className="flex flex-col gap-4 px-4 py-6">

            {/* Title row */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Headphones className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{audioTitle || title}</p>
                <p className="text-sm text-white/60">{preacher}</p>
              </div>
            </div>

            {/* Loading */}
            {audioLoading && (
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting audio…
              </div>
            )}

            {/* ── Extracted audio — native HTML5 player ── */}
            {audioUrl && !audioLoading && (
              <audio src={audioUrl} className="w-full" controls />
            )}

            {/* ── Fallback — YouTube IFrame API, video hidden ── */}
            {audioFallback && !audioLoading && (
              <>
                {/* This div is replaced by YT.Player with a hidden iframe */}
                <div
                  id={playerDivId}
                  style={{ position: "absolute", width: 1, height: 1, top: -9999, left: -9999, overflow: "hidden" }}
                />

                {/* Waveform animation */}
                <div className="flex items-end gap-px h-10 justify-center">
                  {waveBars.map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-sm bg-primary/60 transition-all ${fbPlaying ? "animate-bounce" : ""}`}
                      style={{
                        height: `${fbPlaying ? h : 15}%`,
                        animationDelay: `${(i % 8) * 100}ms`,
                        animationDuration: "0.9s",
                      }}
                    />
                  ))}
                </div>

                {/* Seek bar */}
                <div className="space-y-1">
                  <div
                    className="relative h-2 w-full rounded-full bg-white/20 cursor-pointer"
                    onClick={fbSeek}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: `${fbDuration > 0 ? (fbTime / fbDuration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>{formatTime(fbTime)}</span>
                    <span>{formatTime(fbDuration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-2">
                  {/* Volume */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 shrink-0"
                      onClick={fbToggleMute}
                    >
                      {fbMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={fbMuted ? 0 : fbVolume}
                      onChange={(e) => fbChangeVolume(Number(e.target.value))}
                      className="w-20 accent-primary"
                    />
                  </div>

                  {/* Play / Pause */}
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-40"
                    onClick={fbTogglePlay}
                    disabled={!fbReady}
                  >
                    {fbPlaying
                      ? <Pause className="h-5 w-5" />
                      : <Play className="h-5 w-5 ml-0.5" />}
                  </Button>

                  <p className="w-20 text-xs text-white/30 text-right leading-tight">
                    Streaming<br />via YouTube
                  </p>
                </div>
              </>
            )}

            {/* Footer: download + close */}
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
                onClick={handleDownload}
                disabled={!audioUrl || audioLoading || audioFallback}
                title={audioFallback ? "Download unavailable in streaming mode" : undefined}
              >
                <Download className="h-4 w-4" />
                Download Audio
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
