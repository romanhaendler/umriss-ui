/* The safe area (viewport-fit=cover): the edge surfaces keep clear of the notch
   and the home indicator. A phone is emulated at 375 x 667 with the insets of a
   notched phone set through the DevTools protocol's safe-area override, on a
   page whose viewport says `viewport-fit=cover`. Chromium only: the override
   is a DevTools call. Light only; the geometry is the same in both themes. */

import { test, expect } from "@playwright/test";
import type { CDPSession, Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");
test.use({ viewport: { width: 375, height: 667 } });

const INSETS = { top: 47, bottom: 34, left: 20, right: 20 };
const WIDTH = 375;
const HEIGHT = 667;

/** The page declares `viewport-fit=cover` and the window has the insets. */
async function coverWithInsets(page: Page): Promise<CDPSession> {
  await page.evaluate(() =>
    document.querySelector('meta[name="viewport"]')!.setAttribute("content", "width=device-width, initial-scale=1.0, viewport-fit=cover"),
  );
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: INSETS });
  return cdp;
}

/** The box once every transition and animation under it has ended. */
async function settledBox(locator: Locator) {
  await locator.evaluate((element) =>
    Promise.all(element.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {}))),
  );
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("not laid out");
  return { top: rect.y, bottom: rect.y + rect.height, left: rect.x, right: rect.x + rect.width };
}

test("a bottom toast stands its inset above the bottom inset", async ({ page }) => {
  await openExample(page, "toast", "where-they-stand");
  await coverWithInsets(page);
  await page.getByRole("button", { name: "Bottom center" }).click();
  const region = page.getByRole("region", { name: "Messages (Alt+T)" });
  await expect(region.locator("[data-toast]").first()).toBeVisible();
  const box = await settledBox(region);
  expect(box.bottom).toBeLessThanOrEqual(HEIGHT - INSETS.bottom);
});

test("the full-window Modal's head is below the top inset and its foot above the bottom inset", async ({ page }) => {
  await openExample(page, "modal", "long-content");
  await coverWithInsets(page);
  await page.getByRole("button", { name: "Read the expense policy" }).click();
  const dialog = page.getByRole("dialog", { name: "Expense policy" });
  await expect(dialog).toBeVisible();
  /* Long content: the sheet stands at the full height the insets leave. */
  const sheet = await settledBox(dialog.locator(":scope > div:not([aria-hidden])").first());
  expect(sheet.top).toBeGreaterThanOrEqual(INSETS.top);
  expect(sheet.bottom).toBeLessThanOrEqual(HEIGHT - INSETS.bottom);
  const head = await settledBox(dialog.getByRole("heading", { name: "Expense policy" }));
  expect(head.top).toBeGreaterThanOrEqual(INSETS.top);
  const foot = await settledBox(dialog.getByRole("button", { name: "I have read it" }));
  expect(foot.bottom).toBeLessThanOrEqual(HEIGHT - INSETS.bottom);
});

test("the Drawer stands inside the insets of its edges", async ({ page }) => {
  await openExample(page, "drawer", "a-detail-from-the-edge");
  await coverWithInsets(page);
  await page.getByRole("button", { name: "Show the shipment" }).click();
  const dialog = page.getByRole("dialog", { name: "Shipment SH-1042" });
  await expect(dialog).toBeVisible();
  const sheet = await settledBox(dialog.locator(":scope > div:not([aria-hidden])").first());
  expect(sheet.top).toBeGreaterThanOrEqual(INSETS.top);
  expect(sheet.bottom).toBeLessThanOrEqual(HEIGHT - INSETS.bottom);
  expect(sheet.right).toBeLessThanOrEqual(WIDTH - INSETS.right);
});

test("the full-window palette stands inside the insets", async ({ page }) => {
  await openExample(page, "commandpalette", "commands");
  await coverWithInsets(page);
  await page.getByRole("button", { name: "Open the palette" }).click();
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();
  const pane = await settledBox(dialog.locator(":scope > div").first());
  expect(pane.top).toBeGreaterThanOrEqual(INSETS.top);
  expect(pane.bottom).toBeLessThanOrEqual(HEIGHT - INSETS.bottom);
  expect(pane.left).toBeGreaterThanOrEqual(INSETS.left);
  expect(pane.right).toBeLessThanOrEqual(WIDTH - INSETS.right);
});
