import { test, expect } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"
import { addBlock, clearBlocks, inspector, openEditor, proofBlocks, waitForSaved } from "./editor"

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

  test("2. Editor - Add a link from the empty page", async ({ page }) => {
    await openEditor(page)
    // Other specs share this account, so start from an empty page.
    await clearBlocks(page)

    // An empty page offers three suggested blocks.
    await expect(page.getByText("Add your first block")).toBeVisible()
    await page.getByRole("button", { name: /^Link/ }).click()

    // The new block is selected and its first field has focus.
    await expect(inspector(page).getByRole("heading", { name: "Link", exact: true })).toBeVisible({ timeout: 10000 })
    await expect(inspector(page).getByLabel("Title", { exact: true })).toBeFocused()

    await inspector(page).getByLabel("Title", { exact: true }).fill("My Test Link")
    await inspector(page).getByLabel("Web address", { exact: true }).fill("https://example.com")

    // The proof updates as you type, and the change saves by itself.
    await expect(proofBlocks(page).filter({ hasText: "My Test Link" })).toBeVisible()
    await waitForSaved(page)
  })

  test("3. Editor - Add a header with the block picker", async ({ page }) => {
    await openEditor(page)
    await addBlock(page, "Header")

    await inspector(page).getByLabel("Heading", { exact: true }).fill("Welcome Section")
    await expect(proofBlocks(page).filter({ hasText: "Welcome Section" })).toBeVisible()
    await waitForSaved(page)

    await page.reload()
    await expect(proofBlocks(page)).toHaveCount(2)
    await expect(proofBlocks(page).nth(1)).toContainText("Welcome Section")
  })

  test("4. Editor - Select a block, edit it, Escape deselects", async ({ page }) => {
    await openEditor(page)

    await proofBlocks(page).filter({ hasText: "My Test Link" }).click()
    await expect(proofBlocks(page).first()).toHaveAttribute("aria-selected", "true")

    await inspector(page).getByLabel("Title", { exact: true }).fill("Edited Link Title")
    await expect(proofBlocks(page).first()).toContainText("Edited Link Title")
    await waitForSaved(page)

    await page.keyboard.press("Escape")
    await expect(page.getByRole("heading", { name: "Page header" })).toBeVisible()

    await page.reload()
    await expect(proofBlocks(page).first()).toContainText("Edited Link Title")
  })

  test("5. Editor - Reorder with Alt+Arrow", async ({ page }) => {
    await openEditor(page)

    await proofBlocks(page).first().click()
    await page.keyboard.press("Alt+ArrowDown")
    await expect(page.getByText("Block moved to position 2")).toBeAttached()
    await expect(proofBlocks(page).nth(1)).toContainText("Edited Link Title")
    await waitForSaved(page)

    await page.reload()
    await expect(proofBlocks(page).nth(0)).toContainText("Welcome Section")
    await expect(proofBlocks(page).nth(1)).toContainText("Edited Link Title")
  })

  test("6. Editor - Delete a block, then undo", async ({ page }) => {
    await openEditor(page)

    await proofBlocks(page).filter({ hasText: "Welcome Section" }).click()
    await inspector(page).getByRole("button", { name: "Delete block" }).click()
    await expect(proofBlocks(page)).toHaveCount(1)

    // No confirm dialog: the toast offers Undo, which puts the block back where it was.
    await page.getByRole("button", { name: "Undo" }).click()
    await expect(proofBlocks(page)).toHaveCount(2)
    await expect(proofBlocks(page).nth(0)).toContainText("Welcome Section")
    await waitForSaved(page)

    await page.reload()
    await expect(proofBlocks(page)).toHaveCount(2)
    await expect(proofBlocks(page).nth(0)).toContainText("Welcome Section")
  })

  test("7. Editor - Hide a block from visitors", async ({ page }) => {
    await openEditor(page)

    await proofBlocks(page).filter({ hasText: "Welcome Section" }).click()
    await inspector(page).getByRole("switch", { name: "Show on your page" }).click()
    await expect(proofBlocks(page).nth(0)).toContainText("Hidden")
    await waitForSaved(page)

    // Show it again so the public page checks below see it.
    await inspector(page).getByRole("switch", { name: "Show on your page" }).click()
    await expect(proofBlocks(page).nth(0)).not.toContainText("Hidden")
    await waitForSaved(page)
  })

  test("8. Settings page - Load and save SEO", async ({ page }) => {
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

  test("9. Settings page - Toggle published and restore", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible({ timeout: 10000 })

    const publishSwitch = page.getByRole("switch", { name: /published/i })
    // Toggle off
    await publishSwitch.click()
    // Toggle back on (so subsequent tests can access the public page)
    await publishSwitch.click()
    // Save
    await page.getByRole("button", { name: /save settings/i }).click()
    await page.waitForTimeout(1500)
  })

  test("10. Appearance page - Change theme preset", async ({ page }) => {
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

  test("11. Appearance page - Set password protection", async ({ page }) => {
    await page.goto("/dashboard/appearance")

    // Click Visibility tab
    await page.getByRole("tab", { name: /visibility/i }).click()

    // Open the select trigger
    await page.getByRole("tabpanel").getByRole("combobox").first().click()

    // Select password
    await page.getByRole("option", { name: /password/i }).click()

    // Fill password
    await page.getByPlaceholder(/password/i).fill("secret123")

    // Save
    await page.getByRole("button", { name: /save changes/i }).click()
    await page.waitForTimeout(1500)
  })

  test("12. Public page - Lock screen appears", async ({ page }) => {
    const ui = getUserInfo()
    const response = await page.goto(`/${ui.username}`)
    // The page might 404 if not published — check status
    expect(response?.status()).toBeLessThan(400)

    // Should see the lock screen
    await expect(page.getByText(/this page is locked/i)).toBeVisible({ timeout: 15000 })
    await expect(page.getByPlaceholder(/enter password/i)).toBeVisible()
  })

  test("13. Public page - Wrong password shows error", async ({ page }) => {
    const ui = getUserInfo()
    await page.goto(`/${ui.username}`)

    // Type wrong password and submit
    await page.getByPlaceholder(/enter password/i).fill("wrongpassword")
    await page.getByRole("button", { name: /unlock/i }).click()

    await expect(page.getByText(/incorrect password/i)).toBeVisible({ timeout: 10000 })
  })

  test("14. Public page - Correct password unlocks and shows the edited blocks", async ({ page }) => {
    const ui = getUserInfo()
    await page.goto(`/${ui.username}`)

    // Type correct password and submit
    await page.getByPlaceholder(/enter password/i).fill("secret123")
    await page.getByRole("button", { name: /unlock/i }).click()

    await expect(page.getByRole("heading", { name: ui.name })).toBeVisible({ timeout: 10000 })
    // What the editor saved is what visitors get, in the order it was left.
    await expect(page.getByText("Welcome Section")).toBeVisible()
    await expect(page.getByRole("link", { name: /Edited Link Title/ })).toBeVisible()
  })
})
