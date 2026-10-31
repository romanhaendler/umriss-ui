import { test as base, expect, type Page } from "@playwright/test";
export const test = base.extend<{ logs: string[] }>({
  logs: async ({ page }, use) => {
    const logs: string[] = [];
    page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.type() + ": " + m.text()); });
    page.on("pageerror", (e) => logs.push("pageerror: " + e.message));
    await use(logs);
  },
});
export { expect };
export const go = async (page: Page, s: string, extra = "") => { await page.goto(`/?s=${s}${extra}`); await page.waitForSelector("table, [role=grid], [role=table]"); };
