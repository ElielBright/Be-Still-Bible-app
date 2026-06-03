declare module "react-player" {
  import { Component } from "react"
  interface ReactPlayerProps {
    url?: string
    playing?: boolean
    volume?: number
    muted?: boolean
    width?: string | number
    height?: string | number
    style?: React.CSSProperties
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void
    onDuration?: (duration: number) => void
    onPlay?: () => void
    onPause?: () => void
    onEnded?: () => void
    onError?: (error: any) => void
    config?: any
    ref?: any
  }
  class ReactPlayer extends Component<ReactPlayerProps> {
    seekTo(amount: number, type?: "seconds" | "fraction"): void
  }
  export default ReactPlayer
}
