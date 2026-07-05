"use client"

import { useRef, useState } from "react"
import type { BlockComponentProps } from "./block-renderer"
import { getCardRadius, getShadowClass, getEntranceAnimClass, getEntranceDelayStyle } from "@/lib/theme-utils"
import { Play, Pause } from "lucide-react"

export function VideoBlock({ data, theme, index = 0 }: BlockComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(true)

  if (!data.src) return null

  const radius = getCardRadius(theme)
  const shadow = getShadowClass(theme)
  const anim = getEntranceAnimClass(theme)
  const delayStyle = getEntranceDelayStyle(index)

  function togglePlay() {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPaused(false)
    } else {
      videoRef.current.pause()
      setPaused(true)
    }
  }

  return (
    <div className={`${anim} relative group`} style={delayStyle}>
      <div className={`overflow-hidden ${radius} ${shadow} relative`}>
        <video
          ref={videoRef}
          src={data.src}
          poster={data.poster}
          autoPlay={data.autoplay}
          loop={data.loop}
          muted={data.muted}
          playsInline
          className="w-full object-cover max-h-96"
          onClick={togglePlay}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/[0.06] rounded-inherit pointer-events-none" />
        {paused && (
          <button
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Play className="w-5 h-5 text-ink ml-0.5" />
            </div>
          </button>
        )}
        {!paused && (
          <button
            onClick={togglePlay}
            aria-label="Pause video"
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <Pause className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>
      {data.caption && (
        <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--page-accent)", opacity: 0.55 }}>{data.caption}</p>
      )}
    </div>
  )
}
