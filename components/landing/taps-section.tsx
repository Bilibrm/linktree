import { InkPlot } from "@/components/charts/ink-plot"
import { CountUp } from "./count-up"
import { sampleBlockTaps, sampleTraffic } from "./sample-page"

const totalViews = sampleTraffic.reduce((sum, d) => sum + d.views, 0)
const totalTaps = sampleTraffic.reduce((sum, d) => sum + d.taps, 0)
const number = new Intl.NumberFormat("en-US")
const plotData = sampleTraffic.map((d) => ({ ...d, day: `Day ${d.day}` }))

/**
 * "See who taps": the Stats plot (`InkPlot`, the same one as /dashboard/analytics) with
 * sample data. The lines are inked in once and the totals count up once, when the
 * section reaches the screen.
 */
export function TapsSection() {
  return (
    <section aria-labelledby="taps-title" className="landing-section">
      <div className="landing-wrap">
        <div data-reveal-group>
          <div data-rule className="landing-rule mb-16" />
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <h2 id="taps-title" data-reveal className="type-title-1">
                See who taps
              </h2>
              <p data-reveal className="type-body mt-6 max-w-[48ch] text-lg text-ink-soft">
                LinkNest counts page views and taps on each block. No cookies, no third-party trackers, nothing sold.
              </p>
            </div>
            <dl data-reveal className="flex flex-wrap gap-x-16 gap-y-6 lg:justify-end lg:pt-2">
              <div>
                <dt className="type-small flex items-center gap-2 text-ink-soft">
                  <span className="h-0.5 w-5 bg-ink" aria-hidden="true" />
                  Views, last 30 days
                </dt>
                <dd className="type-title-1 mt-2">
                  <CountUp value={totalViews} />
                </dd>
              </div>
              <div>
                <dt className="type-small flex items-center gap-2 text-ink-soft">
                  <span className="h-1 w-5 bg-pink" aria-hidden="true" />
                  Taps, last 30 days
                </dt>
                <dd className="type-title-1 mt-2">
                  <CountUp value={totalTaps} />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <InkPlot
          className="mt-16"
          data={plotData}
          draw="view"
          label={`Line chart of sample traffic over 30 days: ${number.format(totalViews)} views and ${number.format(totalTaps)} taps, both rising, with a peak each weekend.`}
        />

        <div data-reveal-group className="mt-16 max-w-[640px]">
          <table data-reveal className="type-small w-full border-collapse text-left">
            <caption className="type-title-3 pb-4 text-left">
              Taps by block
            </caption>
            <thead>
              <tr className="text-ink-soft">
                <th scope="col" className="py-2 pr-4 font-semibold">Block</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Type</th>
                <th scope="col" className="py-2 text-right font-semibold">Taps</th>
              </tr>
            </thead>
            <tbody>
              {sampleBlockTaps.map((row) => (
                <tr key={row.label} className="border-t border-rule">
                  <th scope="row" className="py-3 pr-4 font-semibold">{row.label}</th>
                  <td className="py-3 pr-4 text-ink-soft">{row.kind}</td>
                  <td className="tabular py-3 text-right">{number.format(row.taps)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
