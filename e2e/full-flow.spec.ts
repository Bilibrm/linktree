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

  test("10. Look - Pick a theme, and the public page prints in it", async ({ page }) => {
    await page.goto("/dashboard/appearance")
    await expect(page.getByRole("heading", { name: "Look", exact: true })).toBeVisible({ timeout: 15000 })

    // Themes are radios drawn as tiny proofs; the proof restyles at once.
    // The proof crossfades, so the radio is checked a frame after the click.
    await page.getByRole("radio", { name: "Darkroom" }).click({ force: true })
    await expect(page.getByRole("radio", { name: "Darkroom" })).toBeChecked()
    await expect(page.locator(".lp").first()).toHaveAttribute("data-theme", "darkroom")
    await page.waitForTimeout(800)
    await expect(page.locator('[data-save-state="saved"]')).toBeVisible({ timeout: 10000 })

    // One layer changed on top of the theme, then put back.
    await page.locator("summary", { hasText: "Layout" }).click()
    await page.getByRole("radio", { name: /^Grid/ }).click({ force: true })
    await expect(page.locator(".lp").first()).toHaveAttribute("data-layout", "grid")
    await page.getByRole("button", { name: "Reset layout to the theme" }).click()
    await expect(page.locator(".lp").first()).toHaveAttribute("data-layout", "editorial")
    await page.waitForTimeout(800)
    await expect(page.locator('[data-save-state="saved"]')).toBeVisible({ timeout: 10000 })

    const ui = getUserInfo()
    await page.goto(`/${ui.username}`)
    await expect(page.locator(".lp").first()).toHaveAttribute("data-theme", "darkroom")
    await expect(page.locator(".lp").first()).toHaveAttribute("data-layout", "editorial")
  })

  test("11. Settings - Protect the page with a password", async ({ page }) => {
    await page.goto("/dashboard/settings")
    await page.getByLabel("Who can see it").selectOption("password")
    await page.getByLabel(/password for visitors|new password/i).fill("secret123")
    await page.getByRole("button", { name: /save settings/i }).click()
    await page.waitForTimeout(1500)
  })

  test("12. Public page - Lock screen appears", async ({ page }) => {
    const ui = getUserInfo()
    const response = await page.goto(`/${ui.username}`)
    expect(response?.status()).toBeLessThan(400)

    await expect(page.getByRole("heading", { name: /page is locked/i })).toBeVisible({ timeout: 15000 })
    await expect(page.getByLabel("Password")).toBeVisible()
  })

  test("12b. Public page - A locked page sends no block data", async ({ browser, baseURL }) => {
    const ui = getUserInfo()
    // A stranger: no session, no unlock cookie.
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const leaks = ["Welcome Section", "Edited Link Title", "example.com"]

    const html = await (await context.request.get(`${baseURL}/${ui.username}`)).text()
    expect(html).toContain("page is locked")
    for (const text of leaks) expect(html, `HTML leaks ${text}`).not.toContain(text)

    // The flight payload a client navigation would fetch.
    const flight = await (await context.request.get(`${baseURL}/${ui.username}`, { headers: { RSC: "1" } })).text()
    for (const text of leaks) expect(flight, `RSC payload leaks ${text}`).not.toContain(text)

    // And the live DOM once the lock screen has hydrated and asked about a cookie.
    const page = await context.newPage()
    await page.goto(`/${ui.username}`)
    await expect(page.getByRole("heading", { name: /page is locked/i })).toBeVisible({ timeout: 15000 })
    await page.waitForLoadState("networkidle")
    const dom = await page.content()
    for (const text of leaks) expect(dom, `DOM leaks ${text}`).not.toContain(text)
    await context.close()
  })

  test("13. Public page - Wrong password shows error", async ({ page }) => {
    const ui = getUserInfo()
    await page.goto(`/${ui.username}`)

    await page.getByLabel("Password").fill("wrongpassword")
    await page.getByRole("button", { name: "Open the page" }).click()

    await expect(page.getByText(/password is not right/i)).toBeVisible({ timeout: 10000 })
  })

  test("14. Public page - Correct password unlocks and shows the edited blocks", async ({ page }) => {
    const ui = getUserInfo()
    await page.goto(`/${ui.username}`)

    await page.getByLabel("Password").fill("secret123")
    await page.getByRole("button", { name: "Open the page" }).click()

    await expect(page.getByRole("heading", { name: ui.name })).toBeVisible({ timeout: 10000 })
    // What the editor saved is what visitors get, in the order it was left.
    await expect(page.getByText("Welcome Section")).toBeVisible()
    await expect(page.getByRole("link", { name: /Edited Link Title/ })).toBeVisible()

    // The unlock cookie keeps this visitor in on reload, and is httpOnly.
    const unlock = (await page.context().cookies()).find((c) => c.name.startsWith("ln_unlock_"))
    expect(unlock?.httpOnly).toBe(true)
    await page.reload()
    await expect(page.getByRole("link", { name: /Edited Link Title/ })).toBeVisible({ timeout: 10000 })
  })

  test("14b. Public page - A forged unlock cookie opens nothing", async ({ browser, baseURL }) => {
    const ui = getUserInfo()
    // Get a real cookie, then tamper with its signature.
    const real = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const first = await real.newPage()
    await first.goto(`/${ui.username}`)
    await first.getByLabel("Password").fill("secret123")
    await first.getByRole("button", { name: "Open the page" }).click()
    await expect(first.getByRole("link", { name: /Edited Link Title/ })).toBeVisible({ timeout: 10000 })
    const cookie = (await real.cookies()).find((c) => c.name.startsWith("ln_unlock_"))!
    await real.close()

    const [expires, signature] = cookie.value.split(".")
    const forged = `${expires}.${signature.slice(0, -2)}${signature.endsWith("AA") ? "BB" : "AA"}`
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    await context.addCookies([{ ...cookie, value: forged, domain: new URL(baseURL!).hostname }])
    const page = await context.newPage()
    await page.goto(`/${ui.username}`)
    await page.waitForLoadState("networkidle")
    await expect(page.getByRole("heading", { name: /page is locked/i })).toBeVisible()
    expect(await page.content()).not.toContain("Edited Link Title")
    await context.close()
  })

  test("15. Settings - Delete an account after typing its username", async ({ browser, baseURL }) => {
    // A throwaway account, so the shared one stays for the other specs.
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] }, baseURL })
    const page = await context.newPage()
    const username = `gone-${Date.now()}`
    await page.goto("/auth/signup")
    await page.fill("#username", username)
    await page.waitForTimeout(600)
    await page.fill("#name", "Gone Soon")
    await page.fill("#email", `${username}@example.com`)
    await page.fill("#password", "TestPass123!")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard", { timeout: 20000 })

    await page.goto("/dashboard/settings")
    const remove = page.getByRole("button", { name: "Delete my account" })
    await expect(remove).toBeDisabled()
    await page.getByLabel(`Type ${username} to confirm`).fill(username)
    await remove.click()
    await page.waitForURL((url) => url.pathname === "/", { timeout: 20000 })

    const gone = await context.request.get(`/${username}`)
    expect(gone.status()).toBe(404)
    await context.close()
  })
})
