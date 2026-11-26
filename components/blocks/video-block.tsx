"use client"

import { useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import type { BlockComponentProps } from "./block-props"

/**
 * Client island: a facade. Nothing but the poster loads until the visitor presses play,
 * unless the owner chose autoplay.
 */
export function VideoBlock({ data }: BlockComponentProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  if (!data.src) return null

  function toggle() {
    const video = ref.current
    if (!video) return
    if (video.paused) void video.play().catch(() => setPlaying(false))
    else video.pause()
  }

  return (
    <figure className="lp-figure">
      <div className="lp-video">
        <video
          ref={ref}
          src={data.src}
          poster={data.poster || undefined}
          preload={data.autoplay ? "auto" : data.poster ? "none" : "metadata"}
          autoPlay={data.autoplay}
          loop={data.loop}
          muted={data.muted || data.autoplay}
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button type="button" className="lp-play" data-state={playing ? "playing" : "paused"} onClick={toggle} aria-label={playing ? "Pause video" : "Play video"}>
          <span>{playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="ml-0.5 size-6" aria-hidden="true" />}</span>
        </button>
      </div>
      {data.caption && <figcaption className="lp-caption">{data.caption}</figcaption>}
    </figure>
  )
}
