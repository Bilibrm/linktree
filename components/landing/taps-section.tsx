"use client"

import { useRef } from "react"
import { ViewsTapsPlot } from "@/components/charts/views-taps-plot"
import { sampleBlockTaps, sampleTraffic } from "./sample-page"
import { usePressMotion } from "./use-press-motion"

const totalViews = sampleTraffic.reduce((sum, d) => sum + d.views, 0)
const totalTaps = sampleTraffic.reduce((sum, d) => sum + d.taps, 0)
const number = new Intl.NumberFormat("en-US")

/**
 * "See who taps": the analytics plot with sample data. The second and last scroll moment
 * on the page: the plot is inked in from the left the first time it scrolls into view.
 */
export function TapsSection() {
  const root = useRef<HTMLDivElement>(null)

  usePressMotion(root, (gsap) => {
    gsap.fromTo(
      "[data-plot]",
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.6,
        ease: "power2.inOut",
        scrollTrigger: { trigger: "[data-plot]", start: "top 75%", once: true },
      },
    )
  })

  return (
    <div ref={root}>
      <dl className="flex flex-wrap gap-x-12 gap-y-4">
        <div>
          <dt className="type-small flex items-center gap-2 text-ink-soft">
            <span className="h-0.5 w-5 bg-ink" aria-hidden="true" />
            Views, last 30 days
          </dt>
          <dd className="type-title-1 tabular mt-1">{number.format(totalViews)}</dd>
        </div>
        <div>
          <dt className="type-small flex items-center gap-2 text-ink-soft">
            <span className="h-1 w-5 bg-pink" aria-hidden="true" />
            Taps, last 30 days
          </dt>
          <dd className="type-title-1 tabular mt-1">{number.format(totalTaps)}</dd>
        </div>
      </dl>

      <div
        data-plot
        className="mt-8"
        role="img"
        aria-label={`Line chart of sample traffic over 30 days: ${number.format(totalViews)} views and ${number.format(totalTaps)} taps, both rising, with a peak each weekend.`}
      >
        <ViewsTapsPlot data={sampleTraffic} />
      </div>

      <table className="type-small mt-10 w-full max-w-[640px] border-collapse text-left">
        <caption className="type-title-3 pb-3 text-left">Taps by block</caption>
        <thead>
          <tr className="border-b border-ink text-ink-soft">
            <th scope="col" className="py-2 pr-4 font-semibold">Block</th>
            <th scope="col" className="py-2 pr-4 font-semibold">Type</th>
            <th scope="col" className="py-2 text-right font-semibold">Taps</th>
          </tr>
        </thead>
        <tbody>
          {sampleBlockTaps.map((row) => (
            <tr key={row.label} className="border-b border-rule">
              <th scope="row" className="py-3 pr-4 font-semibold">{row.label}</th>
              <td className="py-3 pr-4 text-ink-soft">{row.kind}</td>
              <td className="tabular py-3 text-right">{number.format(row.taps)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
