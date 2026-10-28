/* `touch-scale.css` is the application's opt-in (ADR-0079): imported before or
   after core's own styles it gives a `md` control 44 px under a finger, and
   without it 32 px. Under the opt-in Tabs grow with the other `md` controls,
   and checkboxes and switches keep their size. The stylesheet is put on the
   page from the file, ahead of core's own `<style>` or after it, with the
   condition `(pointer: coarse)` intact. Chromium only; light only. */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect, type Browser, type Page } from "@playwright/test";
import { addressOf, settle } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });

const SHEET = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "styles", "touch-scale.css"), "utf8");

/** Puts the opt-in on the page before the application's styles (`first`) or after them. */
const withSheet = (page: Page, where: "first" | "last") =>
  page.addInitScript(
    ([css, at]) => {
      const put = () => {
        const style = document.createElement("style");
        style.textContent = css;
        if (at === "first") document.documentElement.prepend(style);
        else document.head.append(style);
      };
      /* An init script runs before the document has a root: "first" waits for
         it and puts the sheet in ahead of the head. */
      if (at === "first") {
        const watch = new MutationObserver(() => {
          if (!document.documentElement) return;
          watch.disconnect();
          put();
        });
        watch.observe(document, { childList: true });
      }
      else addEventListener("DOMContentLoaded", put);
    },
    [SHEET, where] as const,
  );

const open = async (page: Page, pageId: string, exampleId: string) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await page.goto(addressOf(pageId, exampleId));
  await page.evaluate(() => document.fonts.ready);
  await page.locator(`[data-example="${exampleId}"]`).waitFor({ state: "visible" });
  await settle(page);
  return page.locator(`[data-example="${exampleId}"] .exampleStage`);
};

/** A second page, under a finger, with the opt-in imported first. */
const scaledPage = async (browser: Browser) => {
  const page = await browser.newPage({ hasTouch: true, viewport: { width: 375, height: 667 } });
  await withSheet(page, "first");
  return page;
};

for (const where of ["first", "last"] as const) {
  test(`touch-scale.css ${where === "first" ? "before" : "after"} core gives a md Button 44 px`, { tag: "@quick" }, async ({ page }) => {
    await withSheet(page, where);
    const stage = await open(page, "button", "one-action");
    expect((await stage.getByRole("button").first().boundingBox())!.height).toBe(44);
  });
}

test("without the opt-in a md Button is 32 px", { tag: "@quick" }, async ({ page }) => {
  const stage = await open(page, "button", "one-action");
  expect((await stage.getByRole("button").first().boundingBox())!.height).toBe(32);
});

test("Tabs are 32 px without the opt-in and 44 px with it", { tag: "@quick" }, async ({ page, browser }) => {
  const plain = await open(page, "tabs", "one-view-at-a-time");
  expect((await plain.getByRole("tab").first().boundingBox())!.height).toBe(32);
  const scaled = await scaledPage(browser);
  const stage = await open(scaled, "tabs", "one-view-at-a-time");
  expect((await stage.getByRole("tab").first().boundingBox())!.height).toBe(44);
  await scaled.close();
});

for (const [pageId, exampleId, role] of [
  ["checkbox", "checkbox", "checkbox"],
  ["switch", "on-and-off", "switch"],
] as const) {
  test(`a ${role} keeps its box under the opt-in`, async ({ page, browser }) => {
    const before = (await (await open(page, pageId, exampleId)).getByRole(role).first().boundingBox())!;
    const scaled = await scaledPage(browser);
    const after = (await (await open(scaled, pageId, exampleId)).getByRole(role).first().boundingBox())!;
    await scaled.close();
    expect({ w: after.width, h: after.height }).toEqual({ w: before.width, h: before.height });
  });
}
