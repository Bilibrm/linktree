import { test, expect } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

function getUserInfo() {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "e2e", ".auth", "user-info.json"), "utf-8")
  )
}

test.describe("Full user flow", () => {

  test("1. Landing page loads", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("body")).toBeVisible()
  })

  test("2. Dashboard - Add a link block with inline editor", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.getByRole("heading", { name: /your blocks/i })).toBeVisible({ timeout: 10000 })

    // Open add dialog
    await page.getByRole("button", { name: /add block/i }).click()
    const d = page.locator('[data-slot="dialog-content"]')
    await expect(d).toBeVisible()

    // Select Link type
    await d.getByRole("button", { name: /link/i }).first().click()

    // Check editor appeared
    await expect(d.getByRole("heading", { name: /add link/i })).toBeVisible()

    // Fill fields
    const inputs = d.locator("input")
    await inputs.first().fill("My Test Link")
    await inputs.nth(1).fill("https://example.com")

    // Add
    await d.getByRole("button", { name: /add link/i }).click()

    // Verify block appeared
    await expect(page.getByText("My Test Link").first()).toBeVisible({ timeout: 10000 })
  })

  test("3. Dashboard - Add a header block", async ({ page }) => {
    await page.goto("/dashboard")
    await page.getByRole("button", { name: /add block/i }).click()

    const d = page.locator('[data-slot="dialog-content"]')
    await expect(d).toBeVisible()
    await d.getByRole("button", { name: /header/i }).first().click()

    const input = d.locator("input").first()
    await input.fill("Welcome Section")

    await d.getByRole("button", { name: /add header/i }).click()
    // Verify in the block list (use first() because preview sidebar also shows it)
    await expect(page.getByText("Welcome Section").first()).toBeVisible({ timeout: 10000 })
  })

  test("4. Dashboard - Edit a block", async ({ page }) => {
    await page.goto("/dashboard")

    const editBtn = page.getByRole("button", { name: /edit/i }).first()
    await expect(editBtn).toBeVisible({ timeout: 10000 })
    await editBtn.click()

    await expect(page.getByRole("button", { name: /^save$/i }).first()).toBeVisible()

    const firstInput = page.locator("input").first()
    await firstInput.fill("Edited Link Title")

    await page.getByRole("button", { name: /^save$/i }).first().click()
    await expect(page.getByText("Edited Link Title").first()).toBeVisible({ timeout: 5000 })
  })

  test("5. Dashboard - Delete a block", async ({ page }) => {
    await page.goto("/dashboard")

    const deleteBtn = page.getByRole("button").filter({ has: page.locator(".lucide-trash2") }).first()
    await expect(deleteBtn).toBeVisible({ timeout: 10000 })
    await deleteBtn.click()

    await expect(page.getByText(/delete block/i)).toBeVisible()
    await page.getByRole("button", { name: /^delete$/i }).click()
    await page.waitForTimeout(1500)
  })

  test("6. Settings page - Load and save SEO", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible({ timeout: 10000 })

    // Fill SEO fields
    await page.getByLabel(/meta title/i).fill("Test SEO Title")
    await page.getByLabel(/meta description/i).fill("This is a test meta description for SEO.")

    // Save
    await page.getByRole("button", { name: /save settings/i }).click()
    await page.waitForTimeout(2000)

    // Verify values persist
    await page.reload()
    await expect(page.getByLabel(/meta title/i)).toHaveValue("Test SEO Title")
  })

  test("7. Settings page - Toggle published and restore", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await expect(page.getByRole("heading", { name: /page/i })).toBeVisible({ timeout: 10000 })

    const publishSwitch = page.getByRole("switch", { name: /published/i })
    // Toggle off
    await publishSwitch.click()
    // Toggle back on (so subsequent tests can access the public page)
    await publishSwitch.click()
    // Save
    await page.getByRole("button", { name: /save settings/i }).click()
    await page.waitForTimeout(1500)
  })

  test("8. Appearance page - Change theme preset", async ({ page }) => {
    await page.goto("/dashboard/appearance")
    await expect(page.getByRole("heading", { name: /appearance/i })).toBeVisible({ timeout: 10000 })

    // Click the "Dark" preset button inside the presets tab panel
    const presetPanel = page.locator('[role="tabpanel"]').first()
    const darkBtn = presetPanel.getByRole("button", { name: /dark/i })
    await expect(darkBtn).toBeVisible()
    await darkBtn.click()

    await page.getByRole("button", { name: /save changes/i }).click()
    await page.waitForTimeout(1500)
  })

  test("9. Appearance page - Set password protection", async ({ page }) => {
    await page.goto("/dashboard/appearance")

    // Click Visibility tab
    await page.getByRole("tab", { name: /visibility/i }).click()

    // Open the select trigger
    await page.getByRole("combobox").first().click()

    // Select password
    await page.getByRole("option", { name: /password/i }).click()

    // Fill password
    await page.getByPlaceholder(/password/i).fill("secret123")

    // Save
    await page.getByRole("button", { name: /save changes/i }).click()
    await page.waitForTimeout(1500)
  })

  test("10. Public page - Lock screen appears", async ({ page }) => {
    const ui = getUserInfo()
    const response = await page.goto(`/${ui.username}`)
    // The page might 404 if not published — check status
    expect(response?.status()).toBeLessThan(400)

    // Should see the lock screen
    await expect(page.getByText(/this page is locked/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByPlaceholder(/enter password/i)).toBeVisible()
  })

  test("11. Public page - Wrong password shows error", async ({ page }) => {
    const ui = getUserInfo()
    await page.goto(`/${ui.username}`)

    // Type wrong password and submit
    await page.getByPlaceholder(/enter password/i).fill("wrongpassword")
    await page.getByRole("button", { name: /unlock/i }).click()

    await expect(page.getByText(/incorrect password/i)).toBeVisible({ timeout: 10000 })
  })

  test("12. Public page - Correct password unlocks", async ({ page }) => {
    const ui = getUserInfo()
    await page.goto(`/${ui.username}`)

    // Type correct password and submit
    await page.getByPlaceholder(/enter password/i).fill("secret123")
    await page.getByRole("button", { name: /unlock/i }).click()

    await expect(page.getByRole("heading", { name: ui.name })).toBeVisible({ timeout: 10000 })
  })
})
