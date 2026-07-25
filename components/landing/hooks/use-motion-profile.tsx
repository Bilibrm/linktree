"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type MotionProfile = {
  /** OS accessibility preference */
  reduceMotion: boolean
  /** Weak CPU/GPU / constrained device heuristics */
  lowPower: boolean
  /** Touch-first device */
  coarsePointer: boolean
  /** 0.4–1 multiplier for parallax distances */
  intensity: number
}

const DEFAULT: MotionProfile = {
  reduceMotion: false,
  lowPower: false,
  coarsePointer: false,
  intensity: 1,
}

const MotionProfileContext = createContext<MotionProfile>(DEFAULT)

export function useMotionProfile() {
  return useContext(MotionProfileContext)
}

function detectProfile(): MotionProfile {
  if (typeof window === "undefined") return DEFAULT

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches
  const saveData =
    typeof navigator !== "undefined" &&
    "connection" in navigator &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)

  const cores = navigator.hardwareConcurrency ?? 8
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const smallViewport = window.matchMedia("(max-width: 767px)").matches

  // Low-power when any strong constraint is present.
  const lowPower =
    reduceMotion ||
    saveData ||
    cores <= 4 ||
    memory <= 4 ||
    (coarsePointer && smallViewport && cores <= 6)

  const intensity = reduceMotion ? 0 : lowPower ? 0.45 : 1

  return { reduceMotion, lowPower, coarsePointer, intensity }
}

export function MotionProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<MotionProfile>(DEFAULT)

  useEffect(() => {
    const apply = () => setProfile(detectProfile())
    apply()

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const mqCoarse = window.matchMedia("(pointer: coarse)")
    mqReduce.addEventListener("change", apply)
    mqCoarse.addEventListener("change", apply)
    window.addEventListener("resize", apply)
    return () => {
      mqReduce.removeEventListener("change", apply)
      mqCoarse.removeEventListener("change", apply)
      window.removeEventListener("resize", apply)
    }
  }, [])

  const value = useMemo(() => profile, [profile])

  return <MotionProfileContext.Provider value={value}>{children}</MotionProfileContext.Provider>
}
