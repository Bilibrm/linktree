import { test, expect } from "@playwright/test"

/** Theme system v2 in the browser (DESIGN_SYSTEM.md §8.9). The pure migration checks live in theme-migration.spec.ts. */
test.describe("Theme system", () => {
  test("on a phone, the landing picker reprints the sample page in each theme", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/")
    const proof = page.locator("figure").filter({ hasText: "linknest-dz.vercel.app/amina" }).last()
    await proof.scrollIntoViewIfNeeded()
    for (const [name, id] of [
      ["Zine", "zine"],
      ["Poster", "poster"],
      ["Blueprint", "blueprint"],
    ]) {
      // The strip scrolls sideways; a visitor taps the thumbnail, which is the radio's label.
      await page.getByRole("group", { name: "Pick a theme" }).locator("label").filter({ has: page.getByRole("radio", { name, exact: true }) }).click()
      await expect(page.getByRole("radio", { name, exact: true })).toBeChecked()
      await expect(proof.locator(".lp")).toHaveAttribute("data-theme", id)
    }
  })

  test("on a wide screen, every theme glides past as a full page and the narrative names it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    const frames = page.getByRole("list", { name: "Themes" }).locator(":scope > li")
    await expect(frames).toHaveCount(14)
    const zine = frames.filter({ has: page.locator('.lp[data-theme="zine"]') })
    await zine.scrollIntoViewIfNeeded()
    await zine.evaluate((el) => el.scrollIntoView({ block: "center" }))
    await expect(page.locator('[aria-live="polite"]').filter({ hasText: "Zine" }).first()).toBeVisible()
  })

  test("theme art and fonts load without CSP errors", async ({ page }) => {
    const blocked: string[] = []
    page.on("console", (m) => {
      if (m.type() === "error" && /Content Security Policy/i.test(m.text())) blocked.push(m.text())
    })
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto("/")
    await page.getByRole("list", { name: "Themes" }).scrollIntoViewIfNeeded()
    await page.waitForLoadState("networkidle")
    expect(blocked).toEqual([])
  })

  test("reduced motion leaves every block visible", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" })
    const page = await context.newPage()
    await page.goto("/")
    const item = page.locator(".lp .lp-item").first()
    await expect(item).toBeVisible()
    expect(await item.evaluate((el) => getComputedStyle(el).opacity)).toBe("1")
    await context.close()
  })
})
