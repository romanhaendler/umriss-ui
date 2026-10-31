/* Overlays where the page is not the library's own: a modal dialog of another
   library, and a pinch-zoomed page. Chromium only: the zoom is a CDP call.

   A foreign modal is made from an example: the trigger moves into a fixed,
   transformed `role="dialog" aria-modal="true"` box, the rest of the page goes
   inert (`pointer-events: none` on the body, as Radix does) and the box closes
   itself on Escape in the document's capture phase - the way Radix does. The
   box stays inside the demo's root, so React still hears the clicks. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme, browserName }) => colorScheme === "dark" || browserName !== "chromium", "Behaviour tests only once (light, Chromium)");

test("A Menu inside a foreign modal is visible, clickable, and Escape closes only the menu", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "menu", "actions");
  await page.evaluate(() => {
    const example = document.querySelector('[data-example="actions"]')!;
    const trigger = [...example.querySelectorAll("button")].find((b) => b.textContent === "Actions")!;
    const box = document.createElement("div");
    box.id = "foreign-modal";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.style.cssText =
      "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:50;background:#fff;padding:24px;pointer-events:auto;width:240px";
    trigger.parentElement!.append(box);
    box.append(trigger);
    document.body.style.pointerEvents = "none";
    (window as unknown as { foreignClosed: number }).foreignClosed = 0;
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") (window as unknown as { foreignClosed: number }).foreignClosed++;
      },
      true,
    );
  });

  await page.getByRole("button", { name: "Actions", exact: true }).click();
  const item = page.getByRole("menuitem", { name: "Copy the link" });
  await expect(item).toBeVisible();
  /* On top and not inert: a click lands on the item, not on the page behind. */
  const point = await item.boundingBox();
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[role="menuitem"]')?.textContent, {
    x: point!.x + point!.width / 2,
    y: point!.y + point!.height / 2,
  });
  expect(hit).toBe("Copy the link");

  await page.keyboard.press("Escape");
  await expect(item).toBeHidden();
  expect(await page.evaluate(() => (window as unknown as { foreignClosed: number }).foreignClosed)).toBe(0);
  await expect(page.locator("#foreign-modal")).toBeVisible();

  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Copy the link" }).click();
  await expect(page.getByText("Last: Link copied")).toBeVisible();
});

test("On a pinch-zoomed page a toast stands inside the visible part", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "toast", "show-a-toast");
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2.5 });
  await page.evaluate(() => new Promise((frame) => requestAnimationFrame(frame)));

  await page.getByRole("button", { name: "Show a toast" }).click({ force: true });
  const region = page.getByRole("region", { name: /Messages/ });
  await expect(region.getByText("Export finished")).toBeVisible();
  await page.waitForTimeout(600);

  const [box, view] = await Promise.all([
    region.boundingBox(),
    page.evaluate(() => ({ x: visualViewport!.offsetLeft, y: visualViewport!.offsetTop, w: visualViewport!.width, h: visualViewport!.height })),
  ]);
  expect(box!.y + box!.height).toBeLessThanOrEqual(view.h + 1);
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(view.w + 1);
});

test("On a pinch-zoomed page a Modal fills the visible part", { tag: "@quick" }, async ({ page }) => {
  await openExample(page, "modal", "a-window");
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2.5 });
  await page.evaluate(() => new Promise((frame) => requestAnimationFrame(frame)));

  await page.locator('[data-example="a-window"] button').first().click({ force: true });
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  const [box, view] = await Promise.all([
    dialog.boundingBox(),
    page.evaluate(() => ({ w: visualViewport!.width, h: visualViewport!.height })),
  ]);
  expect(Math.abs(box!.width - view.w)).toBeLessThan(2);
  expect(Math.abs(box!.height - view.h)).toBeLessThan(2);
});
