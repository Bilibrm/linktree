import { Fraunces, Public_Sans } from "next/font/google"

/**
 * The "Fraunces + Public Sans" owner font pair. It used to ride along with the app's own
 * fonts in the root layout; the app is Archivo-only now, so the pair ships only with routes
 * that import this module (the public page, through DynamicFontLoader). Not preloaded:
 * the files are fetched only when a page actually uses the pair.
 */
const fraunces = Fraunces({ subsets: ["latin"], preload: false })
const publicSans = Public_Sans({ subsets: ["latin"], preload: false })

/** `font-family` value for the pair, using the names next/font registered. */
export const ownerFrauncesFamily = [fraunces.style.fontFamily, publicSans.style.fontFamily, "serif"].join(", ")
