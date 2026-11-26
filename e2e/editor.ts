import { expect, type Locator, type Page } from "@playwright/test"

/** Helpers for the proof editor at `/dashboard`. */

export function inspector(page: Page): Locator {
  return page.locator("[data-inspector]")
}

export function proofBlocks(page: Page): Locator {
  return page.getByRole("listbox", { name: "Blocks on your page" }).getByRole("option")
}

export async function openEditor(page: Page) {
  await page.goto("/dashboard")
  await expect(page.getByRole("heading", { name: "Page header" })).toBeVisible({ timeout: 15000 })
}

/** Wait until the debounced autosave has gone out and come back. */
export async function waitForSaved(page: Page) {
  await page.waitForTimeout(800)
  await expect(page.locator('[data-save-state="saved"]')).toBeVisible({ timeout: 10000 })
}

/** Open the block picker with Ctrl+K, search for a type and add it. The new block is selected. */
export async function addBlock(page: Page, label: string) {
  // Focus may sit in an inspector field, where "/" types a slash; Ctrl+K works anywhere.
  await page.keyboard.press("Control+k")
  const search = page.getByPlaceholder("Search blocks")
  await expect(search).toBeVisible()
  await search.fill(label)
  await page.getByRole("option", { name: new RegExp(`^${label}\\b`) }).click()
  await expect(search).toBeHidden()
  await expect(inspector(page).getByRole("heading", { name: label, exact: true })).toBeVisible({ timeout: 10000 })
}

/** Delete every block on the page, one by one. */
export async function clearBlocks(page: Page) {
  for (let i = 0; i < 40; i++) {
    const count = await proofBlocks(page).count()
    if (count === 0) break
    await proofBlocks(page).first().click()
    await inspector(page).getByRole("button", { name: "Delete block" }).click()
    await expect(proofBlocks(page)).toHaveCount(count - 1)
  }
  await waitForSaved(page)
}
