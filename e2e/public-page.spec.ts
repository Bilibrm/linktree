import { test, expect } from "@playwright/test"

async function horizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

test.describe("Public pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("auth page loads", async ({ page }) => {
    await page.goto("/auth/login")
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible()
  })

  test("an unclaimed name gets the styled not-found page", async ({ page }) => {
    const response = await page.goto("/no-one-has-this-name-yet")
    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: /nobody has printed this page/i })).toBeVisible()
    await expect(page.getByRole("link", { name: "Claim a name" })).toHaveAttribute("href", "/auth/signup")
  })

  for (const width of [360, 768, 1440]) {
    test(`nothing scrolls sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of ["/", "/no-one-has-this-name-yet"]) {
        await page.goto(path)
        expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0)
      }
    })
  }
})
