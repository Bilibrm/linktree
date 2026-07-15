"use client"

import { useEffect, useState } from "react"
import { Parallax } from "react-parallax"
import { cn } from "@/lib/utils"

type ParallaxBandProps = {
  image: string
  strength?: number
  height?: string
  blur?: number | { min: number; max: number }
  imagePosition?: string
  className?: string
  children?: React.ReactNode
  overlayClassName?: string
}

export function ParallaxBand({
  image,
  strength = 200,
  height = "420px",
  blur,
  imagePosition = "center",
  className,
  children,
  overlayClassName,
}: ParallaxBandProps) {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  if (reduceMotion) {
    return (
      <div className={cn("relative overflow-hidden", className)} style={{ height }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})`, backgroundPosition: imagePosition }}
        />
        <div className={cn("absolute inset-0 bg-ink/70", overlayClassName)} />
        <div className="relative z-10" style={{ height }}>{children}</div>
      </div>
    )
  }

  return (
    <Parallax
      blur={blur}
      bgImage={image}
      bgImageAlt=""
      strength={strength}
      disabled={reduceMotion}
      className={cn("relative overflow-hidden", className)}
      style={{ height }}
      bgImageStyle={{ objectFit: "cover", objectPosition: imagePosition }}
      renderLayer={(pct) => (
        <div
          className={cn("absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/60 to-ink/90", overlayClassName)}
          style={{ opacity: 0.5 + pct * 0.3 }}
        />
      )}
    >
      <div className="relative z-10" style={{ height }}>
        {children}
      </div>
    </Parallax>
  )
}
