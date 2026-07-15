declare module "react-magic" {
  export const puffIn: Record<string, Record<string, string>>
  export const vanishIn: Record<string, Record<string, string>>
  export const twisterInUp: Record<string, Record<string, string>>
  export const swashIn: Record<string, Record<string, string>>
  export const perspectiveUpReturn: Record<string, Record<string, string>>
}

declare module "react-parallax" {
  import type { CSSProperties, ReactNode } from "react"

  export interface ParallaxProps {
    blur?: number | { min: number; max: number }
    bgImage?: string
    bgImageAlt?: string
    strength?: number
    disabled?: boolean
    style?: CSSProperties
    className?: string
    bgImageStyle?: CSSProperties
    renderLayer?: (percentage: number) => ReactNode
    children?: ReactNode
  }

  export function Parallax(props: ParallaxProps): JSX.Element
  export function Background(props: { className?: string; children?: ReactNode }): JSX.Element
}
