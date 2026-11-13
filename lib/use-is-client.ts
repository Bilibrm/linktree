"use client"

import { useSyncExternalStore } from "react"

const subscribeNoop = () => () => {}

export function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}
