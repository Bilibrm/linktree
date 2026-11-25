import { defineConfig } from "@playwright/test"

// Checks that need no browser, server or database: `npm run test:themes`.
export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/theme-migration.spec.ts"],
  reporter: "line",
})
